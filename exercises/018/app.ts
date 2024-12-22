import { config } from 'dotenv';
import { CentralaHandler } from '../../utils/api/handlers/CentralaHandler';
import { OpenAIClient } from '../../utils/api/clients/OpenAIClient';
import { FileManager } from '../../utils/helpers/files/FileManager';
import { CacheManager } from '../../utils/llm/cache/CacheManager';
import TurndownService from 'turndown';
import axios from 'axios';
import path from 'path';

config();

class WebScraper {
    private visitedUrlsByQuestion = new Map<string, Set<string>>();
    private turndownService: TurndownService;
    private openai: OpenAIClient;
    private cache: CacheManager;

    constructor(
        private baseUrl: string = 'https://softo.ag3nts.org',
        private model: string = 'gpt-4o-mini'
    ) {
        this.turndownService = new TurndownService();
        this.openai = new OpenAIClient();
        this.cache = new CacheManager({
            persistPath: path.join(__dirname, this.model, 'cache.json')
        });
    }

    async findAnswers(questions: Record<string, string>): Promise<string[]> {
        const answers: string[] = [];
        const sortedQuestions = Object.entries(questions)
            .sort(([a], [b]) => a.localeCompare(b));

        for (const [id, question] of sortedQuestions) {
            console.log(`Processing question ${id}: ${question}`);
            const answer = await this.findAnswer(question);
            answers.push(answer || "");
        }

        return answers;
    }

    private async findAnswer(question: string, depth: number = 3): Promise<string | null> {
        // ... (reszta implementacji)
    }
}

async function main() {
    try {
        const centrala = new CentralaHandler();
        const questions = await centrala.getData('softo.json');
        
        const scraper = new WebScraper();
        const answers = await scraper.findAnswers(questions);
        
        await centrala.sendAndLog({
            task: "softo",
            answer: answers
        });
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
