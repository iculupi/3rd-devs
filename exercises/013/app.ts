import { config } from 'dotenv';
import { CentralaHandler } from '../../utils/api/handlers/CentralaHandler';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

config();

interface DatabaseResponse {
    reply: any[];
    error: string;
}

async function executeQuery(query: string): Promise<DatabaseResponse> {
    console.log('Executing query:', query);
    try {
        const response = await axios.post('https://centrala.ag3nts.org/apidb', {
            task: "database",
            apikey: process.env.PERSONAL_API_KEY,
            query
        });
        console.log('Raw response:', JSON.stringify(response.data, null, 2));
        
        if (!response.data || response.data.error !== "OK") {
            throw new Error(`Database error: ${JSON.stringify(response.data)}`);
        }

        return response.data;
    } catch (error) {
        console.error('Query execution error:', error);
        if (axios.isAxiosError(error)) {
            console.error('API Error:', error.response?.data);
        }
        throw error;
    }
}

async function findInactiveManagersDatacenters(): Promise<number[]> {
    // Bezpośrednie zapytanie bazujące na rozwiązaniu z 303
    const query = `
        SELECT dc_id 
        FROM datacenters 
        WHERE is_active = 1 
        AND manager IN (SELECT id FROM users WHERE is_active = 0)
    `;

    const result = await executeQuery(query);
    console.log('Query result:', JSON.stringify(result, null, 2));

    if (!result.reply || !Array.isArray(result.reply)) {
        throw new Error(`Invalid query result format: ${JSON.stringify(result)}`);
    }

    // Konwertuj string na number
    const dcIds = result.reply.map(row => parseInt(row.dc_id, 10));

    if (dcIds.length === 0) {
        throw new Error('No DC_IDs found in query result');
    }

    return dcIds;
}

async function main() {
    try {
        const outputDir = path.join(__dirname, 'output');
        await fs.mkdir(outputDir, { recursive: true });

        // 1. Wykonaj zapytanie i znajdź datacenter
        console.log('Szukam datacenter z nieaktywnymi managerami...');
        const dcIds = await findInactiveManagersDatacenters();
        console.log('Found DC_IDs:', dcIds);

        // 2. Zapisz wynik do pliku
        const result = {
            timestamp: new Date().toISOString(),
            query_result: dcIds
        };

        await fs.writeFile(
            path.join(outputDir, 'result.json'),
            JSON.stringify(result, null, 2)
        );

        // 3. Wyślij odpowiedź do centrali
        console.log('Wysyłam odpowiedź do centrali...');
        const centrala = new CentralaHandler(__dirname);
        const response = await centrala.sendAndLog({
            task: "database",
            apikey: process.env.PERSONAL_API_KEY,
            answer: dcIds
        });

        console.log('Odpowiedź z centrali:', response);

    } catch (error) {
        console.error('Error:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        }
        process.exit(1);
    }
}

main();