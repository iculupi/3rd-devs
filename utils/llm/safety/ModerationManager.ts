interface ModerationConfig {
  maxToxicityScore: number;
  bannedTopics: string[];
  languageFilter: 'strict' | 'moderate' | 'lenient';
}

interface ModerationResult {
  isAccepted: boolean;
  reason?: string;
  toxicityScore?: number;
}

export class ModerationManager {
  private config: ModerationConfig;

  constructor(config?: Partial<ModerationConfig>) {
    this.config = {
      maxToxicityScore: config?.maxToxicityScore || 0.7,
      bannedTopics: config?.bannedTopics || [],
      languageFilter: config?.languageFilter || 'moderate'
    };
  }

  async moderateContent(content: string): Promise<ModerationResult> {
    // Tu można dodać integrację z OpenAI Moderation API
    // lub własną implementację
    
    // Przykładowa implementacja:
    const hasBannedTopic = this.config.bannedTopics.some(
      topic => content.toLowerCase().includes(topic.toLowerCase())
    );

    if (hasBannedTopic) {
      return {
        isAccepted: false,
        reason: 'Content contains banned topics'
      };
    }

    return {
      isAccepted: true,
      toxicityScore: 0
    };
  }

  async moderateStream(
    stream: AsyncIterator<string>,
    onViolation: (reason: string) => void
  ): AsyncIterator<string> {
    const buffer: string[] = [];
    
    return {
      async next() {
        const { value, done } = await stream.next();
        
        if (done) {
          return { value: undefined, done: true };
        }

        buffer.push(value);
        
        // Sprawdź co 100 znaków
        if (buffer.join('').length > 100) {
          const content = buffer.join('');
          const result = await new ModerationManager().moderateContent(content);
          
          if (!result.isAccepted) {
            onViolation(result.reason || 'Content violation');
            return { value: undefined, done: true };
          }
          
          buffer.length = 0;
        }

        return { value, done: false };
      }
    };
  }
} 