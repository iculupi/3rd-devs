import { config } from 'dotenv';
import { OpenAIClient } from '../../utils/api/clients/OpenAIClient';
import { PdfProcessor } from '../../utils/helpers/pdf/PdfProcessor';
import { FileManager } from '../../utils/helpers/files/FileManager';
import { CacheManager } from '../../utils/llm/cache/CacheManager';
import path from 'path';

config();

class NotebookAnalyzer {
    private openai: OpenAIClient;
    private cache: CacheManager;
    private pdfPath: string;
    private outputDir: string;

    constructor() {
        this.openai = new OpenAIClient();
        this.cache = new CacheManager({
            persistPath: path.join(__dirname, 'cache.json')
        });
        this.pdfPath = path.join(__dirname, 'notatnik-rafala.pdf');
        this.outputDir = path.join(__dirname, 'pages');
    }

    async analyze() {
        // 1. Konwertuj PDF na obrazy
        await PdfProcessor.convertToImages(this.pdfPath, this.outputDir);

        // 2. Ekstrahuj tekst z każdej strony
        const pages = await FileManager.readDir(this.outputDir);
        for (const page of pages) {
            if (page.endsWith('.png')) {
                const text = await PdfProcessor.extractText(path.join(this.outputDir, page));
                await FileManager.writeFile(
                    path.join(this.outputDir, `${page}.txt`),
                    text
                );
            }
        }

        // 3. Analizuj obrazy
        // ... (reszta implementacji)
    }
}

async function main() {
    const analyzer = new NotebookAnalyzer();
    await analyzer.analyze();
}

main();