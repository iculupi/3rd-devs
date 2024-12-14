---
title: Integracje LLM z Bazami Danych
topics: [Integracje LLM z Bazami Danych, Architektury Integracji, 1. Adaptery Baz Danych, 2. Zarządzanie Danymi, Implementacja, 1. Natural Language to SQL, 2. Bezpieczne Wykonanie, Przykłady Użycia, 1. Naturalne Zapytania, 2. Synchronizacja Danych, Dobre Praktyki, 1. Bezpieczeństwo, 2. Wydajność, 3. Integracja, Metryki i Monitoring, 1. Wydajność Zapytań, 2. Monitoring Systemu]
keywords: [typescript
interface DatabaseAdapter {
  // Podstawowe operacje
  query(sql: string, params?: any[]): Promise<QueryResult>;
  execute(sql: string, params?: any[]): Promise<ExecuteResult>;
  
  // Zaawansowane operacje
  transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T>;
  stream(sql: string, params?: any[]): ReadableStream<any>;
}

interface QueryBuilder {
  // Budowanie zapytań
  buildQuery(intent: string): Promise<string>;
  validateQuery(sql: string): ValidationResult;
  optimizeQuery(sql: string): string;
}, typescript
interface DataManager {
  // Operacje na danych
  fetchContext(query: string): Promise<Context[]>;
  updateEmbeddings(data: any[]): Promise<void>;
  syncData(source: DataSource, target: DataTarget): Promise<SyncResult>;
  
  // Cache i optymalizacja
  cacheResults(key: string, data: any): Promise<void>;
  invalidateCache(pattern: string): Promise<void>;
}, typescript
interface NLtoSQL {
  // Konwersja
  translateToSQL(question: string): Promise<SQLQuery>;
  explainQuery(sql: string): Promise<QueryExplanation>;
  validateSemantics(sql: string): ValidationResult;
  
  // Optymalizacja
  suggestIndexes(sql: string): Index[];
  optimizeJoins(sql: string): string;
}

interface SQLGenerator {
  // Generowanie SQL
  generateSelect(intent: string): Promise<SelectQuery>;
  generateUpdate(changes: DataChanges): Promise<UpdateQuery>;
  generateSchema(description: string): Promise<SchemaDefinition>;
}, typescript
class SafeQueryExecutor {
  private validator: QueryValidator;
  private executor: QueryExecutor;
  
  async executeQuery(query: string): Promise<QueryResult> {
    // 1. Walidacja
    const validation = await this.validator.validateQuery(query);
    if (!validation.isValid) {
      throw new QueryValidationError(validation.errors);
    }
    
    // 2. Sanityzacja
    const safeQuery = this.validator.sanitizeQuery(query);
    
    // 3. Wykonanie z limitem
    return await this.executor.executeWithLimits(safeQuery, {
      timeout: 5000,
      maxRows: 1000
    });
  }
}, typescript
async function naturalLanguageQuery(question: string) {
  const nlToSql = new NLtoSQL();
  const executor = new SafeQueryExecutor();
  
  // 1. Konwersja na SQL
  const sql = await nlToSql.translateToSQL(question);
  
  // 2. Walidacja i optymalizacja
  const optimized = await nlToSql.optimizeJoins(sql);
  
  // 3. Bezpieczne wykonanie
  const results = await executor.executeQuery(optimized);
  
  // 4. Formatowanie wyników
  return {
    sql: optimized,
    results: results.rows,
    explanation: await nlToSql.explainQuery(optimized)
  };
}, typescript
async function syncDatabaseWithLLM() {
  const dataManager = new DataManager();
  const embeddingManager = new EmbeddingManager();
  
  // 1. Pobranie zmian
  const changes = await dataManager.fetchChanges({
    since: lastSync,
    tables: ['products', 'customers']
  });
  
  // 2. Aktualizacja embeddingów
  for (const change of changes) {
    const embedding = await embeddingManager.generateEmbedding(
      change.content
    );
    await dataManager.updateEmbeddings([{
      id: change.id,
      embedding,
      metadata: change
    }]);
  }
  
  // 3. Aktualizacja cache
  await dataManager.invalidateCache('products:');
}, typescript
interface QueryMetrics {
  executionTime: number;
  rowsAffected: number;
  cacheHits: number;
  indexUsage: {
    index: string;
    usage: number;
  }[];
}, typescript
interface DatabaseMetrics {
  connectionPool: {
    active: number;
    idle: number;
    waiting: number;
  };
  queryStats: {
    totalQueries: number;
    avgResponseTime: number;
    errorRate: number;
  };
  cacheStats: {
    hitRate: number;
    size: number;
    invalidations: number;
  };
}]
lastUpdated: 2024-12-14T02:09:16.831Z


---

# Integracje LLM z Bazami Danych

## Architektury Integracji

