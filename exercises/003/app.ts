import { openai, getChatCompletion } from '../../utils/api/openai';
import { api, fetchData } from '../../utils/api/axios';
import { processInParallel } from '../../utils/helpers/arrayUtils';
import { safeEval, verifyCalculation } from '../../utils/helpers/mathUtils';
import type { Test, JsonData, ApiResponse } from '../../utils/types';
import { API_ENDPOINTS, CHUNK_SIZE } from '../../utils/constants';
import dotenv from 'dotenv';
import { SystemPrompts } from '../../utils/prompts/systemPrompts';

dotenv.config();

class JsonCalibrationFixer {
    private readonly API_URL: string;

    constructor() {
        this.API_URL = `${API_ENDPOINTS.CENTRALA}/data/${process.env.PERSONAL_API_KEY}/json.txt`;
    }

    private async fixCalculation(calculation: string, expected: number): Promise<string> {
        try {
            // First check if calculation is correct
            const result = safeEval(calculation);
            if (Math.abs(result - expected) < Number.EPSILON) {
                return calculation; // Calculation is correct
            }

            // If calculation is incorrect, ask AI to fix it
            const prompt = `Fix this mathematical calculation to get result ${expected}: ${calculation}`;
            const fixedCalculation = await getChatCompletion(prompt, SystemPrompts.MATH_EXPERT);
            
            // Verify the fixed calculation
            if (fixedCalculation && verifyCalculation(fixedCalculation, expected)) {
                return fixedCalculation;
            }
            
            // If AI couldn't fix it, return original
            return calculation;
        } catch {
            return calculation;
        }
    }

    private async fixTest(test: Test): Promise<Test> {
        const fixedTest = { ...test };

        // Fix missing answers using AI
        if (test.q && !test.a) {
            fixedTest.a = await getChatCompletion(test.q, SystemPrompts.ROBO_ISO_2230);
        }

        // Fix calculations
        if (test.calculation && test.expected !== undefined) {
            fixedTest.calculation = await this.fixCalculation(test.calculation, test.expected);
        }

        return fixedTest;
    }

    public async fixJsonFile(): Promise<void> {
        try {
            console.log('🔄 Fetching JSON file...');
            const jsonData = await fetchData<JsonData>(this.API_URL);
            
            console.log('🛠️ Fixing tests...');
            const fixedTests = await processInParallel(
                jsonData.tests,
                test => this.fixTest(test),
                CHUNK_SIZE
            );

            const fixedJson: JsonData = { tests: fixedTests };

            console.log('📤 Sending fixed JSON...');
            const response = await api.post<ApiResponse>(API_ENDPOINTS.REPORT, fixedJson);
            console.log('✅ Response:', response.data);

        } catch (error) {
            console.error('❌ Error:', error);
            throw error;
        }
    }
}

// Run the fixer
if (require.main === module) {
    const fixer = new JsonCalibrationFixer();
    fixer.fixJsonFile()
        .catch(console.error);
}

export default JsonCalibrationFixer; 