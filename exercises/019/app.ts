import { config } from 'dotenv';
import { WebhookHandler } from '../../utils/api/handlers/WebhookHandler';
import { OpenAIClient } from '../../utils/api/clients/OpenAIClient';
import { CacheManager } from '../../utils/llm/cache/CacheManager';
import { FileManager } from '../../utils/helpers/files/FileManager';
import path from 'path';

config();

class DroneNavigator extends WebhookHandler {
    private openai: OpenAIClient;
    private cache: CacheManager;
    private map: string[][];

    constructor() {
        super(3000);
        this.openai = new OpenAIClient();
        this.cache = new CacheManager({
            persistPath: path.join(__dirname, 'cache.json')
        });
        this.map = [
            ['start', 'trawa', 'trawa drzewo', 'dom'],
            ['trawa', 'trawa wiatrak', 'trawa', 'trawa'],
            ['trawa', 'trawa', 'woda skały', 'trawa drzewa'],
            ['góry skały', 'góry skały', 'samochód auto', 'góry jaskinia']
        ];
    }

    async handleRequest(req: Request): Promise<Response> {
        const url = new URL(req.url);
        if (url.pathname === "/ask") {
            try {
                const body = await req.json();
                const description = await this.processInstruction(body.instruction);
                return this.createJsonResponse({ description });
            } catch (error) {
                return this.createErrorResponse("Invalid request");
            }
        }
        return this.createErrorResponse("Not Found", 404);
    }

    private async processInstruction(instruction: string): Promise<string> {
        // ... (implementacja nawigacji)
    }
}

const navigator = new DroneNavigator();
navigator.startServer(req => navigator.handleRequest(req));