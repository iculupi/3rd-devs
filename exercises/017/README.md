# Exercise 017 - SoftoAI Crawler

## 🎯 Cel
Stworzenie uniwersalnego mechanizmu do poszukiwania informacji na stronach firm robotycznych, na przykładzie strony SoftoAI.

## 📋 Zadanie
1. Pobranie pytań z centrali
2. Analiza strony SoftoAI
3. Inteligentne przeszukiwanie podstron
4. Znalezienie odpowiedzi na pytania
5. Raportowanie wyników

## 🔍 Mechanizm działania
1. Pobieranie pytań:
   ```typescript
   GET https://centrala.ag3nts.org/data/TWÓJ-KLUCZ/softo.json
   ```

2. Przeszukiwanie strony:
   ```
   https://softo.ag3nts.org
   ```

3. Format odpowiedzi:
   ```json
   {
       "01": "odpowiedź na pierwsze pytanie",
       "02": "odpowiedź na drugie pytanie",
       "03": "odpowiedź na trzecie pytanie"
   }
   ```

## 📝 Implementacja
- Inteligentne przechodzenie po linkach
- Unikanie pętli i pułapek
- Analiza treści pod kątem pytań
- Cache'owanie odwiedzonych stron
- Optymalizacja użycia tokenów

## 🗂️ Struktura
```
exercises/017/
├── app.ts              # Główny plik aplikacji
├── config/            # Konfiguracja crawlera
├── cache/             # Cache odwiedzonych stron
├── logs/              # Logi wykonania
└── README.md          # Dokumentacja
```

## 🚀 Uruchomienie
1. Upewnij się, że masz ustawiony `PERSONAL_API_KEY`
2. Zainstaluj zależności: `npm install`
3. Uruchom skrypt: `bun run exercises/017/app.ts`

## ⚠️ Uwagi
1. Nie indeksuj całego serwisu
2. Unikaj wrzucania wszystkich podstron do kontekstu
3. Uważaj na pułapki i pętle nieskończone
4. Optymalizuj użycie tokenów
5. Używaj cache'owania