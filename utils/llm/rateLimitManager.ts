interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxTokensPerMinute: number;
  maxConcurrentRequests: number;
}

interface RequestLog {
  timestamp: number;
  tokens: number;
}

export class RateLimitManager {
  private config: RateLimitConfig;
  private requestLog: RequestLog[] = [];
  private activeRequests: number = 0;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private cleanOldRequests(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.requestLog = this.requestLog.filter(log => log.timestamp > oneMinuteAgo);
  }

  async checkRateLimit(tokens: number): Promise<boolean> {
    this.cleanOldRequests();

    // Sprawdź limity
    const currentRequests = this.requestLog.length;
    const currentTokens = this.requestLog.reduce((sum, log) => sum + log.tokens, 0);

    if (
      currentRequests >= this.config.maxRequestsPerMinute ||
      currentTokens + tokens >= this.config.maxTokensPerMinute ||
      this.activeRequests >= this.config.maxConcurrentRequests
    ) {
      return false;
    }

    // Zarejestruj nowe żądanie
    this.requestLog.push({
      timestamp: Date.now(),
      tokens
    });
    this.activeRequests++;

    return true;
  }

  releaseRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  async waitForCapacity(tokens: number): Promise<void> {
    while (!(await this.checkRateLimit(tokens))) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
} 