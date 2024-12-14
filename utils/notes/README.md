# AI_devs 3 - Dokumentacja Projektu

## 📁 Struktura Projektu

### 🔧 Utils
Narzędzia i komponenty wielokrotnego użytku:
- `utils/api/` - Integracje z zewnętrznymi API
- `utils/helpers/` - Funkcje pomocnicze
- `utils/tasks/` - Bazowe klasy zadań
- `utils/testers/` - Narzędzia do testowania
- `utils/types/` - Definicje TypeScript
- `utils/prompts/` - Szablony promptów i system messages

### 📝 Notes
Dokumentacja techniczna i instrukcje:
- `notes/api_integrations.md` - Integracje z zewnętrznymi API
- `notes/developer_tools.md` - Narzędzia deweloperskie
- `notes/monitoring_analytics.md` - Monitoring i analityka

### ✍️ Exercises
Zadania i ćwiczenia:
- `exercises/001/` - Interakcja z modelem
- `exercises/002/` - Weryfikacja robotów
- `exercises/003/` - Kalibracja JSON
- ...

## 🎯 Metaprompt dla Nowych Zadań

```typescript
interface TaskContext {
    name: string;               // Nazwa zadania
    description: string;        // Krótki opis
    difficulty: 1 | 2 | 3;      // Poziom trudności
    timeEstimate: string;       // Szacowany czas
    prerequisites: string[];    // Wymagane komponenty
    utils: string[];           // Wykorzystywane narzędzia
}

interface TaskStructure {
    setup: {
        environment: string[];  // Wymagania środowiskowe
        dependencies: string[]; // Zależności npm
    };
    implementation: {
        steps: string[];       // Kroki implementacji
        codeExamples: string[]; // Przykłady kodu
    };
    testing: {
        cases: string[];       // Przypadki testowe
        validation: string[];  // Kryteria walidacji
    };
    documentation: {
        files: string[];      // Pliki do utworzenia/modyfikacji
        notes: string[];      // Dodatkowe notatki
    };
}
```

## 🔍 Szybkie Linki

### 📚 Dokumentacja API
- Linear API: `utils/notes/api_integrations.md#linear-api`
- Google APIs: `utils/notes/api_integrations.md#google-apis`
- Spotify API: `utils/notes/api_integrations.md#spotify-api`

### 🛠️ Narzędzia
- Task Runner: `utils/notes/developer_tools.md#task-runner`
- File Generator: `utils/notes/developer_tools.md#file-generator`
- Test Framework: `utils/notes/developer_tools.md#test-framework`

### 📊 Monitoring
- Langfuse: `utils/notes/monitoring_analytics.md#langfuse`
- Tiktokenizer: `utils/notes/monitoring_analytics.md#tiktokenizer`
- Custom Analytics: `utils/notes/monitoring_analytics.md#custom-analytics`

## 🔄 Workflow

1. **Przygotowanie**
   - Sprawdź wymagania w `TaskContext`
   - Przygotuj środowisko według `setup.environment`
   - Zainstaluj zależności z `setup.dependencies`

2. **Implementacja**
   - Postępuj zgodnie z `implementation.steps`
   - Wykorzystuj komponenty z `utils/`
   - Dokumentuj zmiany w `notes/`

3. **Testowanie**
   - Uruchom testy według `testing.cases`
   - Sprawdź kryteria z `testing.validation`
   - Użyj narzędzi z `utils/testers/`

4. **Dokumentacja**
   - Aktualizuj pliki według `documentation.files`
   - Dodaj notatki z `documentation.notes`
   - Uzupełnij README w folderze zadania

## 📌 Konwencje

### 🏷️ Nazewnictwo
- Pliki: `kebab-case.ts`
- Klasy: `PascalCase`
- Funkcje: `camelCase`
- Stałe: `UPPER_SNAKE_CASE`

### 📂 Organizacja Kodu
- Jeden plik = jedna odpowiedzialność
- Grupowanie według funkcjonalności
- Zachowanie spójnej struktury katalogów

### 🔗 Importy
- Ścieżki względne dla lokalnych modułów
- Aliasy dla często używanych importów
- Grupowanie importów według pochodzenia

## 🎨 Style Kodowania

### 💻 TypeScript
- Strict mode włączony
- Pełne typowanie
- Interfejsy zamiast typów gdzie możliwe

