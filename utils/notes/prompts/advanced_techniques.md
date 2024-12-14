# Zaawansowane Techniki Promptowania

## Chain-of-Thought

### 1. Struktura CoT
```typescript
interface ChainOfThought {
  // Elementy
  steps: ThoughtStep[];
  reasoning: string;
  conclusion: string;
  
  // Metadane
  confidence: number;
  validationPath: string[];
}

interface ThoughtStep {
  id: number;
  thought: string;
  evidence: string[];
  nextSteps: number[];
}
```

### 2. Implementacja
```typescript
class CoTPromptBuilder {
  buildPrompt(query: string, context: string): string {
    return `
      Question: ${query}
      
      Let's approach this step by step:
      1. First, let's understand what we're looking for
      2. Then, analyze the provided context
      3. Break down the problem into parts
      4. Solve each part systematically
      5. Combine the findings
      
      Context:
      ${context}
      
      Reasoning:
    `;
  }
}
```

## Few-Shot Learning

### 1. Example Manager
```typescript
interface ExampleManager {
  // Zarządzanie przykładami
  addExample(example: Example): void;
  selectRelevant(query: string, count: number): Example[];
  generateSimilar(example: Example): Example[];
  
  // Konfiguracja
  config: {
    maxExamples: number;
    similarityThreshold: number;
    format: string;
  };
}
```

### 2. Przykłady Implementacji
```typescript
class FewShotPrompt {
  private examples: Example[];
  
  formatExamples(): string {
    return this.examples
      .map(ex => `
        Input: ${ex.input}
        Reasoning: ${ex.reasoning}
        Output: ${ex.output}
        ---
      `)
      .join('\n');
  }
  
  buildPrompt(query: string): string {
    return `
      Here are some examples:
      ${this.formatExamples()}
      
      Now, solve this:
      Input: ${query}
      Reasoning:
    `;
  }
}
```

## Self-Consistency

### 1. Walidacja
```typescript
interface ConsistencyChecker {
  // Walidacja
  checkConsistency(responses: string[]): ConsistencyResult;
  validateAgainstContext(response: string, context: string): boolean;
  
  // Analiza
  analyzeVariations(responses: string[]): VariationAnalysis;
  suggestImprovements(analysis: VariationAnalysis): string[];
}
```

### 2. Implementacja
```typescript
class SelfConsistentPrompt {
  async generateConsistentResponse(
    query: string,
    context: string
  ): Promise<string> {
    // 1. Generowanie wielu odpowiedzi
    const responses = await this.generateMultiple(query, context);
    
    // 2. Analiza spójności
    const analysis = this.checker.analyzeVariations(responses);
    
    // 3. Wybór najlepszej odpowiedzi
    return this.selectBestResponse(responses, analysis);
  }
}
```

## Iterative Refinement

### 1. Struktura
```typescript
interface IterativePrompt {
  // Iteracje
  initialPrompt: string;
  refinements: Refinement[];
  
  // Konfiguracja
  config: {
    maxIterations: number;
    improvementThreshold: number;
    stopCondition: StopCondition;
  };
}
```

### 2. Implementacja
```typescript
class IterativePromptRefiner {
  async refineResponse(
    initialResponse: string,
    context: string
  ): Promise<string> {
    let currentResponse = initialResponse;
    
    for (let i = 0; i < this.config.maxIterations; i++) {
      // 1. Analiza odpowiedzi
      const analysis = await this.analyzeResponse(currentResponse);
      
      // 2. Generowanie ulepszeń
      const improvements = this.generateImprovements(analysis);
      
      // 3. Aplikacja ulepszeń
      currentResponse = await this.applyImprovements(
        currentResponse,
        improvements
      );
      
      // 4. Sprawdzenie warunku stopu
      if (this.shouldStop(currentResponse, analysis)) {
        break;
      }
    }
    
    return currentResponse;
  }
}
```

## Dobre Praktyki

### 1. Projektowanie
- Jasna struktura myślenia
- Spójne przykłady
- Iteracyjne ulepszanie
- Walidacja wyników

### 2. Optymalizacja
- Zarządzanie złożonością
- Efektywne przykłady
- Kontrola jakości
- Monitoring wyników

## Metryki

### 1. Wydajność
```typescript
interface AdvancedPromptMetrics {
  // Metryki procesu
  iterationCount: number;
  refinementTime: number;
  consistencyScore: number;
  
  // Metryki jakości
  reasoningQuality: number;
  exampleRelevance: number;
  improvementRate: number;
}
```

### 2. Monitoring
```typescript
interface TechniqueEffectiveness {
  // Skuteczność technik
  chainOfThought: {
    accuracy: number;
    completeness: number;
  };
  
  fewShot: {
    exampleUtility: number;
    transferSuccess: number;
  };
  
  selfConsistency: {
    variationQuality: number;
    consensusRate: number;
  };
}
``` 