interface Document {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

export class ContextManager {
  private documents: Document[] = [];
  private maxContextLength: number;

  constructor(maxContextLength: number = 4000) {
    this.maxContextLength = maxContextLength;
  }

  addDocument(doc: Document): void {
    this.documents.push(doc);
  }

  // Wybierz najbardziej odpowiednie dokumenty do kontekstu
  async getRelevantContext(query: string, maxDocs: number = 3): Promise<string> {
    // Tu można dodać integrację z vector DB (np. Qdrant)
    // Na razie zwracamy prosty kontekst
    return this.documents
      .slice(0, maxDocs)
      .map(doc => doc.content)
      .join('\n\n');
  }

  // Formatuj kontekst dla LLM
  formatContext(context: string): string {
    return `
Relevant context:
---
${context}
---

Use the above context to answer the question. If the context doesn't contain relevant information, say so.
`;
  }

  // Podziel długi tekst na mniejsze fragmenty
  splitIntoChunks(text: string, chunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    let current = '';
    
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if ((current + sentence).length > chunkSize) {
        chunks.push(current);
        current = sentence;
      } else {
        current += sentence;
      }
    }
    
    if (current) {
      chunks.push(current);
    }
    
    return chunks;
  }
} 