---
title: Wyszukiwanie Semantyczne i Embeddingi
topics: [Wyszukiwanie Semantyczne i Embeddingi, Podstawowe Koncepcje, 1. Embeddingi, 2. Vector Store, Implementacja, 1. Chunking i Preprocessing, 2. Wyszukiwanie, Przykłady Użycia, 1. Przygotowanie Danych, 2. Wyszukiwanie, Dobre Praktyki, 1. Przygotowanie Danych, 2. Wyszukiwanie, 3. Wydajność, Metryki i Monitoring, 1. Metryki Wyszukiwania, 2. Monitoring Systemu]
keywords: [typescript
interface EmbeddingManager {
  // Generowanie embeddingów
  generateEmbedding(text: string): Promise<number[]>;
  batchGenerateEmbeddings(texts: string[]): Promise<number[][]>;
  
  // Operacje na embeddingach
  calculateSimilarity(embedding1: number[], embedding2: number[]): number;
  findNearest(query: number[], corpus: number[][], k: number): NearestResult[];
}

interface EmbeddingConfig {
  model: string;          // np. 'text-embedding-ada-002'
  dimensions: number;     // np. 1536 dla Ada
  normalizeVectors: boolean;
  cachingStrategy: CachingStrategy;
}, typescript
interface VectorStore {
  // Podstawowe operacje
  insert(id: string, vector: number[], metadata?: any): Promise<void>;
  search(queryVector: number[], limit: number): Promise<SearchResult[]>;
  delete(id: string): Promise<void>;
  update(id: string, vector: number[]): Promise<void>;
  
  // Zaawansowane operacje
  batchInsert(vectors: VectorData[]): Promise<void>;
  searchByMetadata(query: MetadataQuery): Promise<SearchResult[]>;
  createIndex(config: IndexConfig): Promise<void>;
}, typescript
interface TextProcessor {
  // Chunking
  splitIntoChunks(text: string, options: ChunkOptions): TextChunk[];
  optimizeChunkSize(text: string): number;
  
  // Preprocessing
  cleanText(text: string): string;
  extractKeyPhrases(text: string): string[];
  normalizeText(text: string): string;
}

interface ChunkOptions {
  maxTokens: number;
  overlap: number;
  splitBy: 'sentence' | 'paragraph' | 'token';
}, typescript
interface SemanticSearch {
  // Wyszukiwanie
  search(query: string, options: SearchOptions): Promise<SearchResult[]>;
  hybridSearch(query: string): Promise<HybridResult[]>;
  
  // Filtrowanie i ranking
  rerank(results: SearchResult[]): Promise<SearchResult[]>;
  filterByMetadata(results: SearchResult[], filters: MetadataFilter[]): SearchResult[];
}, typescript
async function prepareDocuments(documents: Document[]) {
  const processor = new TextProcessor();
  const embeddingManager = new EmbeddingManager();
  
  // 1. Przetwarzanie tekstu
  const chunks = documents.flatMap(doc => 
    processor.splitIntoChunks(doc.content, {
      maxTokens: 512,
      overlap: 50,
      splitBy: 'paragraph'
    })
  );
  
  // 2. Generowanie embeddingów
  const embeddings = await embeddingManager.batchGenerateEmbeddings(
    chunks.map(chunk => chunk.text)
  );
  
  // 3. Zapisywanie do vector store
  await vectorStore.batchInsert(
    chunks.map((chunk, i) => ({
      id: chunk.id,
      vector: embeddings[i],
      metadata: chunk.metadata
    }))
  );
}, typescript
async function semanticSearch(query: string) {
  const searchManager = new SemanticSearch();
  
  // 1. Wyszukiwanie semantyczne
  const results = await searchManager.search(query, {
    limit: 5,
    minScore: 0.7,
    filters: {
      language: 'pl',
      date: { $gt: '2023-01-01' }
    }
  });
  
  // 2. Reranking wyników
  const reranked = await searchManager.rerank(results);
  
  return reranked;
}, typescript
interface SearchMetrics {
  accuracy: number;
  recall: number;
  precision: number;
  meanReciprocalRank: number;
  queryLatency: number;
}, typescript
interface SystemMetrics {
  vectorStoreSize: number;
  indexingLatency: number;
  cacheHitRate: number;
  errorRate: number;
}]
lastUpdated: 2024-12-14T02:09:16.828Z


---

# Wyszukiwanie Semantyczne i Embeddingi

## Podstawowe Koncepcje

