# Exercise 016 - Rysopis Barbary

## 🎯 Cel
Analiza uszkodzonych zdjęć w celu stworzenia rysopisu Barbary.

## 📋 Zadanie
1. Rozpoczęcie rozmowy z automatem
2. Analiza otrzymanych zdjęć
3. Naprawa i poprawa jakości zdjęć
4. Stworzenie rysopisu Barbary
5. Raportowanie wyników do centrali

## 🔍 Dostępne Komendy
1. `REPAIR NAZWA_PLIKU` - naprawa uszkodzonego zdjęcia
2. `DARKEN NAZWA_PLIKU` - przyciemnienie zdjęcia
3. `BRIGHTEN NAZWA_PLIKU` - rozjaśnienie zdjęcia

## 📝 Implementacja
- Komunikacja z automatem
- Przetwarzanie odpowiedzi w języku naturalnym
- Analiza zdjęć
- Tworzenie rysopisu
- Raportowanie wyników

## 🗂️ Struktura
```
exercises/016/
├── app.ts              # Główny plik aplikacji
├── data/              # Pobrane zdjęcia
├── logs/              # Logi komunikacji
├── README.md          # Dokumentacja
└── tools.ts           # Narzędzia pomocnicze
```

## 🚀 Uruchomienie
1. Upewnij się, że masz ustawiony `PERSONAL_API_KEY`
2. Zainstaluj zależności: `npm install`
3. Uruchom skrypt: `bun run exercises/016/app.ts`

## 📊 Logi
Program generuje logi w katalogu `logs/`:
- `conversation_*.json` - Komunikacja z automatem
- `images/` - Pobrane i przetworzone zdjęcia
- `solution_*.json` - Komunikacja z centralą