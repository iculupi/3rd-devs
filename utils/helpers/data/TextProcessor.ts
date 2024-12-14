/**
 * Utility class for splitting text into manageable chunks
 * @class TextSplitter
 */
export class TextSplitter {
    /**
     * Splits text into chunks while trying to preserve sentence boundaries
     * @param {string} text - Text to be split into chunks
     * @param {number} chunkSize - Maximum size of each chunk
     * @returns {string[]} Array of text chunks
     * @static
     * 
     * @example
     * const chunks = TextSplitter.splitIntoChunks("Long text...", 1000);
     */
    static splitIntoChunks(text: string, chunkSize: number): string[] {
        const chunks: string[] = [];
        let currentChunk = '';
        // Split text at sentence boundaries (after .!?)
        const sentences = text.split(/(?<=[.!?])\s+/);

        for (const sentence of sentences) {
            // Check if adding next sentence would exceed chunk size
            if ((currentChunk + sentence).length > chunkSize) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
                // Handle sentences longer than chunk size
                if (sentence.length > chunkSize) {
                    const parts = sentence.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
                    chunks.push(...parts);
                    continue;
                }
            }
            currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
        
        // Add remaining text as final chunk
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
} 