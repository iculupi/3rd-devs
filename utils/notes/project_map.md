# Mapa Projektu AI_devs 3

## Struktura Katalogów
```
project/
├── utils/
│   ├── llm/              # Managery LLM
│   ├── prompts/          # Prompty i szablony
│   ├── database/         # Integracje z bazami
│   ├── api/              # Handlery API
│   ├── helpers/          # Funkcje pomocnicze
│   └── notes/            # Dokumentacja techniczna
├── tests/                # Testy
└── exercises/            # Ćwiczenia z kursu
```

## Konwencje Nazewnictwa
1. Managery: `*Manager.ts` (np. `tokenManager.ts`)
2. Typy: `types.ts` w każdym katalogu gdzie są potrzebne
3. Helpery: `helpers.ts` lub `*Helper.ts`
4. Prompty: `*Prompt.md` lub `*Assistant.md`

## Gdzie Co Dodawać

### Nowe Utils
1. **LLM Managery** → `utils/llm/`
   - Zarządzanie tokenami
   - Cache i pamięć
   - Bezpieczeństwo
   - Rate limiting

2. **Prompty** → `utils/prompts/`
   - System prompts → `systemPrompts.ts`
   - Szablony → `templates/`
   - Przykłady → `examples.ts`

3. **Integracje** → `utils/integrations/`
   - Bazy danych
   - API zewnętrzne
   - Vector stores

### Dokumentacja
1. **Architektura** → `utils/notes/architecture.md`
2. **Dobre praktyki** → `utils/notes/best_practices.md`
3. **Notatki z kursu** → `utils/notes/course/`

## Checklist Przy Dodawaniu Nowego Utilsa
1. [ ] Określ właściwy katalog
2. [ ] Stwórz plik z typami (jeśli potrzebne)
3. [ ] Dodaj testy
4. [ ] Zaktualizuj dokumentację
5. [ ] Dodaj przykłady użycia

## Checklist Przy Dodawaniu Nowego Promptu
1. [ ] Dodaj do `systemPrompts.ts`
2. [ ] Stwórz przykłady w `examples.ts`
3. [ ] Zaktualizuj typy w `types.ts`
4. [ ] Dodaj testy promptu

## Integracja z Istniejącym Kodem
1. Sprawdź zależności
2. Użyj istniejących typów
3. Zachowaj spójność API
4. Dodaj eksport w `index.ts`

## Przydatne Komendy
```bash
# Dodaj nowego managera
touch utils/llm/newManager.ts
touch utils/llm/__tests__/newManager.test.ts

# Dodaj nowy prompt
touch utils/prompts/newPrompt.md
```

## Uwagi
- Każdy nowy utils powinien mieć jasno określony cel
- Unikaj duplikacji funkcjonalności
- Zachowaj spójne API
- Dokumentuj kod i użycie
  </rewritten_file> 