import { BaseTask } from '../../utils/tasks/baseTask';
import { api, fetchData } from '../../utils/api/axios';
import { processInParallel } from '../../utils/helpers/arrayUtils';
import { TestFixer } from '../../utils/testers/testFixer';
import { JsonSplitter } from '../../utils/helpers/jsonSplitter';
import type { JsonData, ApiResponse, TaskSubmission } from '../../utils/types';
import { API_ENDPOINTS, TASK_NAMES } from '../../utils/constants';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getChatCompletion } from '../../utils/api/openai';
import { SystemPrompts } from '../../utils/prompts/systemPrompts';

interface TestItem {
    question: string;
    answer?: number | string;
    test?: {
        q: string;
        a: string;
    };
}

class JsonCalibrationFixer extends BaseTask {
    private testFixer: TestFixer;
    private jsonSplitter: JsonSplitter;

    constructor() {
        super('003');
        this.testFixer = new TestFixer();
        this.jsonSplitter = new JsonSplitter('003', 100); // 100 testów na chunk
    }

    private async logApiKeyChange(context: string, originalKey: string, currentKey: string) {
        const timestamp = new Date().toISOString();
        const logPath = path.join(this.taskDir, 'apikey_changes.log');
        
        const logEntry = {
            timestamp,
            context,
            original: originalKey,
            current: currentKey,
            matches: originalKey === currentKey,
            location: new Error().stack?.split('\n')[2] // Lokalizacja w kodzie
        };

        await fs.appendFile(
            logPath,
            JSON.stringify(logEntry, null, 2) + '\n---\n'
        );

        if (originalKey !== currentKey) {
            console.warn('⚠️ API Key change detected:', {
                context,
                original: originalKey.substring(0, 8) + '...',
                current: currentKey.substring(0, 8) + '...'
            });
        }
    }

    private async processChunk(chunk: JsonData): Promise<JsonData> {
        if (!chunk || !Array.isArray(chunk['test-data'])) {
            throw new Error('Invalid chunk format');
        }

        const fixedTests = await Promise.all(
            chunk['test-data'].map(async (test) => {
                return await this.testFixer.fixTest(test);
            })
        );

        return {
            ...chunk,
            'test-data': fixedTests
        };
    }

    private async saveInputJson(data: JsonData): Promise<void> {
        const inputPath = path.join(this.taskDir, 'input.json');
        await fs.writeFile(
            inputPath,
            JSON.stringify(data, null, 2)
        );
        console.log('💾 Input data saved to:', inputPath);
    }

    private async saveOutputJson(data: TaskSubmission): Promise<void> {
        const outputPath = path.join(this.taskDir, 'output.json');
        await fs.writeFile(
            outputPath,
            JSON.stringify(data, null, 2)
        );
        console.log('💾 Output data saved to:', outputPath);
    }

