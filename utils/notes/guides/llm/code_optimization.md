---
title: Optymalizacja i Refaktoryzacja Kodu z LLM
topics: [Optymalizacja i Refaktoryzacja Kodu z LLM, Optymalizacja Wydajności, 1. Analizator Wydajności, 2. Prompt dla Optymalizacji, Refaktoryzacja, 1. Refaktor Manager, 2. Prompt dla Refaktoryzacji, Dobre Praktyki, 1. Optymalizacja, 2. Refaktoryzacja, 3. Monitorowanie, Przykłady Użycia, 1. Optymalizacja Kodu, 2. Refaktoryzacja, Metryki, 1. Metryki Wydajności, 2. Metryki Jakości]
keywords: [typescript
interface PerformanceAnalyzer {
  // Analiza wydajności
  analyzeComplexity(code: string): ComplexityReport;
  findBottlenecks(code: string): Bottleneck[];
  suggestOptimizations(code: string): Optimization[];
  
  // Profilowanie
  analyzeMemoryUsage(code: string): MemoryProfile;
  analyzeExecutionTime(code: string): TimeProfile;
  suggestCaching(code: string): CachingSuggestion[];
}

interface Optimization {
  location: CodeLocation;
  problem: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
  expectedImprovement: string;
}, typescript
const optimizationPrompts = {
  performanceReview: 
    Analyze this code for performance:
    {{code}}
    
    Consider:
    1. Time complexity
    2. Space complexity
    3. Resource usage
    4. Caching opportunities
    
    Suggest optimizations with:
    - Expected impact
    - Implementation difficulty
    - Potential risks
  ,
  
  memoryOptimization: 
    Review memory usage in:
    {{code}}
    
    Focus on:
    1. Memory leaks
    2. Large allocations
    3. Garbage collection
    4. Resource cleanup
  
};, typescript
interface RefactorManager {
  // Analiza kodu
  identifySmells(code: string): CodeSmell[];
  suggestPatterns(code: string): PatternSuggestion[];
  planRefactoring(code: string): RefactorPlan;
  
  // Refaktoryzacja
  extractMethod(code: string, selection: Selection): Promise<RefactoredCode>;
  renameSymbol(code: string, oldName: string, newName: string): Promise<RefactoredCode>;
  improveReadability(code: string): Promise<RefactoredCode>;
}

interface RefactorPlan {
  steps: RefactorStep[];
  estimatedImpact: ImpactAssessment;
  risks: Risk[];
  testingStrategy: TestPlan;
}, typescript
const refactorPrompts = {
  codeSmellDetection: 
    Analyze this code for smells:
    {{code}}
    
    Look for:
    1. Duplicate code
    2. Long methods
    3. Large classes
    4. Complex conditions
    
    For each smell:
    - Describe the problem
    - Suggest refactoring
    - Provide example
  ,
  
  patternApplication: 
    Suggest design patterns for:
    {{code}}
    
    Consider:
    1. Current structure
    2. Common patterns
    3. SOLID principles
    4. Maintainability
  
};, typescript
async function optimizeCode(sourceCode: string) {
  const analyzer = new PerformanceAnalyzer();
  
  // 1. Analiza wydajności
  const bottlenecks = await analyzer.findBottlenecks(sourceCode);
  
  // 2. Sugestie optymalizacji
  const optimizations = await analyzer.suggestOptimizations(sourceCode);
  
  // 3. Implementacja zmian
  const optimizedCode = await applyOptimizations(sourceCode, optimizations);
  
  return {
    bottlenecks,
    optimizations,
    optimizedCode
  };
}, typescript
async function refactorCode(sourceCode: string) {
  const refactorer = new RefactorManager();
  
  // 1. Analiza kodu
  const smells = await refactorer.identifySmells(sourceCode);
  
  // 2. Plan refaktoryzacji
  const plan = await refactorer.planRefactoring(sourceCode);
  
  // 3. Wykonanie refaktoryzacji
  const refactoredCode = await executeRefactoring(sourceCode, plan);
  
  return {
    smells,
    plan,
    refactoredCode
  };
}, typescript
interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  resourceUtilization: {
    database: number;
    network: number;
    disk: number;
  };
}, typescript
interface QualityMetrics {
  codeComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  testCoverage: number;
}]
lastUpdated: 2024-12-14T02:09:16.831Z


---

# Optymalizacja i Refaktoryzacja Kodu z LLM

## Optymalizacja Wydajności

