---
title: Podstawy Embeddingów
topics: [Podstawy Embeddingów, Koncepcje Podstawowe, 1. Embeddingi, 2. Manager Embeddingów, Implementacja, 1. Generowanie Embeddingów, 2. Podobieństwo Wektorów, Przykłady Użycia, 1. Podstawowe Operacje, Dobre Praktyki, 1. Przygotowanie Tekstu, 2. Optymalizacja, 3. Bezpieczeństwo, Metryki i Monitoring, 1. Wydajność, 2. Walidacja]
keywords: [typescript
interface Embedding {
  // Reprezentacja wektorowa
  vector: number[];
  dimensions: number;
  model: string;  // np. 'text-embedding-ada-002'
  
  // Metadane
  text: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}, typescript
interface EmbeddingManager {
  // Generowanie
  generateEmbedding(text: string): Promise<Embedding>;
  batchGenerate(texts: string[]): Promise<Embedding[]>;
  
  // Operacje
  normalize(vector: number[]): number[];
  concatenate(embeddings: Embedding[]): Embedding;
  average(embeddings: Embedding[]): Embedding;
}, typescript
class OpenAIEmbedding implements EmbeddingManager {
  private model: string;
  
  async generateEmbedding(text: string): Promise<Embedding> {
    // 1. Przygotowanie tekstu
    const cleanText = this.preprocessText(text);
    
    // 2. Generowanie embeddingu
    const response = await openai.embeddings.create({
      model: this.model,
      input: cleanText
    });
    
    // 3. Normalizacja i metadane
    return {
      vector: this.normalize(response.data[0].embedding),
      dimensions: response.data[0].embedding.length,
      model: this.model,
      text: cleanText,
      timestamp: new Date()
    };
  }
}, typescript
class VectorSimilarity {
  // Podobieństwo cosinusowe
  static cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val  b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val  val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val  val, 0));
    return dotProduct / (magnitudeA  magnitudeB);
  }
  
  // Odległość euklidesowa
  static euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  }
}, typescript
async function basicEmbeddingOperations() {
  const manager = new OpenAIEmbedding();
  
  // 1. Generowanie pojedynczego embeddingu
  const embedding = await manager.generateEmbedding(
    "Przykładowy tekst do wektoryzacji"
  );
  
  // 2. Generowanie wielu embeddingów
  const embeddings = await manager.batchGenerate([
    "Pierwszy tekst",
    "Drugi tekst",
    "Trzeci tekst"
  ]);
  
  // 3. Porównanie podobieństwa
  const similarity = VectorSimilarity.cosineSimilarity(
    embeddings[0].vector,
    embeddings[1].vector
  );
  
  return { embedding, embeddings, similarity };
}, typescript
interface EmbeddingMetrics {
  // Metryki czasowe
  generationTime: number;
  processingTime: number;
  
  // Metryki jakościowe
  vectorQuality: number;
  errorRate: number;
  
  // Wykorzystanie
  tokenCount: number;
  apiCalls: number;
}, typescript
interface EmbeddingValidation {
  // Walidacja wektorów
  validateDimensions(embedding: Embedding): boolean;
  validateRange(vector: number[]): boolean;
  validateNormalization(vector: number[]): boolean;
  
  // Walidacja metadanych
  validateMetadata(embedding: Embedding): ValidationResult;
}]
lastUpdated: 2024-12-14T02:09:16.834Z


---

# Podstawy Embeddingów

## Koncepcje Podstawowe

### 1. Embeddingi
```typescript
interface Embedding {
  // Reprezentacja wektorowa
  vector: number[];
  dimensions: number;
  model: string;  // np. 'text-embedding-ada-002'
  
  // Metadane
  text: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### 2. Manager Embeddingów
```typescript
interface EmbeddingManager {
  // Generowanie
  generateEmbedding(text: string): Promise<Embedding>;
  batchGenerate(texts: string[]): Promise<Embedding[]>;
  
  // Operacje
  normalize(vector: number[]): number[];
  concatenate(embeddings: Embedding[]): Embedding;
  average(embeddings: Embedding[]): Embedding;
}
```

## Implementacja

### 1. Generowanie Embeddingów
```typescript
class OpenAIEmbedding implements EmbeddingManager {
  private model: string;
  
  async generateEmbedding(text: string): Promise<Embedding> {
    // 1. Przygotowanie tekstu
    const cleanText = this.preprocessText(text);
    
    // 2. Generowanie embeddingu
    const response = await openai.embeddings.create({
      model: this.model,
      input: cleanText
    });
    
    // 3. Normalizacja i metadane
    return {
      vector: this.normalize(response.data[0].embedding),
      dimensions: response.data[0].embedding.length,
      model: this.model,
      text: cleanText,
      timestamp: new Date()
    };
  }
}
```

### 2. Podobieństwo Wektorów
```typescript
class VectorSimilarity {
  // Podobieństwo cosinusowe
  static cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  // Odległość euklidesowa
  static euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  }
}
```

## Przykłady Użycia

### 1. Podstawowe Operacje
```typescript
async function basicEmbeddingOperations() {
  const manager = new OpenAIEmbedding();
  
  // 1. Generowanie pojedynczego embeddingu
  const embedding = await manager.generateEmbedding(
    "Przykładowy tekst do wektoryzacji"
  );
  
  // 2. Generowanie wielu embeddingów
  const embeddings = await manager.batchGenerate([
    "Pierwszy tekst",
    "Drugi tekst",
    "Trzeci tekst"
  ]);
  
  // 3. Porównanie podobieństwa
  const similarity = VectorSimilarity.cosineSimilarity(
    embeddings[0].vector,
    embeddings[1].vector
  );
  
  return { embedding, embeddings, similarity };
}
```

## Dobre Praktyki

### 1. Przygotowanie Tekstu
- Czyszczenie i normalizacja
- Usuwanie zbędnych znaków
- Standaryzacja formatowania
- Obsługa różnych języków

### 2. Optymalizacja
- Batch processing
- Caching wyników
- Kompresja wektorów
- Monitoring wykorzystania

### 3. Bezpieczeństwo
- Walidacja inputu
- Szyfrowanie wrażliwych danych
- Rate limiting
- Logowanie operacji

## Metryki i Monitoring

### 1. Wydajność
```typescript
interface EmbeddingMetrics {
  // Metryki czasowe
  generationTime: number;
  processingTime: number;
  
  // Metryki jakościowe
  vectorQuality: number;
  errorRate: number;
  
  // Wykorzystanie
  tokenCount: number;
  apiCalls: number;
}
```

### 2. Walidacja
```typescript
interface EmbeddingValidation {
  // Walidacja wektorów
  validateDimensions(embedding: Embedding): boolean;
  validateRange(vector: number[]): boolean;
  validateNormalization(vector: number[]): boolean;
  
  // Walidacja metadanych
  validateMetadata(embedding: Embedding): ValidationResult;
}
``` 