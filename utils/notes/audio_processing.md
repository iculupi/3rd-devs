# Audio Processing - Szczegółowa Dokumentacja

## 1. Narzędzia i Biblioteki
### Whisper (OpenAI)
```typescript
import { openai } from '../utils/api/openai';
```
- Transkrypcja audio na tekst
- Obsługa wielu języków
- Wysoka dokładność

### ElevenLabs
```typescript
import { ElevenLabs } from '../utils/api/elevenlabs';
```
- Text-to-Speech
- Customizacja głosów
- Kontrola intonacji

### Node-VAD (Voice Activity Detection)
```typescript
import VAD from 'node-vad';
```
- Wykrywanie aktywności głosowej
- Redukcja szumu
- Segmentacja audio

## 2. Przykłady Implementacji

### Transkrypcja Audio
```typescript
import { AudioUtils } from '../utils/helpers';

// Przykład transkrypcji pliku audio
const transcription = await AudioUtils.transcribeAudio(openai, audioPath);
```

### Batch Processing
```typescript
// Przetwarzanie wielu plików audio
const results = await AudioUtils.processAllAudioFiles(openai, audioDirectory);
```

### Zapis Wyników
```typescript
// Zapisywanie transkrypcji do plików
await AudioUtils.saveTranscriptions(transcriptions, outputDir);
```

## 3. Obsługa Formatów
### Wspierane Formaty
- MP3
- WAV
- M4A
- OGG

### Konwersja Formatów
```typescript
// Konwersja do WAV
await AudioUtils.convertToWav(inputPath, outputPath);
```

## 4. Best Practices

### Optymalizacja
1. Preprocessing audio:
   - Normalizacja głośności
   - Usuwanie szumu
   - Segmentacja długich nagrań

2. Batch processing:
   - Grupowanie małych plików
   - Równoległe przetwarzanie
   - Zarządzanie kolejką

3. Error handling:
   - Retry logic dla API calls
   - Walidacja formatów
   - Logowanie błędów

### Przykłady z Projektu
1. Exercises/006:
   ```typescript
   // Przetwarzanie zeznań audio
   const transcriptions = await processTestimonies(audioFiles);
   ```

2. Audio-map:
   ```typescript
   // Mapowanie audio z lokalizacją
   const audioMap = await createAudioMap(audioFiles, locations);
   ```

## 5. Przydatne Snippety

### Sprawdzanie Formatu Audio
```typescript
const isValidAudioFormat = (filename: string): boolean => {
    const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg'];
    return validExtensions.includes(path.extname(filename).toLowerCase());
};
```

### Batch Processing z Postępem
```typescript
async function processWithProgress(files: string[]) {
    const total = files.length;
    let processed = 0;

    for (const file of files) {
        await processAudioFile(file);
        processed++;
        console.log(`Progress: ${processed}/${total}`);
    }
}
```

## 6. Troubleshooting

### Typowe Problemy
1. Timeout przy dużych plikach
   - Rozwiązanie: Segmentacja plików
   - Alternatywa: Streaming API

2. Problemy z formatem
   - Rozwiązanie: Automatyczna konwersja
   - Narzędzie: ffmpeg

3. Limity API
   - Rozwiązanie: Rate limiting
   - Implementacja: Queue system

## 7. Alternatywne Rozwiązania

### Local Models
- Whisper.cpp
- Vosk
- Mozilla DeepSpeech

### Cloud Services
- AWS Transcribe
- Google Speech-to-Text
- Azure Speech Services 