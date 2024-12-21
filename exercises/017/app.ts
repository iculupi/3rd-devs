import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { CentralaHandler } from '../../utils/api/handlers/CentralaHandler';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { FileManager } from '../../utils/helpers/data/FileManager';

config();

// Interfejsy
interface Answer {
    label: string;
    value: string;
    source?: string;
}

interface PageContent {
    url: string;
    title: string;
    content: string;
    relevantSections: string[];
}

interface CacheData {
    timestamp: string;
    pages: Map<string, PageContent>;
    answers: Answer[];
    lastVerified: Date;
}

// Klasa do analizy treści
class ContentAnalyzer {
    private static readonly RELEVANT_KEYWORDS = [
        'firma', 'produkcja', 'robot', 'automatyzacja', 'system',
        'oprogramowanie', 'fabryka', 'magazyn', 'rozwój', 'technologia'
    ];

    static extractRelevantSections(content: string): string[] {
        const sentences = content.split(/[.!?]+/).map(s => s.trim());
        return sentences.filter(sentence => 
            this.RELEVANT_KEYWORDS.some(keyword => 
                sentence.toLowerCase().includes(keyword)
            )
        );
    }

    static validateAnswer(content: string): boolean {
        const requiredElements = [
            'lokalizacja',
            'system',
            'funkcjonalność',
            'szczegóły'
        ];

        const contentLower = content.toLowerCase();
        return requiredElements.every(element => 
            contentLower.includes(element)
        );
    }
}

class SoftoExplorer {
    private cacheFile: string;
    private fileManager: FileManager;
    private visitedUrls = new Set<string>();
    private pageContents = new Map<string, PageContent>();
    private answers: Answer[] = [];
    private foundContent: string[] = [];

    constructor(
        private baseUrl: string,
        private questions: Record<string, string>
    ) {
        this.fileManager = new FileManager();
        this.cacheFile = path.join(__dirname, 'cache', 'results.json');
    }

    async explore(): Promise<string[]> {
        // 1. Przygotuj plik cache
        await this.fileManager.prepareFile(this.cacheFile);

        // 2. Sprawdź cache
        const cache = await this.loadCache();
        if (cache && this.isCacheValid(cache)) {
            console.log('Using cached results');
            return cache.answers.map(a => a.value);
        }

        // 3. Eksploruj stronę
        await this.processPage(this.baseUrl);

        // 4. Przygotuj odpowiedzi w odpowiedniej kolejności
        const orderedAnswers: string[] = [];
        for (let i = 1; i <= 3; i++) {
            const label = i.toString().padStart(2, '0');
            const answer = this.answers.find(a => a.label === label);
            if (answer) {
                orderedAnswers.push(answer.value);
            }
        }

        // 5. Zapisz do cache'a
        await this.saveCache();

        return orderedAnswers;
    }

    private isCacheValid(cache: CacheData): boolean {
        const cacheAge = Date.now() - new Date(cache.lastVerified).getTime();
        const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 godziny
        return cacheAge < MAX_CACHE_AGE;
    }

    private async loadCache(): Promise<CacheData | null> {
        try {
            const data = await fs.readFile(this.cacheFile, 'utf-8');
            return JSON.parse(data);
        } catch {
            return null;
        }
    }

    private async saveCache(): Promise<void> {
        const cacheData: CacheData = {
            timestamp: new Date().toISOString(),
            pages: this.pageContents,
            answers: this.answers,
            lastVerified: new Date()
        };

        await fs.writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2));
    }

    private async processPage(url: string, depth: number = 0): Promise<void> {
        if (this.visitedUrls.has(url) || depth > 2) return;
        this.visitedUrls.add(url);

        try {
            console.log(`Processing ${url}`);
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            
            // Zbierz tekst z ważnych elementów
            const content = this.extractContent($);
            this.foundContent.push(content);

            // Sprawdź, czy znaleźliśmy odpowiedzi na pytania
            await this.checkForAnswers(content, url);

            // Jeśli nie mamy wszystkich odpowiedzi, sprawdź linki
            if (this.answers.length < 3 && depth < 2) {
                const links = this.extractLinks($);
                for (const link of links) {
                    await this.processPage(link, depth + 1);
                }
            }
        } catch (error) {
            console.error(`Error processing ${url}:`, error);
        }
    }

    private extractContent($: cheerio.CheerioAPI): string {
        // Zbierz tekst z ważnych elementów
        const importantSelectors = [
            'main',
            'article',
            '.content',
            '#content',
            '.about',
            '.info',
            'section'
        ];

        let content = '';
        importantSelectors.forEach(selector => {
            $(selector).each((_, el) => {
                content += $(el).text() + '\n';
            });
        });

        return content || $('body').text();
    }

    private async checkForAnswers(content: string, url: string): Promise<void> {
        for (const [id, question] of Object.entries(this.questions)) {
            // Sprawdź czy już mamy odpowiedź na to pytanie
            if (!this.answers.find(a => a.label === id)) {
                const answer = this.findAnswerInContent(content, question);
                if (answer) {
                    this.answers.push({
                        label: id,
                        value: answer,
                        source: url
                    });
                }
            }
        }
    }

    private findAnswerInContent(content: string, question: string): string | null {
        const paragraphs = content.split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 20);

        for (const paragraph of paragraphs) {
            if (this.isRelevantParagraph(paragraph, question)) {
                return paragraph;
            }
        }

        return null;
    }

    private isRelevantParagraph(paragraph: string, question: string): boolean {
        const keywords = question.toLowerCase()
            .split(' ')
            .filter(word => word.length > 3);

        const paragraphLower = paragraph.toLowerCase();
        return keywords.some(keyword => paragraphLower.includes(keyword));
    }

    private extractLinks($: cheerio.CheerioAPI): string[] {
        const links = new Set<string>();
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href && !href.startsWith('#')) {
                try {
                    const url = new URL(href, this.baseUrl).toString();
                    if (url.startsWith(this.baseUrl) && 
                        !url.includes('trap') && 
                        !url.includes('loop')) {
                        links.add(url);
                    }
                } catch (error) {
                    // Ignoruj nieprawidłowe URL-e
                }
            }
        });
        return Array.from(links);
    }
}

async function main() {
    try {
        // 1. Pobierz pytania
        const centrala = new CentralaHandler(__dirname);
        console.log('Fetching questions...');
        const questions = await centrala.getData('softo.json');
        console.log('Questions:', questions);

        // 2. Eksploruj stronę i znajdź odpowiedzi
        const explorer = new SoftoExplorer('https://softo.ag3nts.org', questions);
        const answers = await explorer.explore();
        console.log('Found answers:', answers);

        // 3. Wyślij odpowiedzi
        console.log('Sending answers...');
        const response = await centrala.sendAndLog({
            task: "softo",
            apikey: process.env.PERSONAL_API_KEY,
            answer: answers
        });

        console.log('Response:', response);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();