interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxEntries: number;
}

interface CacheEntry {
  value: string;
  timestamp: number;
  tokens: number;
  cost: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new Map();
    this.config = {
      ttl: config?.ttl || 1000 * 60 * 60, // 1 godzina
      maxEntries: config?.maxEntries || 1000
    };
  }

  // Generuj klucz cache na podstawie promptu i parametrów
  private generateKey(prompt: string, params: Record<string, any>): string {
    return JSON.stringify({
      prompt: prompt.toLowerCase().trim(),
      ...params
    });
  }

  // Zapisz odpowiedź w cache
  set(prompt: string, value: string, params: Record<string, any>, tokens: number, cost: number): void {
    const key = this.generateKey(prompt, params);
    
    // Jeśli cache jest pełny, usuń najstarszy wpis
    if (this.cache.size >= this.config.maxEntries) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      tokens,
      cost
    });
  }

  // Pobierz odpowiedź z cache
  get(prompt: string, params: Record<string, any>): string | null {
    const key = this.generateKey(prompt, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Sprawdź czy wpis nie wygasł
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  // Pobierz statystyki cache
  getStats(): Record<string, number> {
    let totalTokens = 0;
    let totalCost = 0;
    let hitCount = 0;

    this.cache.forEach(entry => {
      totalTokens += entry.tokens;
      totalCost += entry.cost;
      hitCount++;
    });

    return {
      entries: this.cache.size,
      totalTokens,
      totalCost,
      hitCount
    };
  }

  // Wyczyść cache
  clear(): void {
    this.cache.clear();
  }
} 