---
title: Utils dla AI_devs 3
topics: [Utils dla AI_devs 3, Struktura Katalogów, Managery LLM, 1. Memory Manager, 2. Cost Manager, 3. Safety Manager, 4. Rate Limit Manager, 5. Cache Manager, 6. Context Manager, 7. Search Manager, 8. Embedding Manager, Dobre Praktyki, Przykład Użycia]
keywords: [utils/
  ├── llm/              # Managery do pracy z LLM
  ├── database/         # Integracje z bazami danych
  ├── api/              # Handlery API
  └── helpers/          # Funkcje pomocnicze, typescript
const memoryManager = new LLMMemoryManager();
const costManager = new LLMCostManager();
const safetyManager = new PromptSafetyManager();

// Przykład przetwarzania promptu
async function processPrompt(prompt: string) {
  // 1. Sprawdź bezpieczeństwo
  if (!safetyManager.validatePrompt(prompt)) {
    throw new Error('Unsafe prompt');
  }

  // 2. Sprawdź dostępne tokeny
  const tokens = memoryManager.getAvailableTokens();
  
  // 3. Sprawdź koszty
  const cost = costManager.estimateCost(tokens);
  
  // 4. Przetwórz prompt
  // ...
}]
lastUpdated: 2024-12-14T02:09:16.827Z


---

# Utils dla AI_devs 3

## Struktura Katalogów
```
utils/
  ├── llm/              # Managery do pracy z LLM
  ├── database/         # Integracje z bazami danych
  ├── api/              # Handlery API
  └── helpers/          # Funkcje pomocnicze
```

## Managery LLM

### 1. Memory Manager
- Zarządzanie pamięcią krótkoterminową (konwersacje)
- Zarządzanie pamięcią długoterminową (kontekst)
- Optymalizacja tokenów

### 2. Cost Manager
- Śledzenie kosztów per model
- Limity budżetowe
- Raportowanie użycia

### 3. Safety Manager
- Walidacja promptów
- Ochrona przed prompt injection
- Moderacja treści

### 4. Rate Limit Manager
- Limity requestów
- Limity tokenów
- Kolejkowanie żądań

### 5. Cache Manager
- Cache'owanie odpowiedzi
- TTL dla cache'u
- Statystyki wykorzystania

### 6. Context Manager
- Zarządzanie dokumentami
- Chunking tekstu
- Formatowanie kontekstu

### 7. Search Manager
- Integracja z wyszukiwarkami
- Formatowanie wyników
- Przygotowanie kontekstu

### 8. Embedding Manager
- Zarządzanie wektorami
- Podobieństwo cosinusowe
- Przetwarzanie wsadowe

## Dobre Praktyki
1. Zawsze używaj typów TypeScript
2. Dodawaj testy jednostkowe
3. Dokumentuj kod i API
4. Obsługuj błędy i edge cases
5. Monitoruj wydajność

## Przykład Użycia
```typescript
const memoryManager = new LLMMemoryManager();
const costManager = new LLMCostManager();
const safetyManager = new PromptSafetyManager();

// Przykład przetwarzania promptu
async function processPrompt(prompt: string) {
  // 1. Sprawdź bezpieczeństwo
  if (!safetyManager.validatePrompt(prompt)) {
    throw new Error('Unsafe prompt');
  }

  // 2. Sprawdź dostępne tokeny
  const tokens = memoryManager.getAvailableTokens();
  
  // 3. Sprawdź koszty
  const cost = costManager.estimateCost(tokens);
  
  // 4. Przetwórz prompt
  // ...
}
``` 