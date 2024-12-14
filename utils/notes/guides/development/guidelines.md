---
title: Wytyczne Rozwoju Projektu
topics: [Wytyczne Rozwoju Projektu, Struktura Projektu, 1. Organizacja Katalogów, 2. Zasady Nazewnictwa, 3. Importy, Best Practices, 1. Zarządzanie Kodem, 2. Zarządzanie Zależnościami, 3. Obsługa Błędów, Napotkane Problemy i Rozwiązania, Problem 1: Duplikacja Kodu Sprawdzania API, Problem 2: Niespójna Struktura Katalogów, Przydatne Komendy, Sprawdzenie kluczy API, Utworzenie nowego zadania, Uruchomienie testów, Instalacja zale��ności]
keywords: [bash
# Sprawdzenie kluczy API
bun run check-vision-keys

# Utworzenie nowego zadania
bun run task:new

# Uruchomienie testów
bun run task:test

# Instalacja zale��ności
bun add <package-name>]
lastUpdated: 2024-12-14T02:09:16.831Z


---

# Wytyczne Rozwoju Projektu

## Struktura Projektu

### 1. Organizacja Katalogów
- `/utils` - współdzielone narzędzia i funkcje
  - `/api` - integracje z zewnętrznymi API
  - `/helpers` - funkcje pomocnicze
  - `/notes` - dokumentacja i notatki
  - `/processors` - przetwarzanie danych
  - `/prompts` - szablony promptów
  - `/tasks` - logika zadań
  - `/testers` - testy i walidacja
  - `/types` - definicje typów

- `/exercises` - zadania i ćwiczenia
  - `/XXX` - folder konkretnego zadania
    - `/scripts` - skrypty specyficzne dla zadania
    - `/images` - obrazy używane w zadaniu
    - `/output` - wyniki działania skryptów

### 2. Zasady Nazewnictwa
- Pliki pomocnicze: `camelCase.ts` (np. `visionUtils.ts`)
- Skrypty zadań: `kebab-case.ts` (np. `run-vision-example.ts`)
- Pliki konfiguracyjne: `kebab-case.config.ts`
- Testy: `*.test.ts`

### 3. Importy
- Używamy ścieżek względnych z utils: `import { VisionUtils } from '../../../utils/helpers'`
- Wszystkie helpery eksportujemy przez `index.ts`
- Unikamy duplikacji kodu między zadaniami

## Best Practices

### 1. Zarządzanie Kodem
- Nie duplikujemy funkcjonalności - przenosimy wspólne funkcje do `/utils`
- Każdy helper powinien mieć jeden, jasno określony cel
- Dokumentujemy kod używając JSDoc
- Tworzymy testy dla współdzielonych funkcji

### 2. Zarządzanie Zależnościami
- Sprawdzamy wymagane klucze API przed uruchomieniem przykładów
- Definiujemy wszystkie zależności w `package.json`
- Używamy `bun add` do instalacji nowych pakietów

### 3. Obsługa Błędów
- Implementujemy obsługę błędów w helperach
- Logujemy błędy w spójny sposób
- Zwracamy czytelne komunikaty błędów

## Napotkane Problemy i Rozwiązania

### Problem 1: Duplikacja Kodu Sprawdzania API
Symptom: Tworzenie nowych plików do sprawdzania kluczy API w każdym zadaniu.
Rozwiązanie: 
- Utworzenie wspólnej klasy `KeyChecker` w `utils/helpers`
- Używanie jej we wszystkich zadaniach
- Centralne zarządzanie wymaganymi kluczami

### Problem 2: Niespójna Struktura Katalogów
Symptom: Różne podejścia do organizacji plików w różnych zadaniach.
Rozwiązanie:
- Ustalenie standardowej struktury katalogów
- Przeniesienie wspólnych elementów do `/utils`
- Dokumentacja struktury w README

## Przydatne Komendy

```bash
# Sprawdzenie kluczy API
bun run check-vision-keys

# Utworzenie nowego zadania
bun run task:new

# Uruchomienie testów
bun run task:test

# Instalacja zale��ności
bun add <package-name>
``` 