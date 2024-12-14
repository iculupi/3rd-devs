---
title: Vision API - Notatki Implementacyjne
topics: [Vision API - Notatki Implementacyjne, Przygotowanie Środowiska, Wymagane Klucze API, Konfiguracja Projektu, Obsługa Błędów, Typowe Problemy, Best Practices, Przygotowanie Obrazów, Prompting, Przetwarzanie Wyników]
keywords: [bash
bun add sharp @types/sharp, bash
exercises/XXX/
├── images/        # Obrazy źródłowe
├── output/        # Wyniki analiz
└── scripts/       # Skrypty zadania]
lastUpdated: 2024-12-14T02:09:16.826Z


---

# Vision API - Notatki Implementacyjne

## Przygotowanie Środowiska

### Wymagane Klucze API
1. OpenAI API (GPT-4 Vision)
   - Wymagany dla podstawowych funkcji rozpoznawania obrazu
   - Dostęp przez: https://platform.openai.com/api-keys
   
2. Replicate API
   - Potrzebny dla modeli segmentacji
   - Dostęp przez: https://replicate.com/account
   
3. Mistral API (opcjonalnie)
   - Dla modelu Pixtral
   - Dostęp przez: https://console.mistral.ai/api-keys/

### Konfiguracja Projektu
1. Instalacja zależności:
```bash
bun add sharp @types/sharp
```

2. Struktura katalogów dla zadań Vision:
```bash
exercises/XXX/
├── images/        # Obrazy źródłowe
├── output/        # Wyniki analiz
└── scripts/       # Skrypty zadania
```

## Obsługa Błędów

### Typowe Problemy
1. Brak dostępu do GPT-4 Vision
   - Sprawdź uprawnienia konta OpenAI
   - Upewnij się, że masz wystarczające środki

2. Problemy z formatem obrazu
   - Używaj `VisionUtils.prepareImage()` do przygotowania obrazu
   - Sprawdź maksymalny rozmiar (2048px)

3. Timeout przy dużych obrazach
   - Implementuj retry logic
   - Zmniejsz rozmiar obrazu

## Best Practices

### Przygotowanie Obrazów
1. Zawsze używaj kompresji
2. Skaluj obrazy zachowując proporcje
3. Konwertuj do JPEG dla mniejszego rozmiaru

### Prompting
1. Używaj precyzyjnych instrukcji
2. Dodawaj kontekst gdy potrzebny
3. Implementuj Chain of Thought dla złożonych zadań

### Przetwarzanie Wyników
1. Zawsze waliduj odpowiedzi
2. Zapisuj wyniki do plików JSON
3. Dodawaj metadane (timestamp, prompt) 