# Exercise 018 - Web Scraper AI

## 🎯 Cel
Stworzenie inteligentnego web scrapera, który potrafi znaleźć odpowiedzi na pytania analizując stronę internetową i jej podstrony.

## 📝 Zadania
1. Implementacja web scrapera z obsługą podstron
2. Integracja z OpenAI do analizy treści
3. Implementacja systemu cache'owania
4. Obsługa różnych typów odpowiedzi (email, URL, certyfikaty)

## 🔧 Wykorzystane biblioteki
```bash
# Core dependencies
- OpenAIClient (utils/api/clients/OpenAIClient)
- CacheManager (utils/llm/cache/CacheManager)
- FileManager (utils/helpers/files/FileManager)
- TurndownService (turndown)
```

## 📂 Struktura projektu
```
exercises/018/
├── app.ts                 # Główny plik aplikacji
├── tools.ts              # Narzędzia pomocnicze
└── prompts/             # Prompty dla modeli AI
    ├── findAnswerPrompt.ts
    └── rankSubUrlPrompt.ts
```

## 🚀 Uruchomienie
```bash
bun run exercises/018/app.ts
```

## 🔍 Funkcjonalności
1. Scraping stron WWW
2. Analiza treści przez AI
3. Cache'owanie odpowiedzi
4. Walidacja odpowiedzi
5. Raportowanie do centrali