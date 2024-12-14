---
title: Zarządzanie Kontekstem w RAG
topics: [Zarządzanie Kontekstem w RAG, Podstawowa Architektura, 1. Context Manager, 2. Tokenizer Manager, Strategie Zarządzania, 1. Context Selection, 2. Context Optimization, Implementacja, 1. Context Pipeline, Dobre Praktyki, 1. Zarządzanie Tokenami, 2. Jakość Kontekstu, 3. Optymalizacja, Metryki i Monitoring, 1. Context Metrics, 2. Performance Monitoring]
keywords: [typescript
interface ContextManager {
  // Podstawowe operacje
  prepareContext(documents: Document[], query: string): Promise<Context>;
  optimizeContext(context: Context): Promise<Context>;
  validateContext(context: Context): ValidationResult;
  
  // Zaawansowane operacje
  mergeContexts(contexts: Context[]): Promise<Context>;
  splitContext(context: Context): Context[];
  updateContext(context: Context, newInfo: any): Promise<Context>;
}

interface Context {
  content: string;
  documents: Document[];
  metadata: ContextMetadata;
  stats: ContextStats;
}, typescript
interface TokenManager {
  // Operacje na tokenach
  countTokens(text: string): number;
  truncateToFit(text: string, maxTokens: number): string;
  optimizeTokenUsage(context: Context, limit: number): Context;
  
  // Konfiguracja
  config: {
    model: string;
    maxContextLength: number;
    truncationStrategy: TruncationStrategy;
  };
}, typescript
class ContextSelector {
  private tokenizer: TokenManager;
  private ranker: DocumentRanker;
  
  async selectOptimalContext(
    documents: Document[],
    query: string,
    maxTokens: number
  ): Promise<Context> {
    // 1. Ranking dokumentów
    const ranked = await this.ranker.rankByRelevance(documents, query);
    
    // 2. Selekcja z uwzględnieniem limitów
    const selected = this.selectWithinTokenLimit(ranked, maxTokens);
    
    // 3. Optymalizacja kontekstu
    return this.optimizeSelectedContext(selected, query);
  }
  
  private selectWithinTokenLimit(
    docs: Document[],
    maxTokens: number
  ): Document[] {
    let currentTokens = 0;
    const selected: Document[] = [];
    
    for (const doc of docs) {
      const tokens = this.tokenizer.countTokens(doc.content);
      if (currentTokens + tokens <= maxTokens) {
        selected.push(doc);
        currentTokens += tokens;
      } else {
        break;
      }
    }
    
    return selected;
  }
}, typescript
class ContextOptimizer {
  private summarizer: TextSummarizer;
  private merger: ContextMerger;
  
  async optimize(context: Context): Promise<Context> {
    // 1. Usuwanie redundancji
    const deduplicated = await this.removeDuplicates(context);
    
    // 2. Kompresja treści
    const compressed = await this.compressContent(deduplicated);
    
    // 3. Restrukturyzacja
    return this.restructureContext(compressed);
  }
  
  private async compressContent(
    context: Context
  ): Promise<Context> {
    const summary = await this.summarizer.summarize(
      context.content,
      {
        preserveKeyInfo: true,
        maxLength: context.config.maxLength
      }
    );
    
    return {
      ...context,
      content: summary,
      metadata: {
        ...context.metadata,
        compressed: true
      }
    };
  }
}, typescript
class ContextPipeline {
  private selector: ContextSelector;
  private optimizer: ContextOptimizer;
  private validator: ContextValidator;
  
  async processContext(
    documents: Document[],
    query: string
  ): Promise<Context> {
    // 1. Selekcja kontekstu
    const selected = await this.selector.selectOptimalContext(
      documents,
      query,
      this.config.maxTokens
    );
    
    // 2. Optymalizacja
    const optimized = await this.optimizer.optimize(selected);
    
    // 3. Walidacja
    const validated = await this.validator.validate(optimized);
    
    if (!validated.isValid) {
      throw new ContextValidationError(validated.errors);
    }
    
    return optimized;
  }
}, typescript
interface ContextMetrics {
  // Metryki rozmiaru
  tokenCount: number;
  compressionRatio: number;
  contextSize: number;
  
  // Metryki jakości
  relevanceScore: number;
  coherenceScore: number;
  coverageScore: number;
}, typescript
interface ContextMonitoring {
  // Wydajność
  processingTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  
  // Jakość
  contextQuality: {
    accuracy: number;
    completeness: number;
    freshness: number;
  };
}]
lastUpdated: 2024-12-14T02:09:16.833Z


---

# Zarządzanie Kontekstem w RAG

## Podstawowa Architektura

