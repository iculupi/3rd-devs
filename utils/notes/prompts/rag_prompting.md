# Prompty dla RAG (Retrieval Augmented Generation)

## Struktura Promptów

### 1. Podstawowy Format
```typescript
interface RAGPrompt {
  // Elementy promptu
  context: string;
  query: string;
  instructions: string;
  examples: Example[];
  
  // Metadane
  metadata: {
    maxTokens: number;
    temperature: number;
    format: string;
  };
}
```

### 2. Szablony Promptów
```typescript
const RAG_TEMPLATES = {
  questionAnswering: `
    Context:
    {context}
    
    Question:
    {query}
    
    Instructions:
    - Answer based only on the provided context
    - If unsure, say "I'm not sure"
    - Cite relevant sources
    
    Answer:
  `,
  
  summarization: `
    Documents to summarize:
    {context}
    
    Task:
    Create a concise summary focusing on {query}
    
    Format:
    - Key points
    - Supporting details
    - Sources
  `
};
```

## Implementacja

### 1. Prompt Manager
```typescript
class RAGPromptManager {
  private templates: Map<string, string>;
  private tokenizer: Tokenizer;
  
  async preparePrompt(
    type: PromptType,
    context: string,
    query: string
  ): Promise<string> {
    // 1. Wybór szablonu
    const template = this.templates.get(type);
    
    // 2. Walidacja długości
    const truncatedContext = await this.truncateContext(
      context,
      this.config.maxTokens
    );
    
    // 3. Formatowanie
    return template
      .replace('{context}', truncatedContext)
      .replace('{query}', query);
  }
}
```

### 2. Context Formatter
```typescript
class ContextFormatter {
  formatContext(documents: Document[]): string {
    return documents
      .map((doc, index) => `
        [Source ${index + 1}]
        ${doc.content}
        Reference: ${doc.metadata.source}
        ---
      `)
      .join('\n');
  }
  
  formatSources(sources: Source[]): string {
    return sources
      .map(source => `[${source.id}] ${source.title}`)
      .join('\n');
  }
}
```

## Dobre Praktyki

### 1. Projektowanie Promptów
- Jasne instrukcje
- Przykłady użycia
- Formatowanie odpowiedzi
- Obsługa edge cases

### 2. Optymalizacja
- Zarządzanie tokenami
- Priorytetyzacja kontekstu
- Walidacja odpowiedzi
- Iteracyjne ulepszanie

### 3. Kontrola Jakości
- Testowanie promptów
- Monitorowanie wyników
- Zbieranie feedbacku
- Aktualizacja szablonów

## Przykłady Użycia

### 1. Question Answering
```typescript
const qaPrompt = new RAGPromptManager();

const response = await qaPrompt.generate({
  type: 'questionAnswering',
  context: relevantDocuments,
  query: userQuestion,
  config: {
    maxTokens: 2000,
    temperature: 0.7
  }
});
```

### 2. Summarization
```typescript
const summaryPrompt = new RAGPromptManager();

const summary = await summaryPrompt.generate({
  type: 'summarization',
  context: documentCollection,
  query: 'key findings and recommendations',
  config: {
    maxTokens: 1500,
    temperature: 0.3
  }
});
```

## Metryki i Monitoring

### 1. Prompt Metrics
```typescript
interface PromptMetrics {
  // Wydajność
  tokenUsage: number;
  responseTime: number;
  
  // Jakość
  relevanceScore: number;
  accuracyScore: number;
  completenessScore: number;
}
```

### 2. Quality Monitoring
```typescript
interface PromptQuality {
  // Metryki jakościowe
  clarity: number;
  consistency: number;
  sourceCitations: number;
  
  // Feedback
  userRating: number;
  improvements: string[];
}
``` 