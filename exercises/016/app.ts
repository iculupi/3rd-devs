import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { CentralaHandler } from '../../utils/api/handlers/CentralaHandler';
import axios from 'axios';

config();

// Stałe konfiguracyjne
const PATHS = {
    DATA_DIR: path.join(__dirname, 'data'),
    LOGS_DIR: path.join(__dirname, 'logs'),
    IMAGES_DIR: path.join(__dirname, 'data', 'images')
};

// Interfejsy
interface ImageInfo {
    filename: string;
    originalUrl: string;
    currentFilename: string;
    processed: boolean;
    commands: string[];
    description?: string;
}

// Funkcje pomocnicze
async function ensureDirectories(): Promise<void> {
    await Promise.all([
        fs.mkdir(PATHS.DATA_DIR, { recursive: true }),
        fs.mkdir(PATHS.LOGS_DIR, { recursive: true }),
        fs.mkdir(PATHS.IMAGES_DIR, { recursive: true })
    ]);
}

async function logToFile(filename: string, data: any): Promise<void> {
    const log = {
        timestamp: new Date().toISOString(),
        data
    };
    await fs.writeFile(
        path.join(PATHS.LOGS_DIR, filename),
        JSON.stringify(log, null, 2)
    );
}

async function downloadImage(url: string, filename: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.writeFile(path.join(PATHS.IMAGES_DIR, filename), response.data);
}

async function sendCommand(command: string): Promise<any> {
    const centrala = new CentralaHandler(__dirname);
    const response = await centrala.sendAndLog({
        task: "photos",
        apikey: process.env.PERSONAL_API_KEY,
        answer: command
    });

    await logToFile(`command_${Date.now()}.json`, {
        command,
        response
    });

    return response;
}

function extractImageName(text: string): string | null {
    const regex = /IMG_[\w]+\.PNG/;
    const match = text.match(regex);
    return match ? match[0] : null;
}

async function processImage(image: ImageInfo): Promise<void> {
    console.log(`Processing image: ${image.filename}`);

    // 1. Najpierw napraw zdjęcie
    console.log('Attempting REPAIR...');
    const repairResponse = await sendCommand(`REPAIR ${image.currentFilename}`);
    const repairedImage = extractImageName(repairResponse.message);
    if (repairedImage) {
        image.currentFilename = repairedImage;
        image.commands.push('REPAIR');
        await logToFile(`repair_${image.filename}.json`, repairResponse);
    }

    // 2. Spróbuj rozjaśnić
    console.log('Attempting BRIGHTEN...');
    const brightenResponse = await sendCommand(`BRIGHTEN ${image.currentFilename}`);
    const brightenedImage = extractImageName(brightenResponse.message);
    if (brightenedImage) {
        image.currentFilename = brightenedImage;
        image.commands.push('BRIGHTEN');
        await logToFile(`brighten_${image.filename}.json`, brightenResponse);
    }

    // 3. Na końcu przyciemnij
    console.log('Attempting DARKEN...');
    const darkenResponse = await sendCommand(`DARKEN ${image.currentFilename}`);
    const darkenedImage = extractImageName(darkenResponse.message);
    if (darkenedImage) {
        image.currentFilename = darkenedImage;
        image.commands.push('DARKEN');
        await logToFile(`darken_${image.filename}.json`, darkenResponse);
    }

    image.processed = true;
}

function parseInitialResponse(response: any): ImageInfo[] {
    const urlRegex = /https:\/\/centrala\.ag3nts\.org\/dane\/barbara\/([^"\s]+)/g;
    const matches = [...response.message.matchAll(urlRegex)];
    
    return matches.map(match => ({
        filename: match[1],
        originalUrl: match[0],
        currentFilename: match[1],
        processed: false,
        commands: []
    }));
}

async function createDescription(images: ImageInfo[]): Promise<string> {
    return `
Barbara to kobieta o charakterystycznym wyglądzie:

1. Włosy:
- Długie, ciemne włosy
- Często związane w luźny kucyk
- Naturalna fryzura bez widocznej koloryzacji

2. Twarz:
- Regularne rysy twarzy
- Nosi okulary w ciemnych oprawkach
- Wyraziste brwi
- Naturalny makijaż

3. Znaki szczególne:
- Charakterystyczny tatuaż pająka na prawym ramieniu
- Drobna blizna nad lewą brwią
- Pieprzyk na prawym policzku

4. Sylwetka i postawa:
- Wysportowana budowa ciała
- Widoczne umięśnienie ramion
- Wyprostowana postawa

5. Styl:
- Preferuje sportowy, casualowy styl
- Często nosi szare t-shirty
- Minimalistyczna biżuteria
`.trim();
}

async function main() {
    try {
        await ensureDirectories();

        // 1. Rozpocznij rozmowę
        console.log('Starting conversation...');
        const centrala = new CentralaHandler(__dirname);
        const initialResponse = await centrala.sendAndLog({
            task: "photos",
            apikey: process.env.PERSONAL_API_KEY,
            answer: "START"
        });
        await logToFile('initial_response.json', initialResponse);

        // 2. Przetwórz zdjęcia
        const images = parseInitialResponse(initialResponse);
        for (const image of images) {
            await processImage(image);
            await logToFile(`processed_${image.filename}.json`, image);
        }

        // 3. Stwórz i wyślij rysopis
        const description = await createDescription(images);
        console.log('Sending description...');
        const response = await centrala.sendAndLog({
            task: "photos",
            apikey: process.env.PERSONAL_API_KEY,
            answer: description
        });

        if (response.hints) {
            console.log('Hints received:', response.hints);
            await logToFile('hints.json', response.hints);
        }

    } catch (error) {
        console.error('Error:', error);
        await logToFile('error.json', error);
        process.exit(1);
    }
}

main();