### 1. Context Manager
```typescript
interface ContextManager {
  // Podstawowe operacje
  prepareContext(documents: Document[], query: string): Promise<Context>;
  optimizeContext(context: Context): Promise<Context>;
  validateContext(context: Context): ValidationResult;
  
  // Zaawansowane operacje
  mergeContexts(contexts: Context[]): Promise<Context>;
  splitContext(context: Context): Context[];
  updateContext(context: Context, newInfo: any): Promise<Context>;
}

interface Context {
  content: string;
  documents: Document[];
  metadata: ContextMetadata;
  stats: ContextStats;
}
```

### 2. Tokenizer Manager
```typescript
interface TokenManager {
  // Operacje na tokenach
  countTokens(text: string): number;
  truncateToFit(text: string, maxTokens: number): string;
  optimizeTokenUsage(context: Context, limit: number): Context;
  
  // Konfiguracja
  config: {
    model: string;
    maxContextLength: number;
    truncationStrategy: TruncationStrategy;
  };
}
```

## Strategie Zarządzania

### 1. Context Selection
```typescript
class ContextSelector {
  private tokenizer: TokenManager;
  private ranker: DocumentRanker;
  
  async selectOptimalContext(
    documents: Document[],
    query: string,
    maxTokens: number
  ): Promise<Context> {
    // 1. Ranking dokumentów
    const ranked = await this.ranker.rankByRelevance(documents, query);
    
    // 2. Selekcja z uwzględnieniem limitów
    const selected = this.selectWithinTokenLimit(ranked, maxTokens);
    
    // 3. Optymalizacja kontekstu
    return this.optimizeSelectedContext(selected, query);
  }
  
  private selectWithinTokenLimit(
    docs: Document[],
    maxTokens: number
  ): Document[] {
    let currentTokens = 0;
    const selected: Document[] = [];
    
    for (const doc of docs) {
      const tokens = this.tokenizer.countTokens(doc.content);
      if (currentTokens + tokens <= maxTokens) {
        selected.push(doc);
        currentTokens += tokens;
      } else {
        break;
      }
    }
    
    return selected;
  }
}
```

### 2. Context Optimization
```typescript
class ContextOptimizer {
  private summarizer: TextSummarizer;
  private merger: ContextMerger;
  
  async optimize(context: Context): Promise<Context> {
    // 1. Usuwanie redundancji
    const deduplicated = await this.removeDuplicates(context);
    
    // 2. Kompresja treści
    const compressed = await this.compressContent(deduplicated);
    
    // 3. Restrukturyzacja
    return this.restructureContext(compressed);
  }
  
  private async compressContent(
    context: Context
  ): Promise<Context> {
    const summary = await this.summarizer.summarize(
      context.content,
      {
        preserveKeyInfo: true,
        maxLength: context.config.maxLength
      }
    );
    
    return {
      ...context,
      content: summary,
      metadata: {
        ...context.metadata,
        compressed: true
      }
    };
  }
}
```

## Implementacja

### 1. Context Pipeline
```typescript
class ContextPipeline {
  private selector: ContextSelector;
  private optimizer: ContextOptimizer;
  private validator: ContextValidator;
  
  async processContext(
    documents: Document[],
    query: string
  ): Promise<Context> {
    // 1. Selekcja kontekstu
    const selected = await this.selector.selectOptimalContext(
      documents,
      query,
      this.config.maxTokens
    );
    
    // 2. Optymalizacja
    const optimized = await this.optimizer.optimize(selected);
    
    // 3. Walidacja
    const validated = await this.validator.validate(optimized);
    
    if (!validated.isValid) {
      throw new ContextValidationError(validated.errors);
    }
    
    return optimized;
  }
}
```

## Dobre Praktyki

### 1. Zarządzanie Tokenami
- Monitorowanie limitów
- Inteligentne truncation
- Optymalizacja wykorzystania
- Zachowanie spójności

### 2. Jakość Kontekstu
- Relevance scoring
- Deduplication
- Spójność informacji
- Walidacja źródeł

### 3. Optymalizacja
- Caching kontekstu
- Inkrementalne updates
- Kompresja danych
- Priorytetyzacja informacji

## Metryki i Monitoring

### 1. Context Metrics
```typescript
interface ContextMetrics {
  // Metryki rozmiaru
  tokenCount: number;
  compressionRatio: number;
  contextSize: number;
  
  // Metryki jakości
  relevanceScore: number;
  coherenceScore: number;
  coverageScore: number;
}
```

### 2. Performance Monitoring
```typescript
interface ContextMonitoring {
  // Wydajność
  processingTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  
  // Jakość
  contextQuality: {
    accuracy: number;
    completeness: number;
    freshness: number;
  };
}
``` 