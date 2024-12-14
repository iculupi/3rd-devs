# Streaming i WebSocket w LLM

## Architektura Streamingu

### 1. Stream Manager
```typescript
interface StreamManager {
  // Podstawowe operacje
  startStream(config: StreamConfig): Promise<Stream>;
  stopStream(streamId: string): Promise<void>;
  pauseStream(streamId: string): Promise<void>;
  
  // Zaawansowane operacje
  handleBackpressure(streamId: string): Promise<void>;
  reconnect(streamId: string): Promise<Stream>;
  monitorHealth(streamId: string): StreamHealth;
}

interface StreamConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  streamOptions: {
    chunkSize: number;
    timeout: number;
    retryAttempts: number;
  };
}
```

### 2. WebSocket Handler
```typescript
interface WebSocketHandler {
  // Zarządzanie połączeniami
  connect(url: string, options: WSOptions): Promise<WebSocket>;
  disconnect(code?: number, reason?: string): void;
  reconnect(retryAttempts?: number): Promise<WebSocket>;
  
  // Obsługa wiadomości
  send(data: any): Promise<void>;
  subscribe(channel: string): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
}
```

## Implementacja

### 1. Streaming LLM
```typescript
class LLMStreamer {
  private stream: StreamManager;
  private tokenizer: Tokenizer;
  
  async streamCompletion(prompt: string, options: StreamOptions): AsyncIterator<string> {
    // 1. Inicjalizacja streamu
    const stream = await this.stream.startStream({
      model: options.model,
      maxTokens: options.maxTokens,
      temperature: options.temperature
    });
    
    // 2. Przetwarzanie chunków
    try {
      for await (const chunk of stream) {
        const tokens = this.tokenizer.decode(chunk);
        yield tokens;
      }
    } finally {
      await this.stream.stopStream(stream.id);
    }
  }
}
```

### 2. WebSocket Server
```typescript
class LLMWebSocketServer {
  private wss: WebSocketServer;
  private llm: LLMService;
  
  constructor() {
    this.wss = new WebSocketServer({ port: 8080 });
    this.setupHandlers();
  }
  
  private setupHandlers() {
    this.wss.on('connection', (ws) => {
      ws.on('message', async (message) => {
        const { prompt, options } = JSON.parse(message.toString());
        
        // Stream odpowiedzi
        try {
          for await (const chunk of this.llm.streamCompletion(prompt, options)) {
            ws.send(JSON.stringify({ type: 'chunk', data: chunk }));
          }
          ws.send(JSON.stringify({ type: 'done' }));
        } catch (error) {
          ws.send(JSON.stringify({ type: 'error', error: error.message }));
        }
      });
    });
  }
}
```

## Przykłady Użycia

### 1. Streaming Completion
```typescript
async function streamCompletion() {
  const streamer = new LLMStreamer();
  const output = document.getElementById('output');
  
  // 1. Konfiguracja streamu
  const stream = await streamer.streamCompletion(
    "Napisz długą historię o...",
    {
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7
    }
  );
  
  // 2. Obsługa chunków
  try {
    for await (const chunk of stream) {
      output.textContent += chunk;
      await new Promise(resolve => setTimeout(resolve, 50)); // Smooth rendering
    }
  } catch (error) {
    console.error('Stream error:', error);
  }
}
```

### 2. WebSocket Client
```typescript
class LLMWebSocketClient {
  private ws: WebSocket;
  private messageHandler: MessageHandler;
  
  async connect() {
    this.ws = new WebSocket('ws://localhost:8080');
    
    this.ws.onmessage = (event) => {
      const { type, data, error } = JSON.parse(event.data);
      
      switch (type) {
        case 'chunk':
          this.messageHandler.handleChunk(data);
          break;
        case 'done':
          this.messageHandler.handleComplete();
          break;
        case 'error':
          this.messageHandler.handleError(error);
          break;
      }
    };
    
    return new Promise((resolve) => {
      this.ws.onopen = () => resolve(this.ws);
    });
  }
}
```

## Dobre Praktyki

### 1. Streaming
- Obsługa backpressure
- Buforowanie chunków
- Graceful shutdown
- Retry logic

### 2. WebSocket
- Heartbeat mechanizm
- Reconnection strategy
- Error handling
- Message queuing

### 3. Optymalizacja
- Batch processing
- Compression
- Connection pooling
- Load balancing

## Metryki i Monitoring

### 1. Stream Metryki
```typescript
interface StreamMetrics {
  throughput: number;
  latency: number;
  chunkSize: number;
  backpressureEvents: number;
  errors: {
    count: number;
    types: Record<string, number>;
  };
}
```

### 2. WebSocket Metryki
```typescript
interface WebSocketMetrics {
  connections: {
    active: number;
    peak: number;
    total: number;
  };
  messages: {
    sent: number;
    received: number;
    dropped: number;
  };
  performance: {
    avgLatency: number;
    messageRate: number;
    bandwidth: number;
  };
}
``` 