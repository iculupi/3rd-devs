# Utils - Narzędzia i Dokumentacja

## Struktura Projektu

```
utils/
├── api/                 # Integracje z API
├── calculators/         # Narzędzia obliczeniowe
├── constants/          # Stałe i konfiguracje
├── helpers/            # Funkcje pomocnicze
├── llm/                # Integracje z modelami LLM
├── notes/              # Dokumentacja techniczna
└── prompts/            # Szablony promptów
```

## Dokumentacja Techniczna

### Podstawy
1. [Narzędzia i Integracje](./notes/tools_and_integrations.md)
   - IDE Integracje
   - Narzędzia CLI
   - Platformy i Serwisy

2. [Analiza i Generowanie Kodu](./notes/code_analysis_generation.md)
   - Statyczna Analiza
   - Code Review
   - Generowanie Kodu
   - Testowanie

3. [Debugowanie i Testowanie](./notes/debugging_testing.md)
   - Asystent Debugowania
   - Generatory Testów
   - Analiza Błędów
   - Metryki Jakości

### Zaawansowane Tematy
4. [Optymalizacja i Refaktoryzacja](./notes/code_optimization.md)
   - Analiza Wydajności
   - Refaktoryzacja
   - Metryki
   - Dobre Praktyki

5. [Wyszukiwanie Semantyczne](./notes/semantic_search.md)
   - Embeddingi
   - Vector Store
   - Chunking
   - Preprocessing

6. [RAG Systems](./notes/rag_systems.md)
   - Architektura RAG
   - Retrieval
   - Generacja
   - Optymalizacja

### Specjalistyczne Zagadnienia
7. [Fine-tuning Modeli](./notes/model_fine_tuning.md)
   - Przygotowanie Danych
   - Trening
   - Ewaluacja
   - Monitoring

8. [Zaawansowany Prompt Engineering](./notes/advanced_prompting.md)
   - Struktury Promptów
   - Chain-of-Thought
   - Few-Shot Learning
   - Optymalizacja

9. [Bezpieczeństwo i Moderacja](./notes/security_moderation.md)
   - Systemy Moderacji
   - Filtry Bezpieczeństwa
   - Audyt
   - Compliance

### Integracje
10. [Integracje z Bazami Danych](./notes/database_integrations.md)
    - Adaptery
    - Natural Language to SQL
    - Bezpieczne Zapytania
    - Synchronizacja

11. [Streaming i WebSocket](./notes/streaming_websockets.md)
    - Stream Manager
    - WebSocket Handler
    - Implementacje
    - Monitoring

## Narzędzia

### API
- `axios.ts` - Konfiguracja klienta HTTP
- `baseApi.ts` - Podstawowa klasa API
- `openai.ts` - Integracja z OpenAI

### Helpers
- `arrayUtils.ts` - Operacje na tablicach
- `fileUtils.ts` - Operacje na plikach
- `textSplitter.ts` - Dzielenie tekstu
- `tokenCounter.ts` - Liczenie tokenów
- `mathUtils.ts` - Funkcje matematyczne
- `logManager.ts` - System logowania

### Kalkulatory
- `mathFixer.ts` - Naprawianie wyrażeń matematycznych

## Użycie

```typescript
import { TokenCounter } from './helpers/tokenCounter';
import { TextSplitter } from './helpers/textSplitter';
import { OpenAIApi } from './api/openai';

// Przykład użycia
const tokenCounter = new TokenCounter();
const textSplitter = new TextSplitter();
const openai = new OpenAIApi();
```

## Rozwój Projektu

1. Dokumentacja
   - Aktualizuj notatki przy zmianach
   - Dodawaj przykłady użycia
   - Utrzymuj spójność interfejsów

2. Testowanie
   - Pisz testy jednostkowe
   - Dokumentuj edge cases
   - Monitoruj wydajność

3. Bezpieczeństwo
   - Waliduj inputy
   - Zabezpieczaj API
   - Loguj operacje

## Licencja
MIT