### 1. Analizator Wydajności
```typescript
interface PerformanceAnalyzer {
  // Analiza wydajności
  analyzeComplexity(code: string): ComplexityReport;
  findBottlenecks(code: string): Bottleneck[];
  suggestOptimizations(code: string): Optimization[];
  
  // Profilowanie
  analyzeMemoryUsage(code: string): MemoryProfile;
  analyzeExecutionTime(code: string): TimeProfile;
  suggestCaching(code: string): CachingSuggestion[];
}

interface Optimization {
  location: CodeLocation;
  problem: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
  expectedImprovement: string;
}
```

### 2. Prompt dla Optymalizacji
```typescript
const optimizationPrompts = {
  performanceReview: `
    Analyze this code for performance:
    {{code}}
    
    Consider:
    1. Time complexity
    2. Space complexity
    3. Resource usage
    4. Caching opportunities
    
    Suggest optimizations with:
    - Expected impact
    - Implementation difficulty
    - Potential risks
  `,
  
  memoryOptimization: `
    Review memory usage in:
    {{code}}
    
    Focus on:
    1. Memory leaks
    2. Large allocations
    3. Garbage collection
    4. Resource cleanup
  `
};
```

## Refaktoryzacja

### 1. Refaktor Manager
```typescript
interface RefactorManager {
  // Analiza kodu
  identifySmells(code: string): CodeSmell[];
  suggestPatterns(code: string): PatternSuggestion[];
  planRefactoring(code: string): RefactorPlan;
  
  // Refaktoryzacja
  extractMethod(code: string, selection: Selection): Promise<RefactoredCode>;
  renameSymbol(code: string, oldName: string, newName: string): Promise<RefactoredCode>;
  improveReadability(code: string): Promise<RefactoredCode>;
}

interface RefactorPlan {
  steps: RefactorStep[];
  estimatedImpact: ImpactAssessment;
  risks: Risk[];
  testingStrategy: TestPlan;
}
```

### 2. Prompt dla Refaktoryzacji
```typescript
const refactorPrompts = {
  codeSmellDetection: `
    Analyze this code for smells:
    {{code}}
    
    Look for:
    1. Duplicate code
    2. Long methods
    3. Large classes
    4. Complex conditions
    
    For each smell:
    - Describe the problem
    - Suggest refactoring
    - Provide example
  `,
  
  patternApplication: `
    Suggest design patterns for:
    {{code}}
    
    Consider:
    1. Current structure
    2. Common patterns
    3. SOLID principles
    4. Maintainability
  `
};
```

## Dobre Praktyki

### 1. Optymalizacja
- Mierz przed optymalizacją
- Optymalizuj wąskie gardła
- Zachowaj czytelność kodu
- Dokumentuj zmiany wydajnościowe

### 2. Refaktoryzacja
- Małe, inkrementalne zmiany
- Pełne pokrycie testami
- Zachowanie funkcjonalności
- Code review zmian

### 3. Monitorowanie
- Metryki wydajności
- Jakość kodu
- Pokrycie testami
- Feedback użytkowników

## Przykłady Użycia

### 1. Optymalizacja Kodu
```typescript
async function optimizeCode(sourceCode: string) {
  const analyzer = new PerformanceAnalyzer();
  
  // 1. Analiza wydajności
  const bottlenecks = await analyzer.findBottlenecks(sourceCode);
  
  // 2. Sugestie optymalizacji
  const optimizations = await analyzer.suggestOptimizations(sourceCode);
  
  // 3. Implementacja zmian
  const optimizedCode = await applyOptimizations(sourceCode, optimizations);
  
  return {
    bottlenecks,
    optimizations,
    optimizedCode
  };
}
```

### 2. Refaktoryzacja
```typescript
async function refactorCode(sourceCode: string) {
  const refactorer = new RefactorManager();
  
  // 1. Analiza kodu
  const smells = await refactorer.identifySmells(sourceCode);
  
  // 2. Plan refaktoryzacji
  const plan = await refactorer.planRefactoring(sourceCode);
  
  // 3. Wykonanie refaktoryzacji
  const refactoredCode = await executeRefactoring(sourceCode, plan);
  
  return {
    smells,
    plan,
    refactoredCode
  };
}
```

## Metryki

### 1. Metryki Wydajności
```typescript
interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  resourceUtilization: {
    database: number;
    network: number;
    disk: number;
  };
}
```

### 2. Metryki Jakości
```typescript
interface QualityMetrics {
  codeComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  testCoverage: number;
}
``` 