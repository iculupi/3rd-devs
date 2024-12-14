# Fine-tuning Modeli LLM

## Podstawowe Koncepcje

### 1. Przygotowanie Danych
```typescript
interface TrainingData {
  // Struktury danych
  type DataFormat = 'jsonl' | 'csv' | 'parquet';
  type DataSplit = 'train' | 'validation' | 'test';
  
  // Interfejsy
  interface Dataset {
    prepare(data: RawData): Promise<ProcessedData>;
    validate(data: ProcessedData): ValidationResult;
    split(data: ProcessedData): Record<DataSplit, ProcessedData>;
  }
  
  interface DataExample {
    prompt: string;
    completion: string;
    metadata?: Record<string, any>;
  }
}
```

### 2. Konfiguracja Fine-tuningu
```typescript
interface FineTuningConfig {
  // Podstawowe parametry
  model: string;              // np. 'gpt-3.5-turbo'
  epochs: number;
  batchSize: number;
  learningRate: number;
  
  // Zaawansowane parametry
  warmupSteps: number;
  weightDecay: number;
  evaluationStrategy: 'steps' | 'epoch';
  savingStrategy: 'steps' | 'epoch';
}
```

## Implementacja

### 1. Manager Fine-tuningu
```typescript
interface FineTuningManager {
  // Przygotowanie
  prepareData(rawData: RawData[]): Promise<ProcessedData>;
  validateData(data: ProcessedData): ValidationResult;
  
  // Trening
  startTraining(config: FineTuningConfig): Promise<TrainingJob>;
  monitorProgress(jobId: string): Promise<TrainingStatus>;
  
  // Ewaluacja
  evaluateModel(modelId: string): Promise<EvaluationResult>;
  compareModels(models: string[]): Promise<ComparisonResult>;
}
```

### 2. Monitoring i Ewaluacja
```typescript
interface TrainingMonitor {
  // Metryki treningu
  trackMetrics(jobId: string): Promise<TrainingMetrics>;
  detectIssues(metrics: TrainingMetrics): Issue[];
  
  // Walidacja
  validateResults(predictions: Prediction[]): ValidationResult;
  generateReport(jobId: string): TrainingReport;
}
```

## Przykłady Użycia

### 1. Podstawowy Fine-tuning
```typescript
async function basicFineTuning(data: RawData[]) {
  const manager = new FineTuningManager();
  
  // 1. Przygotowanie danych
  const processedData = await manager.prepareData(data);
  const validation = await manager.validateData(processedData);
  
  if (!validation.isValid) {
    throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
  }
  
  // 2. Konfiguracja treningu
  const config: FineTuningConfig = {
    model: 'gpt-3.5-turbo',
    epochs: 3,
    batchSize: 8,
    learningRate: 1e-5
  };
  
  // 3. Start treningu
  const job = await manager.startTraining(config);
  
  // 4. Monitoring
  const status = await manager.monitorProgress(job.id);
  
  return status;
}
```

### 2. Zaawansowany Fine-tuning
```typescript
async function advancedFineTuning(data: RawData[]) {
  const manager = new FineTuningManager();
  const monitor = new TrainingMonitor();
  
  // 1. Przygotowanie danych z walidacją
  const processedData = await manager.prepareData(data);
  const { train, validation, test } = processedData.split([0.7, 0.15, 0.15]);
  
  // 2. Zaawansowana konfiguracja
  const config: FineTuningConfig = {
    model: 'gpt-3.5-turbo',
    epochs: 5,
    batchSize: 16,
    learningRate: 2e-5,
    warmupSteps: 100,
    weightDecay: 0.01,
    evaluationStrategy: 'steps',
    savingStrategy: 'epoch'
  };
  
  // 3. Training z monitoringiem
  const job = await manager.startTraining(config);
  
  // 4. Monitoring i early stopping
  const metrics = await monitor.trackMetrics(job.id);
  const issues = monitor.detectIssues(metrics);
  
  if (issues.length > 0) {
    await job.stop();
    throw new Error(`Training issues detected: ${issues.join(', ')}`);
  }
  
  // 5. Ewaluacja
  const evaluation = await manager.evaluateModel(job.modelId);
  
  return {
    model: job.modelId,
    metrics,
    evaluation
  };
}
```

## Dobre Praktyki

### 1. Przygotowanie Danych
- Dokładne czyszczenie danych
- Balansowanie datasetu
- Walidacja formatów
- Spójność przykładów

### 2. Trening
- Monitoring metryk
- Early stopping
- Checkpointing
- Walidacja krzyżowa

### 3. Ewaluacja
- Testy na niezależnym zbiorze
- Porównanie z baseline
- Testy regresji
- Analiza błędów

## Metryki i Monitoring

### 1. Metryki Treningu
```typescript
interface TrainingMetrics {
  loss: number;
  accuracy: number;
  perplexity: number;
  learningRate: number;
  epochProgress: number;
  examples: {
    processed: number;
    total: number;
  };
}
```

### 2. Metryki Ewaluacji
```typescript
interface EvaluationMetrics {
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  customMetrics: Record<string, number>;
}
``` 