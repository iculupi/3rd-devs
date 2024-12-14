---
title: Video Processing - Szczegółowa Dokumentacja
topics: [Video Processing - Szczegółowa Dokumentacja, 1. Narzędzia i Biblioteki, FFmpeg, Tesseract OCR, YouTube API, 2. Przykłady Implementacji, Ekstrakcja Klatek, OCR na Wideo, Generowanie Napisów, 3. Obsługa Formatów, Wspierane Formaty, Konwersja Formatów, 4. Best Practices, Optymalizacja, 5. Przydatne Snippety, Sprawdzanie Formatu Wideo, Progress Tracking, 6. Troubleshooting, Typowe Problemy, 7. Alternatywne Rozwiązania, Local Processing, Cloud Services]
keywords: [typescript
import ffmpeg from 'fluent-ffmpeg';, typescript
import { createWorker } from 'tesseract.js';, typescript
import { youtube } from '../utils/api/youtube';, typescript
import { VideoUtils } from '../utils/helpers';

// Wyodrębnianie klatek z wideo
const frames = await VideoUtils.extractFrames(videoPath, framesPerSecond);, typescript
// Rozpoznawanie tekstu z klatek
const textContent = await VideoUtils.performVideoOCR(frames);, typescript
// Tworzenie napisów z transkrypcji
await VideoUtils.generateSubtitles(transcription, outputPath);, typescript
// Konwersja do MP4
await VideoUtils.convertToMP4(inputPath, outputPath);, typescript
const isValidVideoFormat = (filename: string): boolean => {
    const validExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
    return validExtensions.includes(path.extname(filename).toLowerCase());
};, typescript
function trackProgress(operation: string) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .on('progress', (progress) => {
                console.log(${operation}: ${progress.percent}% done);
            })
            .on('end', resolve)
            .on('error', reject);
    });
}]
lastUpdated: 2024-12-14T02:09:16.827Z


---

# Video Processing - Szczegółowa Dokumentacja

## 1. Narzędzia i Biblioteki
### FFmpeg
```typescript
import ffmpeg from 'fluent-ffmpeg';
```
- Konwersja formatów
- Ekstrakcja klatek
- Manipulacja strumieni

### Tesseract OCR
```typescript
import { createWorker } from 'tesseract.js';
```
- OCR na klatkach wideo
- Rozpoznawanie tekstu
- Wielojęzyczne wsparcie

### YouTube API
```typescript
import { youtube } from '../utils/api/youtube';
```
- Pobieranie metadanych
- Ekstrakcja napisów
- Analiza treści

## 2. Przykłady Implementacji

### Ekstrakcja Klatek
```typescript
import { VideoUtils } from '../utils/helpers';

// Wyodrębnianie klatek z wideo
const frames = await VideoUtils.extractFrames(videoPath, framesPerSecond);
```

### OCR na Wideo
```typescript
// Rozpoznawanie tekstu z klatek
const textContent = await VideoUtils.performVideoOCR(frames);
```

### Generowanie Napisów
```typescript
// Tworzenie napisów z transkrypcji
await VideoUtils.generateSubtitles(transcription, outputPath);
```

## 3. Obsługa Formatów
### Wspierane Formaty
- MP4
- AVI
- MOV
- MKV

### Konwersja Formatów
```typescript
// Konwersja do MP4
await VideoUtils.convertToMP4(inputPath, outputPath);
```

## 4. Best Practices

### Optymalizacja
1. Preprocessing wideo:
   - Kompresja
   - Skalowanie
   - Stabilizacja

2. Batch processing:
   - Kolejkowanie zadań
   - Zarządzanie pamięcią
   - Równoległe przetwarzanie

3. Error handling:
   - Obsługa przerwanych konwersji
   - Walidacja formatów
   - Backup częściowych wyników

## 5. Przydatne Snippety

### Sprawdzanie Formatu Wideo
```typescript
const isValidVideoFormat = (filename: string): boolean => {
    const validExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
    return validExtensions.includes(path.extname(filename).toLowerCase());
};
```

### Progress Tracking
```typescript
function trackProgress(operation: string) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .on('progress', (progress) => {
                console.log(`${operation}: ${progress.percent}% done`);
            })
            .on('end', resolve)
            .on('error', reject);
    });
}
```

## 6. Troubleshooting

### Typowe Problemy
1. Wysokie użycie pamięci
   - Rozwiązanie: Streaming processing
   - Alternatywa: Chunked processing

2. Długi czas przetwarzania
   - Rozwiązanie: Optymalizacja parametrów
   - Narzędzie: GPU acceleration

3. Problemy z kodekami
   - Rozwiązanie: Automatyczna detekcja
   - Implementacja: Codec fallback

## 7. Alternatywne Rozwiązania

### Local Processing
- OpenCV
- MoviePy
- HandBrake

### Cloud Services
- AWS Elemental
- Google Cloud Video Intelligence
- Azure Video Indexer 