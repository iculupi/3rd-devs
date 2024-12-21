# Exercise 015 - Najkrótsza Ścieżka w Grafie

## 🎯 Cel
Znalezienie najkrótszej ścieżki między Rafałem a Barbarą w grafie połączeń społecznych.

## 📋 Zadanie
1. Pobranie danych z bazy MySQL:
   - Tabela users (imiona i ID)
   - Tabela connections (powiązania między ID)
2. Zbudowanie grafu w Neo4j
3. Znalezienie najkrótszej ścieżki
4. Raportowanie wyników do centrali

## 🔍 Struktura Danych
1. Tabela Users:
   ```sql
   CREATE TABLE `users` (
     `id` int(11) NOT NULL AUTO_INCREMENT,
     `username` varchar(20) DEFAULT NULL,
     `access_level` varchar(20) DEFAULT 'user',
     `is_active` int(11) DEFAULT 1,
     `lastlog` date DEFAULT NULL,
     PRIMARY KEY (`id`)
   )
   ```

2. Tabela Connections:
   ```sql
   CREATE TABLE `connections` (
     `user1_id` int(11) NOT NULL,
     `user2_id` int(11) NOT NULL,
     PRIMARY KEY (`user1_id`,`user2_id`)
   )
   ```

## 📝 Implementacja
- Pobieranie danych z MySQL
- Konwersja do formatu Neo4j
- Budowa grafu skierowanego
- Wyszukiwanie najkrótszej ścieżki
- Raportowanie wyników

## 🗂️ Struktura
```
exercises/015/
├── app.ts              # Główny plik aplikacji
├── data/              # Pobrane dane
│   ├── users.json     # Dane użytkowników
│   └── connections.json# Dane połączeń
├── neo4j/             # Skrypty Neo4j
│   ├── create.cypher  # Tworzenie grafu
│   └── query.cypher   # Zapytanie o ścieżkę
├── logs/              # Logi wykonania
└── README.md          # Dokumentacja
```

## 🚀 Uruchomienie
1. Upewnij się, że masz:
   - Uruchomioną bazę Neo4j
   - Ustawione zmienne środowiskowe
2. Zainstaluj zależności: `npm install`
3. Uruchom skrypt: `bun run exercises/015/app.ts`

## 📊 Logi
Program generuje logi w katalogu `logs/`:
- `mysql_data.json` - Dane pobrane z MySQL
- `neo4j_graph.json` - Stan grafu
- `path_result.json` - Znaleziona ścieżka
- `solution_*.json` - Komunikacja z centralą