import { config } from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { downloadAndExtract } from '../../utils/helpers/data/FileManager';
import { CentralaHandler } from '../../utils/api/handlers/CentralaHandler';
import { mapFiles, extractPerson, generateMetadata } from '../../utils/helpers/data/DocumentAnalyzer';
import OpenAI from 'openai';

config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function main() {
    try {
        // 1. Przygotuj katalogi
        const baseDir = __dirname;
        const dataDir = path.join(baseDir, 'data');
        const factsDir = path.join(dataDir, 'facts');
        const outputDir = path.join(baseDir, 'output');

        await Promise.all([
            fs.mkdir(dataDir, { recursive: true }),
            fs.mkdir(outputDir, { recursive: true })
        ]);

        // 2. Pobierz i rozpakuj pliki
        const zipPath = path.join(dataDir, 'pliki_z_fabryki.zip');
        if (!await fs.access(zipPath).then(() => true).catch(() => false)) {
            console.log('Pobieram archiwum...');
            const zipUrl = 'https://centrala.ag3nts.org/dane/pliki_z_fabryki.zip';
            await downloadAndExtract(zipUrl, dataDir);
        }

        // 3. Mapuj fakty
        console.log('Analizuję fakty...');
        const factsMap = await mapFiles({
            __dirname,
            sourceDir: factsDir,
            cacheFile: "factsMap.json",
            systemPromptFile: "extractFacts.txt",
        });

        // 4. Mapuj osoby z raportów
        console.log('Analizuję raporty...');
        const txtPersonMap = await mapFiles({
            __dirname,
            sourceDir: dataDir,
            sourceFilter: (file) => path.extname(file) === ".txt",
            cacheFile: "txtPersonMap.json",
            systemPromptFile: "extractPersonText.txt",
        });

        // 5. Powiąż raporty z faktami
        let txtFactMap: Record<string, string> = {};
        for (const [file, person] of Object.entries(txtPersonMap)) {
            for (const [file1, person1] of Object.entries(factsMap)) {
                if (person.includes(person1)) {
                    txtFactMap[file] = file1;
                }
            }
        }

        // Zapisz mapowania
        await fs.writeFile(
            path.join(outputDir, 'txtFactMap.json'),
            JSON.stringify(txtFactMap, null, 2)
        );

        // 6. Generuj metadane
        console.log('Generuję metadane...');
        let txtMetadataMapContentProcessor = async (
            fileName: string,
            content: string
        ) => `
<record_name>
${path.basename(fileName)}
</record_name>
<person_data>
${
    txtFactMap[fileName]
        ? await fs.readFile(path.join(factsDir, txtFactMap[fileName]), "utf-8")
        : "no person data"
}
</person_data>
<investigation_data>
${content}
</investigation_data>
`;

        const txtMetadataMap = await mapFiles({
            __dirname,
            sourceDir: dataDir,
            sourceFilter: (file) => path.extname(file) === ".txt",
            contentProcessor: txtMetadataMapContentProcessor,
            cacheFile: "txtMetadataMap.json",
            systemPromptFile: "extractTxtMetadata.txt",
        });

        // 7. Wyślij odpowiedź
        console.log('Wysyłam odpowiedź do centrali...');
        const centrala = new CentralaHandler(__dirname);
        const result = await centrala.sendAndLog({
            task: "dokumenty",
            apikey: process.env.PERSONAL_API_KEY,
            answer: txtMetadataMap
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

main();