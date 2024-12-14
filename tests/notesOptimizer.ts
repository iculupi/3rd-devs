import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { glob } from 'glob';

// Typy
interface Analysis {
  topics: string[];
  keywords: string[];
  relations: string[];
  summary: string;
}

interface Metadata {
  title: string;
  topics: string[];
  keywords: string[];
  relatedNotes: string[];
  lastUpdated: string;
  season?: number;
  episode?: number;
}

interface Note {
  path: string;
  content: string;
  metadata?: Metadata;
}

interface OptimizationResult {
  optimizedNotes: Note[];
  statistics: {
    totalNotes: number;
    updatedNotes: number;
    addedMetadata: number;
    addedLinks: number;
  };
  suggestions: string[];
}

// Główna klasa optymalizatora
class NotesOptimizer implements NoteOptimizer {
  private readonly notesDir: string;
  
  constructor(baseDir: string = 'utils/notes') {
    this.notesDir = join(process.cwd(), baseDir);
  }

  // Analiza zawartości notatki
  async analyzeContent(content: string): Promise<Analysis> {
    // Ekstrakcja tematów z nagłówków
    const topics = this.extractTopics(content);
    
    // Ekstrakcja słów kluczowych z treści
    const keywords = this.extractKeywords(content);
    
    // Znalezienie powiązań z innymi notatkami
    const relations = await this.findRelations(content);
    
    // Generowanie podsumowania
    const summary = this.generateSummary(content);

    return { topics, keywords, relations, summary };
  }

  // Generowanie metadanych
  async generateMetadata(analysis: Analysis): Promise<Metadata> {
    const title = this.extractTitle(analysis.topics);
    const seasonEpisode = this.extractSeasonEpisode(title);

    return {
      title,
      topics: analysis.topics,
      keywords: analysis.keywords,
      relatedNotes: analysis.relations,
      lastUpdated: new Date().toISOString(),
      ...seasonEpisode
    };
  }

  // Optymalizacja struktury notatek
  async optimizeStructure(notes: Note[]): Promise<OptimizationResult> {
    const statistics = {
      totalNotes: notes.length,
      updatedNotes: 0,
      addedMetadata: 0,
      addedLinks: 0
    };

    const suggestions: string[] = [];
    const optimizedNotes: Note[] = [];

    for (const note of notes) {
      try {
        // Analiza zawartości
        const analysis = await this.analyzeContent(note.content);
        
        // Generowanie metadanych
        const metadata = await this.generateMetadata(analysis);
        
        // Dodawanie linków do powiązanych notatek
        const contentWithLinks = await this.addRelatedLinks(note.content, analysis.relations);
        
        // Formatowanie notatki z metadanymi
        const optimizedContent = this.formatNoteWithMetadata(contentWithLinks, metadata);
        
        optimizedNotes.push({
          ...note,
          content: optimizedContent,
          metadata
        });

        statistics.updatedNotes++;
        if (!note.metadata) statistics.addedMetadata++;
        if (analysis.relations.length > 0) statistics.addedLinks += analysis.relations.length;

      } catch (error) {
        suggestions.push(`Problem with note ${note.path}: ${error.message}`);
      }
    }

    return { optimizedNotes, statistics, suggestions };
  }

  // Pomocnicze metody
  private extractTopics(content: string): string[] {
    const headings = content.match(/^#{1,3}\s+(.+)$/gm) || [];
    return headings.map(h => h.replace(/^#{1,3}\s+/, '').trim());
  }

  private extractKeywords(content: string): string[] {
    // Ekstrakcja słów kluczowych z kodu i ważnych terminów
    const codeBlocks = content.match(/```[\s\S]+?```/g) || [];
    const terms = content.match(/\*\*([^*]+)\*\*/g) || [];
    
    return [...codeBlocks, ...terms]
      .map(item => item.replace(/[`*]/g, '').trim())
      .filter(Boolean);
  }

  private async findRelations(content: string): Promise<string[]> {
    // Szukanie linków do innych notatek
    const links = content.match(/\[([^\]]+)\]\(([^)]+\.md)\)/g) || [];
    return links.map(link => {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      return match ? match[2] : '';
    }).filter(Boolean);
  }

  private generateSummary(content: string): string {
    // Generowanie krótkiego podsumowania z pierwszego akapitu
    const firstParagraph = content.split('\n\n')[0];
    return firstParagraph.replace(/^#\s+/, '').trim();
  }

  private extractTitle(topics: string[]): string {
    return topics[0] || 'Untitled Note';
  }

  private extractSeasonEpisode(title: string): { season?: number; episode?: number } {
    const match = title.match(/S(\d+)E(\d+)/i);
    if (match) {
      return {
        season: parseInt(match[1], 10),
        episode: parseInt(match[2], 10)
      };
    }
    return {};
  }

  private async addRelatedLinks(content: string, relations: string[]): Promise<string> {
    if (relations.length === 0) return content;

    const relatedSection = `\n\n## Powiązane Notatki\n${
      relations.map(rel => `- [${this.getNoteName(rel)}](${rel})`).join('\n')
    }\n`;

    return `${content}${relatedSection}`;
  }

  private getNoteName(path: string): string {
    return path.split('/').pop()?.replace('.md', '') || path;
  }

  private formatNoteWithMetadata(content: string, metadata: Metadata): string {
    const metadataYaml = `---
title: ${metadata.title}
topics: [${metadata.topics.join(', ')}]
keywords: [${metadata.keywords.join(', ')}]
lastUpdated: ${metadata.lastUpdated}
${metadata.season ? `season: ${metadata.season}` : ''}
${metadata.episode ? `episode: ${metadata.episode}` : ''}
---

`;

    return `${metadataYaml}${content}`;
  }

  // Metoda do uruchomienia optymalizacji
  async optimize(): Promise<OptimizationResult> {
    // Znalezienie wszystkich plików .md
    const files = await glob('**/*.md', { cwd: this.notesDir });
    
    // Wczytanie zawartości notatek
    const notes: Note[] = await Promise.all(
      files.map(async file => ({
        path: file,
        content: await readFile(join(this.notesDir, file), 'utf-8')
      }))
    );

    // Optymalizacja
    const result = await this.optimizeStructure(notes);

    // Zapisanie zoptymalizowanych notatek
    await Promise.all(
      result.optimizedNotes.map(note =>
        writeFile(join(this.notesDir, note.path), note.content)
      )
    );

    return result;
  }
}

// Uruchomienie optymalizacji
async function main() {
  try {
    console.log('Starting notes optimization...');
    const optimizer = new NotesOptimizer();
    const result = await optimizer.optimize();
    
    console.log('\nOptimization completed!');
    console.log('\nStatistics:');
    console.log(result.statistics);
    
    if (result.suggestions.length > 0) {
      console.log('\nSuggestions:');
      result.suggestions.forEach(s => console.log(`- ${s}`));
    }
  } catch (error) {
    console.error('Error during optimization:', error);
  }
}

main();