### 1. Embeddingi
```typescript
interface EmbeddingManager {
  // Generowanie embeddingów
  generateEmbedding(text: string): Promise<number[]>;
  batchGenerateEmbeddings(texts: string[]): Promise<number[][]>;
  
  // Operacje na embeddingach
  calculateSimilarity(embedding1: number[], embedding2: number[]): number;
  findNearest(query: number[], corpus: number[][], k: number): NearestResult[];
}

interface EmbeddingConfig {
  model: string;          // np. 'text-embedding-ada-002'
  dimensions: number;     // np. 1536 dla Ada
  normalizeVectors: boolean;
  cachingStrategy: CachingStrategy;
}
```

### 2. Vector Store
```typescript
interface VectorStore {
  // Podstawowe operacje
  insert(id: string, vector: number[], metadata?: any): Promise<void>;
  search(queryVector: number[], limit: number): Promise<SearchResult[]>;
  delete(id: string): Promise<void>;
  update(id: string, vector: number[]): Promise<void>;
  
  // Zaawansowane operacje
  batchInsert(vectors: VectorData[]): Promise<void>;
  searchByMetadata(query: MetadataQuery): Promise<SearchResult[]>;
  createIndex(config: IndexConfig): Promise<void>;
}
```

## Implementacja

### 1. Chunking i Preprocessing
```typescript
interface TextProcessor {
  // Chunking
  splitIntoChunks(text: string, options: ChunkOptions): TextChunk[];
  optimizeChunkSize(text: string): number;
  
  // Preprocessing
  cleanText(text: string): string;
  extractKeyPhrases(text: string): string[];
  normalizeText(text: string): string;
}

interface ChunkOptions {
  maxTokens: number;
  overlap: number;
  splitBy: 'sentence' | 'paragraph' | 'token';
}
```

### 2. Wyszukiwanie
```typescript
interface SemanticSearch {
  // Wyszukiwanie
  search(query: string, options: SearchOptions): Promise<SearchResult[]>;
  hybridSearch(query: string): Promise<HybridResult[]>;
  
  // Filtrowanie i ranking
  rerank(results: SearchResult[]): Promise<SearchResult[]>;
  filterByMetadata(results: SearchResult[], filters: MetadataFilter[]): SearchResult[];
}
```

## Przykłady Użycia

### 1. Przygotowanie Danych
```typescript
async function prepareDocuments(documents: Document[]) {
  const processor = new TextProcessor();
  const embeddingManager = new EmbeddingManager();
  
  // 1. Przetwarzanie tekstu
  const chunks = documents.flatMap(doc => 
    processor.splitIntoChunks(doc.content, {
      maxTokens: 512,
      overlap: 50,
      splitBy: 'paragraph'
    })
  );
  
  // 2. Generowanie embeddingów
  const embeddings = await embeddingManager.batchGenerateEmbeddings(
    chunks.map(chunk => chunk.text)
  );
  
  // 3. Zapisywanie do vector store
  await vectorStore.batchInsert(
    chunks.map((chunk, i) => ({
      id: chunk.id,
      vector: embeddings[i],
      metadata: chunk.metadata
    }))
  );
}
```

### 2. Wyszukiwanie
```typescript
async function semanticSearch(query: string) {
  const searchManager = new SemanticSearch();
  
  // 1. Wyszukiwanie semantyczne
  const results = await searchManager.search(query, {
    limit: 5,
    minScore: 0.7,
    filters: {
      language: 'pl',
      date: { $gt: '2023-01-01' }
    }
  });
  
  // 2. Reranking wyników
  const reranked = await searchManager.rerank(results);
  
  return reranked;
}
```

## Dobre Praktyki

### 1. Przygotowanie Danych
- Odpowiedni rozmiar chunków
- Zachowanie kontekstu
- Czyszczenie i normalizacja tekstu
- Metadata dla filtrowania

### 2. Wyszukiwanie
- Hybrydowe podejście (semantic + keyword)
- Reranking wyników
- Filtrowanie metadanych
- Caching popularnych zapytań

### 3. Wydajność
- Optymalizacja rozmiaru wektorów
- Indeksowanie
- Batch processing
- Monitoring wydajności

## Metryki i Monitoring

### 1. Metryki Wyszukiwania
```typescript
interface SearchMetrics {
  accuracy: number;
  recall: number;
  precision: number;
  meanReciprocalRank: number;
  queryLatency: number;
}
```

### 2. Monitoring Systemu
```typescript
interface SystemMetrics {
  vectorStoreSize: number;
  indexingLatency: number;
  cacheHitRate: number;
  errorRate: number;
}
``` 