interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export class LLMRetryManager {
  private config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxAttempts: config?.maxAttempts || 3,
      initialDelay: config?.initialDelay || 1000,
      maxDelay: config?.maxDelay || 10000,
      backoffFactor: config?.backoffFactor || 2
    };
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    isRetryable: (error: any) => boolean
  ): Promise<T> {
    let lastError: any;
    let delay = this.config.initialDelay;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (!isRetryable(error) || attempt === this.config.maxAttempts) {
          throw error;
        }

        await this.sleep(delay);
        delay = Math.min(delay * this.config.backoffFactor, this.config.maxDelay);
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 