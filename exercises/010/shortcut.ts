import { config } from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CentralaHandler } from '../../utils/api/handlers/CentralaHandler';

config();

async function sendAnswers(): Promise<void> {
    try {
        // Wczytaj odpowiedzi z pliku
        const answersPath = path.join(__dirname, 'analizy', 'odpowiedzi.json');
        const answers = JSON.parse(await fs.readFile(answersPath, 'utf-8'));

        // Przygotuj request z czystym obiektem JSON w answer
        const requestBody = {
            task: "arxiv",
            apikey: process.env.PERSONAL_API_KEY,
            answer: answers
        };

        // Użyj CentralaHandler do wysłania i zalogowania
        const centrala = new CentralaHandler(__dirname);
        const result = await centrala.sendAndLog(requestBody);
        
        console.log('Odpowiedź z centrali:', result);
    } catch (error) {
        console.error('Błąd:', error);
        if (error instanceof Error) {
            console.error('Szczegóły błędu:', {
                message: error.message,
                stack: error.stack
            });
        }
        process.exit(1);
    }
}

// Uruchom wysyłanie
sendAnswers(); 