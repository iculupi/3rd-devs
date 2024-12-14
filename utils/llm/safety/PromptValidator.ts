export class PromptSafetyManager {
  private readonly dangerousPatterns: RegExp[] = [
    /ignore previous instructions/i,
    /ignore all rules/i,
    /system prompt/i,
    // Dodaj więcej wzorców
  ];

  private readonly maxPromptLength: number = 4096; // Domyślny limit

  sanitizePrompt(prompt: string): string {
    // Usuń potencjalnie niebezpieczne sekwencje
    let sanitized = prompt;
    this.dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REMOVED]');
    });

    // Przytnij do maksymalnej długości
    if (sanitized.length > this.maxPromptLength) {
      sanitized = sanitized.substring(0, this.maxPromptLength);
    }

    return sanitized;
  }

  validatePrompt(prompt: string): boolean {
    // Sprawdź czy prompt nie zawiera niebezpiecznych wzorców
    return !this.dangerousPatterns.some(pattern => pattern.test(prompt));
  }

  checkPromptInjection(prompt: string): boolean {
    // Implementacja wykrywania prompt injection
    const injectionPatterns = [
      /system:/i,
      /assistant:/i,
      /\<\/?system\>/i,
      /\<\/?assistant\>/i
    ];

    return !injectionPatterns.some(pattern => pattern.test(prompt));
  }
} 