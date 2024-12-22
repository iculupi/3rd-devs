# Exercise 020 - Notatnik Rafała

## 🎯 Cel
Analiza notatnika Rafała poprzez ekstrakcję tekstu i obrazów z pliku PDF oraz wykorzystanie AI do interpretacji zawartości.

## 📝 Zadania
1. Konwersja PDF na obrazy
2. Ekstrakcja tekstu z PDF
3. Analiza obrazów przez AI
4. Odpowiedzi na pytania

## 🔧 Wykorzystane biblioteki
```bash
# Core dependencies
- OpenAIClient (utils/api/clients/OpenAIClient)
- PdfProcessor (utils/helpers/pdf/PdfProcessor)
- FileManager (utils/helpers/files/FileManager)
- CacheManager (utils/llm/cache/CacheManager)
```

## 📂 Struktura projektu
```
exercises/020/
├── app.ts                 # Główny plik aplikacji
├── prompts/              # Prompty dla modeli AI
│   ├── answerPrompt.ts
│   ├── describeImagesPrompt.ts
│   └── getTextPrompt.ts
├── pages/               # Katalog na wyekstrahowane strony
└── pages_resized/      # Katalog na przeskalowane obrazy
```

## 🚀 Uruchomienie
```bash
bun run exercises/020/app.ts
```

## 🔍 Funkcjonalności
1. Konwersja PDF na obrazy
2. Ekstrakcja tekstu
3. Analiza obrazów
4. Łączenie wyników
5. Odpowiadanie na pytania