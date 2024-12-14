interface TokenConfig {
  maxTokens: number;
  reservedSystemTokens: number;
  costPerToken: number;
  model: string;
}

export class TokenManager {
  private config: TokenConfig;
  private systemTokensUsed: number = 0;

  constructor(config: TokenConfig) {
    this.config = config;
  }

  // Szacowanie liczby tokenów (prosta implementacja)
  estimateTokens(text: string): number {
    // Bardzo proste przybliżenie - około 4 znaki na token
    return Math.ceil(text.length / 4);
  }

  // Sprawdź czy mamy wystarczająco tokenów
  hasEnoughTokens(prompt: string, expectedResponse: number): boolean {
    const promptTokens = this.estimateTokens(prompt);
    const totalRequired = promptTokens + expectedResponse + this.systemTokensUsed;
    return totalRequired <= this.config.maxTokens;
  }

  // Oblicz dostępne tokeny dla odpowiedzi
  getAvailableResponseTokens(prompt: string): number {
    const promptTokens = this.estimateTokens(prompt);
    const available = this.config.maxTokens - promptTokens - this.systemTokensUsed;
    return Math.max(0, available);
  }

  // Zarejestruj użycie tokenów systemowych
  registerSystemTokens(text: string): void {
    const tokens = this.estimateTokens(text);
    if (tokens > this.config.reservedSystemTokens) {
      throw new Error('System prompt exceeds reserved tokens');
    }
    this.systemTokensUsed = tokens;
  }

  // Oszacuj koszt
  estimateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens + outputTokens) * this.config.costPerToken;
  }
} 