# Utils - Narzędzia i Komponenty

## 📁 Struktura Projektu

### 🔄 Core
- `/core/` - Podstawowe komponenty
  - `constants/` - Stałe aplikacji (limity tokenów, endpointy, etc.)
  - `types/` - Typy TypeScript
    - `api.ts` - Typy dla API
    - `core.ts` - Podstawowe typy
    - `data.ts` - Typy dla operacji na danych
    - `llm.ts` - Typy dla LLM
    - `validation.ts` - Typy walidacji
    - `tasks.ts` - Typy zadań
    - `tests.ts` - Typy testów

### 🔧 API
- `/api/` - Integracje API
  - `clients/`
    - `HttpClient.ts` - Klient HTTP (Axios)
    - `OpenAIClient.ts` - Klient OpenAI
  - `handlers/`
    - `BaseApiHandler.ts` - Bazowy handler API

### 🛠️ Helpers
- `/helpers/` - Funkcje pomocnicze
  - `data/` - Operacje na danych
    - `ArrayProcessor.ts` - Operacje na tablicach
    - `AudioProcessor.ts` - Przetwarzanie audio
    - `FileManager.ts` - Operacje na plikach
    - `JsonProcessor.ts` - Przetwarzanie JSON
    - `TextProcessor.ts` - Przetwarzanie tekstu
    - `VisionProcessor.ts` - Przetwarzanie obrazów
  - `math/`
    - `MathOperations.ts` - Operacje matematyczne
    - `MathValidator.ts` - Walidacja matematyczna
  - `validation/`
    - `KeyValidator.ts` - Walidacja kluczy API
    - `PathValidator.ts` - Walidacja ścieżek
    - `TokenValidator.ts` - Walidacja tokenów

### 🧠 LLM
- `/llm/` - Zarządzanie LLM
  - `cache/`
    - `CacheManager.ts` - System cache
  - `context/`
    - `ContextManager.ts` - Zarządzanie kontekstem
  - `memory/`
    - `MemoryManager.ts` - System pamięci
  - `safety/`
    - `ModerationManager.ts` - Moderacja treści
    - `PromptValidator.ts` - Walidacja promptów
  - `RateLimiter.ts` - Limitowanie żądań
  - `RetryHandler.ts` - Obsługa powtórzeń
  - `SearchEngine.ts` - Silnik wyszukiwania

## 🔑 Zmienne Środowiskowe (.env)
```env
OPENAI_API_KEY=sk-...
PERSONAL_API_KEY=...
LANGFUSE_SECRET_KEY=...
LANGFUSE_PUBLIC_KEY=...
ELEVENLABS_API_KEY=...
GROQ_API_KEY=...
```

## 📦 Zależności (package.json)
```json
{
  "dependencies": {
    "openai": "^4.71.0",
    "axios": "^1.6.2",
    "sharp": "^0.33.5",
    "dotenv": "^16.4.5"
    // ... inne zależności
  }
}
```

## 🚀 Skrypty
```bash
# Instalacja
bun install

# Testy
bun test

# Linting
bun lint

# Sprawdzanie kluczy API
bun run check-keys
```

## 🔌 Integracje
- OpenAI API (GPT-3.5, GPT-4)
- Axios HTTP Client
- Sharp (przetwarzanie obrazów)
- Langfuse (monitoring)
- ElevenLabs (synteza mowy)
- Groq (alternatywne LLM)

## 🛡️ Bezpieczeństwo
- Walidacja kluczy API
- Rate limiting
- Moderacja treści
- Bezpieczne przetwarzanie promptów
- Walidacja tokenów

## 📊 Monitoring
- Śledzenie kosztów API
- Metryki wydajności
- Logi operacji
- Analiza błędów
- Statystyki cache

## 🧪 Testy
- Testy jednostkowe
- Testy integracyjne
- Testy end-to-end
- Testy wydajnościowe

## 📚 Dokumentacja
Szczegółowa dokumentacja znajduje się w `/notes/`:
- `/agents/` - Agenci i orkiestracja
- `/core/` - Architektura i wytyczne
- `/deployment/` - Wdrożenia i monitoring
- `/embeddings/` - Embeddingi i wyszukiwanie
- `/evaluation/` - Ewaluacja modeli
- `/fine_tuning/` - Fine-tuning
- `/integration/` - Integracje RAG
- `/llm/` - Komponenty LLM

## 🔍 Przykłady Użycia

```typescript
// Przykład użycia OpenAI
import { openai } from './api/clients/OpenAIClient';
import { TextProcessor } from './helpers/data/TextProcessor';
import { TokenValidator } from './helpers/validation/TokenValidator';

// Przetwarzanie tekstu
const text = "Długi tekst...";
const chunks = TextProcessor.splitIntoChunks(text, 1000);

// Walidacja tokenów
const validation = TokenValidator.validateOperation(text);

// Użycie LLM
const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Hello!" }]
});
```

## 🤝 Kontrybucje
1. Fork repozytorium
2. Stwórz branch (`git checkout -b feature/amazing_feature`)
3. Commit zmiany (`git commit -m 'Add amazing feature'`)
4. Push do brancha (`git push origin feature/amazing_feature`)
5. Otwórz Pull Request

## 📝 Konwencje
- [Konwencje nazewnictwa](./CONVENTIONS.md)
- [Struktura projektu](./STRUCTURE.md)
- [Wytyczne rozwoju](./GUIDELINES.md)