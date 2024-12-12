import { BaseTask } from '../../utils/tasks/baseTask';
import { api } from '../../utils/api/axios';
import { API_ENDPOINTS, TASK_NAMES, CHUNK_SIZES } from '../../utils/constants';
import { SystemPrompts } from '../../utils/prompts/systemPrompts';
import { FileUtils } from '../../utils/helpers/fileUtils';
import { TextSplitter } from '../../utils/helpers/textSplitter';
import { TextCensor } from '../../utils/processors/textCensor';
import type { CensorshipResponse } from '../../utils/types';
import * as path from 'path';
import * as fs from 'fs/promises';
import { TokenCounter, TOKEN_LIMITS } from '../../utils/helpers/tokenCounter';

/**
 * Class handling the censorship task for sensitive data in text
 * @class CensorshipTask
 * @extends BaseTask
 */
class CensorshipTask extends BaseTask {
    private readonly inputUrl: string;

    /**
     * Creates an instance of CensorshipTask
     * @constructor
     */
    constructor() {
        super('005');
        this.inputUrl = `${API_ENDPOINTS.CENTRALA}/data/${process.env.PERSONAL_API_KEY}/cenzura.txt`;
    }

    /**
     * Processes entire text by splitting it into chunks and censoring each chunk
     * @param {string} text - Full text to be censored
     * @returns {Promise<string>} Complete censored text
     * @throws {Error} When text processing fails
     * @private
     */
    private async censorText(text: string): Promise<string> {
        try {
            console.log('📏 Splitting text into chunks...');
            const validation = TokenCounter.validateOperation(text);
            const chunks = TextSplitter.splitIntoChunks(text, validation.details.chunkSize);
            console.log(`🔄 Processing ${chunks.length} chunks...`);

            const censoredChunks = [];
            for (let i = 0; i < chunks.length; i++) {
                console.log(`📝 Processing chunk ${i + 1}/${chunks.length}`);
                const censoredChunk = await TextCensor.censorChunk(chunks[i], SystemPrompts.CENSORSHIP);
                censoredChunks.push(censoredChunk);

                await this.saveOutput({
                    stage: 'processed',
                    data: {
                        processedChunks: i + 1,
                        totalChunks: chunks.length,
                        lastChunkLength: censoredChunk.length
                    }
                });
            }

            return censoredChunks.join(' ');
        } catch (error) {
            console.error('Error during censorship:', error);
            throw error;
        }
    }

    private cleanupDoubleCensorship(text: string): string {
        // Zamień wielokrotne wystąpienia CENZURA (oddzielone tylko spacjami) na pojedyncze
        return text.replace(/CENZURA(\s+CENZURA)+/g, 'CENZURA');
    }

    /**
     * Executes the censorship task from start to finish
     * @returns {Promise<void>}
     * @throws {Error} When task execution fails
     * @public
     */
    public async execute(): Promise<void> {
        try {
            // Utwórz folder dla wyników
            const outputDir = path.join(this.taskDir, 'output');
            await fs.mkdir(outputDir, { recursive: true });

            // Fetch the text file
            console.log('🔄 Fetching text file...');
            const response = await api.get(this.inputUrl, {
                responseType: 'text',
                headers: {
                    'Accept': 'text/plain'
                }
            });
            
            const text = response.data;
            
            // Save original file to output directory
            await FileUtils.saveText(
                path.join(outputDir, 'cenzura.txt'), 
                text, 
                'Original text'
            );

            // Cenzuruj tekst bezpośrednio
            console.log('✂️ Censoring sensitive data...');
            let censoredText = await TextCensor.censorChunk(text, SystemPrompts.CENSORSHIP);
            
            // Wyczyść podwójne wystąpienia CENZURA
            console.log('🧹 Cleaning up multiple censorship occurrences...');
            censoredText = this.cleanupDoubleCensorship(censoredText);
            
            // Save censored text and answer separately
            await FileUtils.saveText(
                path.join(outputDir, 'censored.txt'), 
                censoredText, 
                'Censored text'
            );

            const answer = {
                task: TASK_NAMES.CENZURA,
                apikey: process.env.PERSONAL_API_KEY!,
                answer: censoredText
            };

            await FileUtils.saveText(
                path.join(outputDir, 'answer.json'), 
                JSON.stringify(answer, null, 2), 
                'Answer JSON'
            );

            // Send to API
            console.log('📤 Sending data to API...');
            const apiResponse = await api.post(
                API_ENDPOINTS.REPORT,
                answer
            );

            // Save the response
            await this.saveOutput({
                stage: 'response',
                data: apiResponse.data,
                metadata: {
                    timestamp: new Date().toISOString(),
                    inputLength: text.length,
                    outputLength: censoredText.length
                }
            });

            console.log('✅ Task completed successfully!');

        } catch (error) {
            // Save error information
            await this.saveOutput({
                stage: 'error',
                data: {
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                }
            });
            
            console.error('Error:', error);
            throw error;
        }
    }
}

// Run the task
if (require.main === module) {
    const task = new CensorshipTask();
    task.execute()
        .catch(console.error);
}

export default CensorshipTask; 