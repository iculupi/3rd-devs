import OpenAI from 'openai';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class QuestionSolver {
    private readonly openai: OpenAI;
    private readonly baseUrl: string = 'https://xyz.ag3nts.org/';
    private readonly credentials = {
        username: 'tester',
        password: '574e112a'
    };

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    private async fetchWebPage(): Promise<string> {
        try {
            const response = await axios.get(this.baseUrl);
            return response.data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to fetch webpage: ${errorMessage}`);
        }
    }

    private extractQuestion(html: string): string {
        const $ = cheerio.load(html);
        const questionElement = $('#human-question');
        if (!questionElement.length) {
            throw new Error('Question element not found');
        }
        const fullText = questionElement.text();
        return fullText.split('Question:')[1]?.trim() || '';
    }

    private async getAIAnswer(question: string): Promise<string> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a numerical answer generator. Provide only the numerical result without any explanation or additional text."
                    },
                    {
                        role: "user",
                        content: question
                    }
                ],
                temperature: 0.3, // Lower temperature for more focused numerical responses
                max_tokens: 10    // Limit response length
            });

            return completion.choices[0]?.message?.content?.trim() || '';
        } catch (error: any) {
            throw new Error(`OpenAI API error: ${error?.message || 'Unknown error'}`);
        }
    }

    private async submitAnswer(answer: string): Promise<AxiosResponse> {
        const formData = new URLSearchParams({
            ...this.credentials,
            answer: answer
        });

        try {
            return await axios.post(this.baseUrl, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to submit answer: ${errorMessage}`);
        }
    }

    public async solve(): Promise<void> {
        try {
            console.log('🔄 Fetching question...');
            const html = await this.fetchWebPage();

            console.log('📝 Extracting question...');
            const question = this.extractQuestion(html);
            console.log(`Question found: ${question}`);

            console.log('🤖 Getting AI answer...');
            const answer = await this.getAIAnswer(question);
            console.log(`AI provided answer: ${answer}`);

            console.log('📤 Submitting answer...');
            const response = await this.submitAnswer(answer);
            
            console.log('✅ Server Response:', response.data);
        } catch (error) {
            console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    }
}

// Execute the solver
if (require.main === module) {
    const solver = new QuestionSolver();
    solver.solve();
}

export default QuestionSolver; 