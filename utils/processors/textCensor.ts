import { openai } from '../api/openai';
import { SystemPrompts } from '../prompts/systemPrompts';

export class TextCensor {
    /**
     * Processes a single chunk of text through OpenAI API for censorship
     * @param {string} chunk - Text chunk to be censored
     * @param {string} systemPrompt - System prompt for censorship
     * @returns {Promise<string>} Censored text chunk
     * @throws {Error} When OpenAI API fails or returns no response
     */
    static async censorChunk(chunk: string, systemPrompt: string): Promise<string> {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: chunk
                    }
                ],
                temperature: 0.1
            });

            const result = completion.choices[0]?.message?.content;
            if (!result) {
                throw new Error('No response from OpenAI');
            }

            return result;
        } catch (error) {
            console.error('Error during chunk censorship:', error);
            throw error;
        }
    }
} 