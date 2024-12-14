interface Memory {
  shortTerm: {
    messages: Message[];
    maxTokens: number;
    currentTokens: number;
  };
  longTerm: {
    context: string;
    lastUpdated: Date;
  };
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  tokens: number;
}

export class LLMMemoryManager {
  private memory: Memory;
  
  constructor(maxTokens: number = 4000) {
    this.memory = {
      shortTerm: {
        messages: [],
        maxTokens: maxTokens,
        currentTokens: 0
      },
      longTerm: {
        context: '',
        lastUpdated: new Date()
      }
    };
  }

  addMessage(message: Message): boolean {
    if (this.memory.shortTerm.currentTokens + message.tokens > this.memory.shortTerm.maxTokens) {
      this.optimizeMemory();
    }
    
    this.memory.shortTerm.messages.push(message);
    this.memory.shortTerm.currentTokens += message.tokens;
    return true;
  }

  private optimizeMemory(): void {
    // Usuń najstarsze wiadomości, zachowując kontekst systemowy
    const systemMessages = this.memory.shortTerm.messages.filter(m => m.role === 'system');
    const otherMessages = this.memory.shortTerm.messages.filter(m => m.role !== 'system');
    
    while (this.memory.shortTerm.currentTokens > this.memory.shortTerm.maxTokens * 0.7) {
      const removed = otherMessages.shift();
      if (removed) {
        this.memory.shortTerm.currentTokens -= removed.tokens;
      } else {
        break;
      }
    }

    this.memory.shortTerm.messages = [...systemMessages, ...otherMessages];
  }

  getContext(): Message[] {
    return this.memory.shortTerm.messages;
  }

  updateLongTermMemory(context: string): void {
    this.memory.longTerm.context = context;
    this.memory.longTerm.lastUpdated = new Date();
  }
} 