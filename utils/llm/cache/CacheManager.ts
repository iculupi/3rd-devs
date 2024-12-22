import { FileManager } from '../../helpers/files/FileManager';

interface CacheConfig {
  ttl: number;
  maxEntries: number;
  persistPath?: string;
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
      ttl: config?.ttl || 1000 * 60 * 60,
      maxEntries: config?.maxEntries || 1000,
      persistPath: config?.persistPath
    };
    this.loadCache();
  }

  private async loadCache() {
    if (this.config.persistPath) {
      try {
        const data = await FileManager.readJson<Record<string, CacheEntry>>(this.config.persistPath);
        this.cache = new Map(Object.entries(data));
      } catch (error) {
        console.warn('Failed to load cache:', error);
      }
    }
  }

  private async saveCache() {
    if (this.config.persistPath) {
      try {
        const data = Object.fromEntries(this.cache.entries());
        await FileManager.writeJson(this.config.persistPath, data);
      } catch (error) {
        console.error('Failed to save cache:', error);
      }
    }
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