# Katalog Przykładów i Narzędzi

## 1. Przetwarzanie Tekstu
### Text Splitter
Lokalizacja: `/text-splitter`
```typescript
import { TextSplitter } from '../utils/helpers';
```
Zastosowanie:
- Dzielenie długich tekstów na mniejsze chunki
- Zachowanie kontekstu zdań
- Optymalizacja dla tokenów

Alternatywy:
- Langchain Text Splitter
- Własna implementacja z RegExp

### Unstructured
Lokalizacja: `/unstructured`
Funkcje:
- Parsowanie nieustrukturyzowanych danych
- Ekstrakcja tekstu z różnych formatów
- Normalizacja danych

## 2. Wyszukiwanie i Bazy Danych
### Algolia
Lokalizacja: `/algolia`
Możliwości:
- Szybkie wyszukiwanie pełnotekstowe
- Faceted search
- Typo-tolerance

### Qdrant
Lokalizacja: `/qdrant`
Zastosowanie:
- Vector database
- Similarity search
- Clustering

## 3. Embeddingi i RAG
### Embedding
Lokalizacja: `/embedding`
Funkcje:
- Generowanie embeddingów
- Zapisywanie do vector store
- Semantic search

### Rerank
Lokalizacja: `/rerank`
Zastosowanie:
- Poprawianie wyników wyszukiwania
- Cross-encoder scoring
- Hybrid search

### Naive RAG vs Better RAG
Lokalizacja: `/naive-rag`, `/better-rag`
Porównanie:
- Podstawowa implementacja vs Zaawansowana
- Chunking strategies
- Context window optimization

## 4. Narzędzia Audio/Video
### Audio Processing
Lokalizacja: `/audio`
Możliwości:
- Transkrypcja (Whisper)
- Text-to-Speech (ElevenLabs)
- Audio manipulation

### Video Processing
Lokalizacja: `/video`
Funkcje:
- Ekstrakcja klatek
- OCR na wideo
- Generowanie napisów

## 5. Integracje API
### Linear
Lokalizacja: `/linear`
Zastosowanie:
- Issue tracking
- Project management
- Workflow automation

### External APIs
Lokalizacja: `/external`
Przykłady:
- Google API
- Spotify API
- Custom REST APIs

## 6. Narzędzia Developerskie
### SDK
Lokalizacja: `/sdk`
Features:
- API wrappers
- Type safety
- Error handling

### Tools
Lokalizacja: `/tools`
Utility functions:
- File operations
- Data validation
- Type conversion

## 7. Monitoring i Analytics
### Langfuse
Lokalizacja: `/langfuse`
Możliwości:
- LLM monitoring
- Performance tracking
- Cost analysis

### Tiktokenizer
Lokalizacja: `/tiktokenizer`
Funkcje:
- Token counting
- Cost estimation
- Model compatibility check 