    public async execute(): Promise<void> {
        try {
            // Wyczyść poprzednie pliki
            await this.jsonSplitter.cleanup();

            // Zabezpiecz klucz API na początku wykonania
            const personalApiKey = process.env.PERSONAL_API_KEY!;
            Object.freeze(personalApiKey);

            console.log('🔄 Fetching JSON file...');
            const jsonData = await fetchData<JsonData>(this.API_URL);
            
            // Zapisz plik wejściowy
            await this.saveInputJson(jsonData);
            
            // Monitoruj klucz przed przetwarzaniem
            await this.logApiKeyChange(
                'Before processing',
                personalApiKey,
                jsonData.apikey
            );

            // Zapisz i podziel plik na chunki
            console.log('📂 Splitting JSON file...');
            const chunkPaths = await this.jsonSplitter.splitAndSave(jsonData);
            
            console.log(`🔍 Processing ${chunkPaths.length} chunks...`);
            const fixedChunks: JsonData[] = [];

            // Przetwórz każdy chunk
            for (let i = 0; i < chunkPaths.length; i++) {
                console.log(`\n📝 Processing chunk ${i + 1}/${chunkPaths.length}`);
                const chunk = await this.jsonSplitter.loadChunk(i + 1);
                
                // Sprawdź klucz przed przetworzeniem chunka
                await this.logApiKeyChange(
                    `Before processing chunk ${i + 1}/${chunkPaths.length}`,
                    personalApiKey,
                    chunk.apikey
                );

                // Napraw testy w chunku
                const fixedChunk = await this.processChunk(chunk);

                // Zachowaj oryginalny klucz API
                fixedChunk.apikey = personalApiKey;

                // Sprawdź klucz po przetworzeniu chunka
                await this.logApiKeyChange(
                    `After processing chunk ${i + 1}/${chunkPaths.length}`,
                    personalApiKey,
                    fixedChunk.apikey
                );

                fixedChunks.push(fixedChunk);
            }

            // Połącz wszystkie chunki w jeden obiekt
            const fixedJson: JsonData = {
                apikey: personalApiKey,
                description: jsonData.description,
                copyright: jsonData.copyright,
                'test-data': fixedChunks.reduce((allTests, chunk) => 
                    allTests.concat(chunk['test-data']), [] as TestItem[])
            };

            // Sprawdź klucz przed wysłaniem
            await this.logApiKeyChange(
                'Final check before sending',
                personalApiKey,
                fixedJson.apikey
            );

            // Przygotuj dane wyjściowe
            const outputData: TaskSubmission = {
                task: 'JSON',
                apikey: personalApiKey,
                answer: fixedJson
            };

            // Zapisz plik wyjściowy
            await this.saveOutputJson(outputData);

            // Wyślij dane do API
            console.log('📤 Sending data to API...');
            const response = await api.post<ApiResponse>(
                API_ENDPOINTS.REPORT,
                outputData
            );

            // Zapisz odpowiedź w osobnym pliku z timestampem
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const responsePath = path.join(
                this.taskDir, 
                'api_responses',
                `response_${timestamp}.json`
            );

            // Upewnij się, że folder api_responses istnieje
            await fs.mkdir(path.join(this.taskDir, 'api_responses'), { recursive: true });

            // Zapisz odpowiedź
            await fs.writeFile(
                responsePath,
                JSON.stringify({
                    timestamp,
                    response: response.data,
                    requestSize: JSON.stringify(fixedJson).length,
                    testsCount: fixedJson['test-data'].length
                }, null, 2)
            );
            console.log('💾 Response saved to:', responsePath);

            // Dodajmy bardziej szczegółowe logowanie
            console.log('\n📋 API Response:');
            console.log('================');
            console.log(JSON.stringify(response.data, null, 2));
            console.log('================\n');

            await this.saveOutput({
                stage: 'response',
                data: response.data,
                metadata: {
                    tags: ['api-response'],
                    notes: 'Final response from API',
                    timestamp: new Date().toISOString(),
                    totalProcessedTests: fixedChunks.reduce((sum, chunk) => sum + chunk['test-data'].length, 0)
                }
            });

            // Zapisz podsumowanie
            const summary = `# Task 003 - JSON Calibration Results

## Response from API
\`\`\`json
${JSON.stringify(response.data, null, 2)}
\`\`\`

## Statistics
- Total chunks processed: ${fixedChunks.length}
- Total tests processed: ${fixedChunks.reduce((sum, chunk) => sum + chunk['test-data'].length, 0)}
- Processing completed at: ${new Date().toLocaleString()}

## Status
${response.data.success ? '✅ Success' : '❌ Failed'}
`;

            await this.saveSummary(summary);

            console.log('💡 Response:', response.data);

        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}

// Run the fixer
if (require.main === module) {
    const fixer = new JsonCalibrationFixer();
    fixer.execute()
        .catch(console.error);
}

export default JsonCalibrationFixer; 