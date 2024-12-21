# Exercise 014 - Znajdź Barbarę

## 🎯 Cel
Znalezienie aktualnej lokalizacji Barbary Zawadzkiej poprzez analizę danych z dwóch systemów:
- Wyszukiwarka członków ruchu oporu
- Wyszukiwarka miejsc odwiedzonych przez konkretne osoby

## 📋 Zadanie
1. Pobranie i analiza notatki o Barbarze
2. Identyfikacja osób i miejsc z notatki
3. Przeszukiwanie baz danych w poszukiwaniu powiązań
4. Znalezienie aktualnej lokalizacji Barbary
5. Raportowanie znalezionych lokalizacji do centrali

## 🔍 Systemy API
1. Wyszukiwarka osób:
   ```
   POST https://centrala.ag3nts.org/people
   {
     "apikey": "TWÓJ_KLUCZ",
     "query": "IMIE"
   }
   ```

2. Wyszukiwarka miejsc:
   ```
   POST https://centrala.ag3nts.org/places
   {
     "apikey": "TWÓJ_KLUCZ",
     "query": "MIASTO"
   }
   ```

## 📝 Implementacja
- Rekurencyjne przeszukiwanie połączeń między osobami i miejscami
- Obsługa zastrzeżonych danych (`**RESTRICTED_DATA**`)
- Usuwanie polskich znaków z zapytań
- Szczegółowe logowanie procesu wyszukiwania
- Raportowanie znalezionych lokalizacji

## 🗂️ Struktura
```
exercises/014/
├── app.ts              # Główny plik aplikacji
├── logs/              # Katalog z logami
├── README.md          # Dokumentacja
└── tools.ts           # Narzędzia pomocnicze
```

## 🚀 Uruchomienie
1. Upewnij się, że masz ustawiony `PERSONAL_API_KEY` w zmiennych środowiskowych
2. Zainstaluj zależności: `npm install`
3. Uruchom skrypt: `bun run exercises/014/app.ts`

## 📊 Logi
Program generuje szczegółowe logi w katalogu `logs/`:
- `initial_gpt_response.json` - Początkowa analiza tekstu
- `iteration_X_start/end.json` - Stan na początku/końcu każdej iteracji
- `query_*.json` - Zapytania i odpowiedzi z API
- `solution_*.json` - Raportowanie wyników do centrali