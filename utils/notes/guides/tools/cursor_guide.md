---
title: Przewodnik Współpracy z Asystentem w Cursorze
topics: [Przewodnik Współpracy z Asystentem w Cursorze, Podstawowe Komendy, Przykłady Użycia, Praca z Plikami, 1. Tworzenie Nowego Utilsa, 2. Aktualizacja Istniejącego Kodu, 3. Praca z Promptami, Dobre Praktyki, 1. Rozpoczynanie Nowych Zadań, 2. Code Review, 3. Dokumentacja, Wskazówki, Przykładowy Workflow]
keywords: [@notes Pokaż mi strukturę projektu
@llm Jak zaimplementować nowego managera?
@prompts Zaktualizuj meta prompt
@utils Dodaj nową funkcjonalność do tokenManager, @utils Stwórz nowego managera do obsługi embeddings, @llm Dodaj obsługę rate limitingu do tokenManager, @prompts Stwórz nowy prompt do klasyfikacji tekstu, @notes Pokaż mi checklistę dla nowego utilsa
@utils Zacznijmy implementację zgodnie z checklistą, @llm Sprawdź ten kod pod kątem bezpieczeństwa
@utils Czy ten kod jest zgodny z naszymi konwencjami?, @notes Zaktualizuj dokumentację po dodaniu nowej funkcjonalności
@prompts Dodaj przykłady użycia do README, @notes Pokaż mi strukturę projektu
@utils Gdzie powinniśmy dodać nową funkcjonalność?, @llm Stwórz nowego managera według szablonu
@utils Dodaj testy do nowego managera, @notes Zaktualizuj project_map.md
@prompts Dodaj przykłady użycia, @llm Sprawdź implementację
@utils Czy wszystko jest zgodne z konwencjami?, @notes, @llm, @prompts, @utils]
lastUpdated: 2024-12-14T02:09:16.831Z


---

# Przewodnik Współpracy z Asystentem w Cursorze

## Podstawowe Komendy
1. **@notes** - przywołanie kontekstu z notatek
2. **@llm** - przywołanie kontekstu związanego z LLM
3. **@prompts** - przywołanie kontekstu promptów
4. **@utils** - przywołanie kontekstu utilsów

## Przykłady Użycia
```
@notes Pokaż mi strukturę projektu
@llm Jak zaimplementować nowego managera?
@prompts Zaktualizuj meta prompt
@utils Dodaj nową funkcjonalność do tokenManager
```

## Praca z Plikami

### 1. Tworzenie Nowego Utilsa
```
@utils Stwórz nowego managera do obsługi embeddings
```
Asystent użyje szablonu z `templates.md` i stworzy nowy plik w odpowiednim katalogu.

### 2. Aktualizacja Istniejącego Kodu
```
@llm Dodaj obsługę rate limitingu do tokenManager
```
Asystent zaproponuje zmiany w istniejącym kodzie.

### 3. Praca z Promptami
```
@prompts Stwórz nowy prompt do klasyfikacji tekstu
```
Asystent użyje szablonów z `prompts/templates/` i doda nowy prompt.

## Dobre Praktyki

### 1. Rozpoczynanie Nowych Zadań
```
@notes Pokaż mi checklistę dla nowego utilsa
@utils Zacznijmy implementację zgodnie z checklistą
```

### 2. Code Review
```
@llm Sprawdź ten kod pod kątem bezpieczeństwa
@utils Czy ten kod jest zgodny z naszymi konwencjami?
```

### 3. Dokumentacja
```
@notes Zaktualizuj dokumentację po dodaniu nowej funkcjonalności
@prompts Dodaj przykłady użycia do README
```

## Wskazówki
1. Zawsze zaczynaj od określenia kontekstu (@notes, @llm, @prompts, @utils)
2. Używaj checklisty przy tworzeniu nowych komponentów
3. Proś o aktualizację dokumentacji po zmianach
4. Pytaj o najlepsze praktyki i wzorce

## Przykładowy Workflow

1. Planowanie:
```
@notes Pokaż mi strukturę projektu
@utils Gdzie powinniśmy dodać nową funkcjonalność?
```

2. Implementacja:
```
@llm Stwórz nowego managera według szablonu
@utils Dodaj testy do nowego managera
```

3. Dokumentacja:
```
@notes Zaktualizuj project_map.md
@prompts Dodaj przykłady użycia
```

4. Review:
```
@llm Sprawdź implementację
@utils Czy wszystko jest zgodne z konwencjami?
``` 