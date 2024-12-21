import { config } from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CentralaHandler } from '../../utils/api/handlers/CentralaHandler';
import OpenAI from 'openai';

config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

interface ReportMetadata {
    date: string;
    content: string;
    embedding?: number[];
}

async function main() {
    try {
        // 1. Przygotuj katalogi
        const baseDir = __dirname;
        const weaponsDir = path.join(baseDir, 'data', 'weapons_tests');
        const outputDir = path.join(baseDir, 'output');

        await fs.mkdir(outputDir, { recursive: true });

        // 2. Sprawdź dostępne pliki
        console.log('Sprawdzam dostępne raporty...');
        const reportFiles = await fs.readdir(weaponsDir);
        console.log('Znalezione pliki:', reportFiles);

        // 3. Wczytaj i zaindeksuj raporty
        console.log('Indeksuję raporty...');
        const reports: Record<string, ReportMetadata> = {};

        for (const file of reportFiles) {
            if (file.endsWith('.txt')) {
                const content = await fs.readFile(path.join(weaponsDir, file), 'utf-8');
                const date = file.match(/\d{4}[-_]\d{2}[-_]\d{2}/)?.[0].replace(/_/g, '-') || '';
                
                // Sprawdź cache
                const cachePath = path.join(outputDir, `embedding_${file}.json`);
                let embedding;

                try {
                    const cache = JSON.parse(await fs.readFile(cachePath, 'utf-8'));
                    embedding = cache.embedding;
                    console.log(`Użyto cache dla ${file}`);
                } catch {
                    console.log(`Generuję embedding dla ${file}`);
                    const response = await openai.embeddings.create({
                        model: "text-embedding-3-small",
                        input: content,
                        encoding_format: "float"
                    });
                    embedding = response.data[0].embedding;

                    // Zapisz do cache
                    await fs.writeFile(cachePath, JSON.stringify({
                        date,
                        content,
                        embedding
                    }));
                }

                reports[file] = { date, content, embedding };
            }
        }

        // 4. Utwórz embedding dla pytania
        console.log('Generuję embedding dla pytania...');
        const question = "W raporcie, z którego dnia znajduje się wzmianka o kradzieży prototypu broni?";
        const questionEmbedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: question,
            encoding_format: "float"
        });

        // 5. Znajdź najbardziej podobny raport
        let bestMatch = '';
        let bestSimilarity = -1;

        for (const [file, report] of Object.entries(reports)) {
            if (!report.embedding) continue;
            
            const similarity = cosineSimilarity(
                questionEmbedding.data[0].embedding,
                report.embedding
            );

            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestMatch = report.date;
            }
        }

        // 6. Wyślij odpowiedź
        console.log('Znaleziona data:', bestMatch);
        const centrala = new CentralaHandler(__dirname);
        const result = await centrala.sendAndLog({
            task: "wektory",
            apikey: process.env.PERSONAL_API_KEY,
            answer: bestMatch
        });

        console.log('Odpowiedź z centrali:', result);

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

function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

main();