### 🧪 Testy
- Jest jako framework testowy
- Testy jednostkowe dla utils
- Testy integracyjne dla API

### 📝 Komentarze
- JSDoc dla funkcji publicznych
- Inline comments tylko gdy niezbędne
- Czytelny kod zamiast nadmiaru komentarzy 

## 🔑 Klucze API i Konfiguracja

### .env
Projekt wykorzystuje plik `.env` do przechowywania kluczy API i innych wrażliwych danych. Aktualnie posiadamy:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Linear
LINEAR_API_KEY=lin_...

# Langfuse
LANGFUSE_PUBLIC_KEY=pk_...
LANGFUSE_SECRET_KEY=sk_...

# Inne klucze będą dodawane w trakcie kursu
```

### 🔐 Pozyskiwanie Kluczy
Każde nowe zadanie może wymagać dodatkowych kluczy API. Proces ich pozyskania będzie opisany w:
- Dokumentacji zadania (`exercises/XXX/README.md`)
- Instrukcjach konfiguracji (`exercises/XXX/setup.md`)
- Notatkach z lekcji (`exercises/XXX/notes/*.md`)

### ⚠️ Bezpieczeństwo
- Nigdy nie commituj pliku `.env` do repozytorium
- Używaj `.env.example` jako szablonu wymaganych zmiennych
- Regularnie rotuj klucze API w przypadku ich kompromitacji
- Używaj różnych kluczy dla środowiska developerskiego i produkcyjnego

### 📋 Szablon .env
```env
# Skopiuj ten szablon do pliku .env i uzupełnij wartości
# Podstawowe API
OPENAI_API_KEY=
LINEAR_API_KEY=
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=

# Dodatkowe API (będą dodawane w trakcie kursu)
GOOGLE_API_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
# ...inne
```

## 🔒 Bezpieczeństwo i Wrażliwe Dane

### Plik .env
- ⚠️ **NIGDY** nie pokazuj ani nie udostępniaj zawartości pliku `.env`
- ⚠️ **NIGDY** nie commituj pliku `.env` do repozytorium
- ⚠️ **NIGDY** nie wklejaj kluczy API do czatu czy dokumentacji

### Bezpieczne Praktyki
1. Używaj `.env.example` jako szablonu (bez rzeczywistych wartości)
2. Trzymaj kopię kluczy w bezpiecznym miejscu (np. password manager)
3. W dokumentacji odnosimy się tylko do nazw zmiennych, nigdy ich wartości
4. Jeśli klucz zostanie przypadkowo ujawniony, natychmiast go zregeneruj

### Przykład Bezpiecznej Dokumentacji
```typescript
// ✅ Dobrze - używamy nazwy zmiennej
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ❌ Źle - nigdy nie pokazuj prawdziwego klucza
const client = new OpenAI({ apiKey: 'sk-...' });
```

### Struktura Projektu
```
project/
  ├── .env                 # ⚠️ Nigdy nie commituj
  ├── .env.example         # ✅ Szablon do commitowania
  └── .gitignore          # ✅ Upewnij się, że zawiera ".env"
```

# Struktura Notatek

## Sezon 3 - RAG
- `/rag/basics/` - Podstawy RAG
- `/rag/optimization/` - Optymalizacja RAG
- `/rag/testing/` - Testowanie RAG
- `/rag/deployment/` - Wdrażanie RAG
- `/rag/monitoring/` - Monitoring RAG

## Sezon 4 - Model Management
- `/models/fine_tuning/` - Fine-tuning modeli
- `/models/evaluation/` - Ewaluacja modeli
- `/models/deployment/` - Wdrażanie modeli
- `/models/optimization/` - Optymalizacja modeli
- `/models/management/` - Zarządzanie modelami

## Sezon 5 - Agenci i Asystenci
- `/agents/basics/` - Podstawy agentów
- `/agents/memory/` - System pamięci
- `/agents/interactions/` - Interakcje między agentami
- `/agents/tools/` - Narzędzia agentów
- `/agents/orchestration/` - Orkiestracja agentów

## Wspólne
- `/common/security/` - Bezpieczeństwo
- `/common/monitoring/` - Monitoring i analityka
- `/common/integrations/` - Integracje zewnętrzne