### 1. Adaptery Baz Danych
```typescript
interface DatabaseAdapter {
  // Podstawowe operacje
  query(sql: string, params?: any[]): Promise<QueryResult>;
  execute(sql: string, params?: any[]): Promise<ExecuteResult>;
  
  // Zaawansowane operacje
  transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T>;
  stream(sql: string, params?: any[]): ReadableStream<any>;
}

interface QueryBuilder {
  // Budowanie zapytań
  buildQuery(intent: string): Promise<string>;
  validateQuery(sql: string): ValidationResult;
  optimizeQuery(sql: string): string;
}
```

### 2. Zarządzanie Danymi
```typescript
interface DataManager {
  // Operacje na danych
  fetchContext(query: string): Promise<Context[]>;
  updateEmbeddings(data: any[]): Promise<void>;
  syncData(source: DataSource, target: DataTarget): Promise<SyncResult>;
  
  // Cache i optymalizacja
  cacheResults(key: string, data: any): Promise<void>;
  invalidateCache(pattern: string): Promise<void>;
}
```

## Implementacja

### 1. Natural Language to SQL
```typescript
interface NLtoSQL {
  // Konwersja
  translateToSQL(question: string): Promise<SQLQuery>;
  explainQuery(sql: string): Promise<QueryExplanation>;
  validateSemantics(sql: string): ValidationResult;
  
  // Optymalizacja
  suggestIndexes(sql: string): Index[];
  optimizeJoins(sql: string): string;
}

interface SQLGenerator {
  // Generowanie SQL
  generateSelect(intent: string): Promise<SelectQuery>;
  generateUpdate(changes: DataChanges): Promise<UpdateQuery>;
  generateSchema(description: string): Promise<SchemaDefinition>;
}
```

### 2. Bezpieczne Wykonanie
```typescript
class SafeQueryExecutor {
  private validator: QueryValidator;
  private executor: QueryExecutor;
  
  async executeQuery(query: string): Promise<QueryResult> {
    // 1. Walidacja
    const validation = await this.validator.validateQuery(query);
    if (!validation.isValid) {
      throw new QueryValidationError(validation.errors);
    }
    
    // 2. Sanityzacja
    const safeQuery = this.validator.sanitizeQuery(query);
    
    // 3. Wykonanie z limitem
    return await this.executor.executeWithLimits(safeQuery, {
      timeout: 5000,
      maxRows: 1000
    });
  }
}
```

## Przykłady Użycia

### 1. Naturalne Zapytania
```typescript
async function naturalLanguageQuery(question: string) {
  const nlToSql = new NLtoSQL();
  const executor = new SafeQueryExecutor();
  
  // 1. Konwersja na SQL
  const sql = await nlToSql.translateToSQL(question);
  
  // 2. Walidacja i optymalizacja
  const optimized = await nlToSql.optimizeJoins(sql);
  
  // 3. Bezpieczne wykonanie
  const results = await executor.executeQuery(optimized);
  
  // 4. Formatowanie wyników
  return {
    sql: optimized,
    results: results.rows,
    explanation: await nlToSql.explainQuery(optimized)
  };
}
```

### 2. Synchronizacja Danych
```typescript
async function syncDatabaseWithLLM() {
  const dataManager = new DataManager();
  const embeddingManager = new EmbeddingManager();
  
  // 1. Pobranie zmian
  const changes = await dataManager.fetchChanges({
    since: lastSync,
    tables: ['products', 'customers']
  });
  
  // 2. Aktualizacja embeddingów
  for (const change of changes) {
    const embedding = await embeddingManager.generateEmbedding(
      change.content
    );
    await dataManager.updateEmbeddings([{
      id: change.id,
      embedding,
      metadata: change
    }]);
  }
  
  // 3. Aktualizacja cache
  await dataManager.invalidateCache('products:*');
}
```

## Dobre Praktyki

### 1. Bezpieczeństwo
- Walidacja zapytań
- Parametryzacja
- Limity wykonania
- Monitoring dostępu

### 2. Wydajność
- Indeksowanie
- Caching
- Query optimization
- Connection pooling

### 3. Integracja
- Transakcje atomowe
- Spójność danych
- Obsługa błędów
- Logowanie operacji

## Metryki i Monitoring

### 1. Wydajność Zapytań
```typescript
interface QueryMetrics {
  executionTime: number;
  rowsAffected: number;
  cacheHits: number;
  indexUsage: {
    index: string;
    usage: number;
  }[];
}
```

### 2. Monitoring Systemu
```typescript
interface DatabaseMetrics {
  connectionPool: {
    active: number;
    idle: number;
    waiting: number;
  };
  queryStats: {
    totalQueries: number;
    avgResponseTime: number;
    errorRate: number;
  };
  cacheStats: {
    hitRate: number;
    size: number;
    invalidations: number;
  };
}
``` 