# Vision Language Models (VLM)

## Przegląd
Dokumentacja dotycząca modeli VLM i ich zastosowania w projekcie.

## Struktura
1. Modele
   - GPT-4 Vision
   - Claude 3 Sonnet
   - Mistral Pixtral
   - Open Source Models (Phi, Qwen)

2. Narzędzia
   - Segment Anything (Meta)
   - Roboflow
   - Grounding DINO

3. Integracje
   - OpenAI API
   - Replicate API
   - Mistral API

## Przykłady użycia
Zobacz: `/exercises/007/scripts/` dla przykładów implementacji.

## Ograniczenia
1. Techniczne:
   - Maksymalny rozmiar obrazu
   - Limity tokenów
   - Format wejściowy

2. Funkcjonalne:
   - Brak precyzyjnej detekcji kolorów
   - Problemy z wymiarami
   - Ograniczenia w lokalizacji obiektów

## Best Practices
1. Preprocessing obrazów
   - Kompresja
   - Skalowanie
   - Konwersja formatu

2. Prompting
   - Chain of Thought
   - Few-Shot Learning
   - Self-Consistency

3. Postprocessing
   - Walidacja wyników
   - Łączenie z innymi modelami
   - Obsługa błędów 