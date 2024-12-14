# Text Processing - Szczegółowa Dokumentacja

## 1. Narzędzia i Biblioteki
### Text Splitter
```typescript
import { TextSplitter } from '../utils/helpers';
```
- Inteligentne dzielenie tekstu
- Zachowanie kontekstu
- Optymalizacja tokenów

### Markdown Parser
```typescript
import { marked } from 'marked';
```
- Parsowanie markdown
- Konwersja do HTML
- Ekstrakcja struktury

### PDF Parser
```typescript
import { PDFParser } from '../utils/helpers';
```
- Ekstrakcja tekstu z PDF
- Zachowanie formatowania
- Obsługa tabel

## 2. Przykłady Implementacji

### Chunking Tekstu
```typescript
import { TextUtils } from '../utils/helpers';

// Dzielenie tekstu na chunki
const chunks = await TextUtils.splitIntoChunks(text, maxChunkSize);
```

### Parsowanie Dokumentów
```typescript
// Konwersja różnych formatów do tekstu
const textContent = await TextUtils.parseDocument(filePath);
```

### Normalizacja Tekstu
```typescript
// Czyszczenie i normalizacja tekstu
const normalizedText = TextUtils.normalizeText(input);
```

## 3. Obsługa Formatów
### Wspierane Formaty
- TXT
- PDF
- DOCX
- Markdown

### Konwersja Formatów
```typescript
// Konwersja do czystego tekstu
await TextUtils.convertToPlainText(inputPath, outputPath);
```

## 4. Best Practices

### Optymalizacja
1. Preprocessing tekstu:
   - Usuwanie duplikatów
   - Normalizacja znaków
   - Segmentacja akapitów

2. Batch processing:
   - Grupowanie dokumentów
   - Równoległe przetwarzanie
   - Caching wyników

3. Error handling:
   - Obsługa kodowania
   - Walidacja formatów
   - Logowanie błędów

## 5. Przydatne Snippety

### Czyszczenie Tekstu
```typescript
const cleanText = (text: string): string => {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();
};
```

### Ekstrakcja Kluczowych Informacji
```typescript
function extractEntities(text: string) {
    const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    const phones = text.match(/\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g) || [];
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    
    return { emails, phones, urls };
}
```

## 6. Troubleshooting

### Typowe Problemy
1. Problemy z kodowaniem
   - Rozwiązanie: Automatyczna detekcja
   - Alternatywa: Manual encoding

2. Utrata formatowania
   - Rozwiązanie: Format preservation
   - Narzędzie: Document converter

3. Duże pliki
   - Rozwiązanie: Streaming processing
   - Implementacja: Memory management

## 7. Alternatywne Rozwiązania

### Local Processing
- Natural.js
- Compromise
- String-strip-html

### Cloud Services
- AWS Textract
- Google Cloud Document AI
- Azure Form Recognizer 