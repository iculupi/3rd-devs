# Exercise 019 - Dron Nawigacyjny

## 🎯 Cel
Stworzenie API do nawigacji dronem po mapie 4x4 i interpretacji terenu w poszukiwaniu profesora Maja.

## 📝 Zadania
1. Implementacja serwera HTTP
2. Obsługa instrukcji nawigacyjnych w języku naturalnym
3. Interpretacja terenu na podstawie mapy
4. Integracja z systemem centrali

## 🔧 Wykorzystane biblioteki
```bash
# Core dependencies
- WebhookHandler (utils/api/handlers/WebhookHandler)
- OpenAIClient (utils/api/clients/OpenAIClient)
- CacheManager (utils/llm/cache/CacheManager)
- FileManager (utils/helpers/files/FileManager)
```

## 📂 Struktura projektu
```
exercises/019/
├── app.ts                 # Główny plik aplikacji
├── map.ts                # Definicja mapy terenu
└── prompts/             # Prompty dla modeli AI
    └── navigator.ts
```

## 🚀 Uruchomienie
```bash
# Lokalnie
bun run exercises/019/app.ts

# Tunel SSH
ssh -R 50925:localhost:3000 agent10925@azyl.ag3nts.org -p 5022
```

## 🔍 Funkcjonalności
1. Obsługa zapytań HTTP
2. Interpretacja instrukcji w języku naturalnym
3. Nawigacja po mapie
4. Opis terenu
5. Obsługa błędów