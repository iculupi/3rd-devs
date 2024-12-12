import { TOKEN_LIMITS, TOKEN_SAFETY, MODEL_TYPES } from '../constants';

export interface TokenValidationResult {
    safe: boolean;
    details: {
        inputLength: number;
        recommendedChunks: number;
        chunkSize: number;
    };
}

export class TokenCounter {
    // Bezpieczny rozmiar chunka w znakach (~750 tokenów)
    private static readonly SAFE_CHUNK_SIZE = 3000;
    private static readonly MAX_CHUNKS = 50;

    /**
     * Validates text and calculates safe chunk size
     * @param text Input text to validate
     * @returns Validation result with chunk details
     */
    static validateOperation(text: string): TokenValidationResult {
        const inputLength = text.length;
        const recommendedChunks = Math.ceil(inputLength / this.SAFE_CHUNK_SIZE);

        if (recommendedChunks > this.MAX_CHUNKS) {
            throw new Error(`Text too large: would require ${recommendedChunks} chunks (max: ${this.MAX_CHUNKS})`);
        }

        return {
            safe: recommendedChunks <= this.MAX_CHUNKS,
            details: {
                inputLength,
                recommendedChunks,
                chunkSize: this.SAFE_CHUNK_SIZE
            }
        };
    }
} 