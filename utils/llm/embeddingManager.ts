interface EmbeddingConfig {
  dimensions: number;
  model: string;
  batchSize: number;
  similarityThreshold: number;
}

interface EmbeddingVector {
  id: string;
  vector: number[];
  metadata?: Record<string, any>;
}

export class EmbeddingManager {
  private config: EmbeddingConfig;
  private vectors: EmbeddingVector[] = [];

  constructor(config: EmbeddingConfig) {
    this.config = config;
  }

  // Dodaj wektor do kolekcji
  addVector(vector: EmbeddingVector): void {
    if (vector.vector.length !== this.config.dimensions) {
      throw new Error(`Vector must have ${this.config.dimensions} dimensions`);
    }
    this.vectors.push(vector);
  }

  // Oblicz podobieństwo cosinusowe między dwoma wektorami
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Znajdź najbardziej podobne wektory
  findSimilar(queryVector: number[], limit: number = 5): EmbeddingVector[] {
    return this.vectors
      .map(vector => ({
        ...vector,
        similarity: this.cosineSimilarity(queryVector, vector.vector)
      }))
      .filter(result => result.similarity >= this.config.similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Przetwarzaj dokumenty wsadowo
  async processBatch<T>(
    items: T[],
    embedFn: (item: T) => Promise<number[]>
  ): Promise<void> {
    for (let i = 0; i < items.length; i += this.config.batchSize) {
      const batch = items.slice(i, i + this.config.batchSize);
      const embeddings = await Promise.all(batch.map(embedFn));
      
      embeddings.forEach((vector, index) => {
        this.addVector({
          id: `${i + index}`,
          vector,
          metadata: { originalItem: batch[index] }
        });
      });

      // Opcjonalne opóźnienie między partiami
      if (i + this.config.batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Eksportuj wektory (np. do zapisania w bazie)
  exportVectors(): EmbeddingVector[] {
    return [...this.vectors];
  }

  // Wyczyść kolekcję wektorów
  clear(): void {
    this.vectors = [];
  }
} 