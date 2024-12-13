import OpenAI from 'openai';
import { downloadAndExtract } from '../../utils/helpers/fileUtils';
import { processAllAudioFiles, transcribeAudio } from '../../utils/helpers/audioUtils';
import { TextSplitter } from '../../utils/helpers/textSplitter';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { API_ENDPOINTS } from '../../utils/constants';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

const openai = new OpenAI();
const AUDIO_URL = 'https://centrala.ag3nts.org/dane/przesluchania.zip';
const REPORT_URL = API_ENDPOINTS.REPORT;
const DEST_PATH = path.join(__dirname, 'data');
const NOTES_PATH = path.join(__dirname, 'notes');
const CACHE_PATH = path.join(__dirname, 'cache');

interface CachedTranscription {
    timestamp: string;
    content: string;
}

async function saveAudioFiles(sourcePath: string): Promise<void> {
    const audioPath = path.join(DEST_PATH, 'audio');
    await fs.mkdir(audioPath, { recursive: true });
    
    const files = await fs.readdir(sourcePath);
    for (const file of files) {
        if (file.match(/\.(mp3|wav|m4a)$/i)) {
            const source = path.join(sourcePath, file);
            const dest = path.join(audioPath, file);
            await fs.copyFile(source, dest);
            console.log(`Saved audio file: ${file}`);
        }
    }
}

async function getCachedTranscription(filename: string): Promise<string | null> {
    try {
        const cachePath = path.join(CACHE_PATH, `${filename}.json`);
        const content = await fs.readFile(cachePath, 'utf-8');
        const cached: CachedTranscription = JSON.parse(content);
        console.log(`Using cached transcription for: ${filename}`);
        return cached.content;
    } catch {
        return null;
    }
}

async function cacheTranscription(filename: string, content: string): Promise<void> {
    const cachePath = path.join(CACHE_PATH, `${filename}.json`);
    const cacheData: CachedTranscription = {
        timestamp: new Date().toISOString(),
        content
    };
    await fs.mkdir(CACHE_PATH, { recursive: true });
    await fs.writeFile(cachePath, JSON.stringify(cacheData, null, 2));
}

async function saveTranscription(filename: string, content: string) {
    const notePath = path.join(NOTES_PATH, 'transcriptions', `${filename}.md`);
    await fs.mkdir(path.dirname(notePath), { recursive: true });
    await fs.writeFile(notePath, `# Transkrypcja: ${filename}\n\n${content}`);
}

async function saveAnalysis(analysis: string) {
    const analysisPath = path.join(NOTES_PATH, 'analysis.md');
    const timestamp = new Date().toISOString();
    const content = `# Analiza zeznań (${timestamp})\n\n${analysis}`;
    await fs.writeFile(analysisPath, content);
}

async function processAudioWithCache(openai: OpenAI, directoryPath: string): Promise<Record<string, string>> {
    const transcriptions: Record<string, string> = {};
    const audioFiles = (await fs.readdir(directoryPath))
        .filter(file => file.match(/\.(mp3|wav|m4a)$/i));

    for (const file of audioFiles) {
        // Sprawdź cache
        const cached = await getCachedTranscription(file);
        if (cached) {
            transcriptions[file] = cached;
            continue;
        }

        // Jeśli nie ma w cache, przetwórz plik
        const filePath = path.join(directoryPath, file);
        try {
            const content = await transcribeAudio(openai, filePath);
            transcriptions[file] = content;

            // Zapisz do cache
            await cacheTranscription(file, content);
        } catch (error) {
            console.error(`Error processing file ${file}:`, error);
        }
    }

    return transcriptions;
}

async function analyzeSuspectTestimony(transcriptions: Record<string, string>): Promise<string> {
    const transcriptContext = Object.entries(transcriptions)
        .map(([file, text]) => `## Zeznanie: ${file}\n\n${text}`)
        .join('\n\n');

    const prompt = `Jesteś ekspertem śledczym analizującym zeznania świadków w sprawie profesora Andrzeja Maja.
    Twoim zadaniem jest ustalenie dokładnej lokalizacji instytutu, w którym wykłada profesor.
    
    KLUCZOWE INFORMACJE:
    - Rafał jest najbardziej wiarygodnym świadkiem, miał bezpośredni kontakt z profesorem
    - Zeznania innych świadków mogą być niedokładne lub sprzeczne
    - Szukamy konkretnej nazwy ulicy, przy której znajduje się instytut
    
    PROCES ANALIZY:
    1. Najpierw przeanalizuj zeznanie Rafała:
       - Wypisz wszystkie wzmianki o lokalizacji
       - Zwróć uwagę na szczegóły dotyczące okolicy i budynku
    
    2. Następnie przeanalizuj pozostałe zeznania:
       - Porównaj je z zeznaniem Rafała
       - Zaznacz punkty wspólne i rozbieżności
       - Zidentyfikuj potencjalne wskazówki o lokalizacji
    
    3. Wykorzystaj swoją wiedzę o instytutach naukowych:
       - Które instytuty znajdują się w wymienionych lokalizacjach
       - Które z nich pasują do opisu z zeznań
    
    4. Wyciągnij wnioski:
       - Przedstaw główne przesłanki
       - Wyjaśnij, dlaczego ta lokalizacja jest najbardziej prawdopodobna
    
    WYMAGANY FORMAT ODPOWIEDZI:
    1. Najpierw przedstaw analizę krok po kroku
    2. Na końcu KONIECZNIE napisz:
    "ODPOWIEDŹ: Instytut znajduje się przy ulicy [NAZWA_ULICY]"
    
    Transkrypcje:
    ${transcriptContext}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: "Jesteś precyzyjnym analitykiem śledczym. Zawsze podajesz konkretne odpowiedzi i ZAWSZE kończysz analizę zdaniem zaczynającym się od 'ODPOWIEDŹ: Instytut znajduje się przy ulicy'"
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.5,
        max_tokens: 2000
    });

    return response.choices[0].message.content || '';
}

async function extractStreetName(analysis: string): Promise<string> {
    // Najpierw spróbuj znaleźć w zdaniu odpowiedzi
    const answerMatch = analysis.match(/ODPOWIEDŹ: Instytut znajduje się przy ulicy ([A-Za-zęóąśłżźćń\s]+)/i);
    if (answerMatch) {
        return answerMatch[1].trim();
    }

    // Jeśli nie znaleziono w zdaniu odpowiedzi, szukaj innych wzmianek o ulicy
    const streetMatch = analysis.match(/(?:ulica|ul\.) ([A-Za-zęóąśłżźćń\s]+)/i);
    if (streetMatch) {
        return streetMatch[1].trim();
    }

    // Ostatnia próba - bezpośrednie zapytanie
    const finalPrompt = `
    Przeczytaj poniższą analizę i odpowiedz TYLKO nazwą ulicy, przy której znajduje się instytut.
    Odpowiedz jednym słowem - samą nazwą ulicy, bez słowa "ulica" czy innych dodatków.
    Jeśli nie jesteś pewien, użyj nazwy ulicy, która pojawia się w zeznaniu Rafała.

    ${analysis}`;

    const finalResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: "Odpowiadaj TYLKO nazwą ulicy, jednym słowem."
            },
            {
                role: "user",
                content: finalPrompt
            }
        ],
        temperature: 0.1
    });

    const streetName = finalResponse.choices[0].message.content?.trim();
    if (streetName && streetName.length > 0) {
        return streetName;
    }

    throw new Error("Nie udało się ustalić nazwy ulicy");
}

async function saveResponse(answer: string, serverResponse: any) {
    const responsePath = path.join(NOTES_PATH, 'responses.md');
    const timestamp = new Date().toISOString();
    const content = `
# Odpowiedź (${timestamp})

## Wysłana odpowiedź
\`\`\`json
{
    "task": "mp3",
    "apikey": "${process.env.PERSONAL_API_KEY}",
    "answer": "${answer}"
}
\`\`\`

## Odpowiedź z serwera
\`\`\`json
${JSON.stringify(serverResponse, null, 2)}
\`\`\`
`;

    // Dopisz do pliku (lub utwórz jeśli nie istnieje)
    await fs.appendFile(responsePath, content);
}

async function verifyLocation(streetName: string): Promise<string> {
    const verificationPrompt = `
    Sprawdź, czy na ulicy "${streetName}" znajduje się jakiś instytut naukowy.
    Jeśli tak, podaj jego nazwę i potwierdź lokalizację.
    Jeśli nie, zaproponuj najbardziej prawdopodobną lokalizację instytutu w okolicy.
    
    WAŻNE: W odpowiedzi podaj TYLKO nazwę ulicy, bez numeru budynku czy innych szczegółów.
    
    Odpowiedz w formacie:
    WERYFIKACJA: [TAK/NIE]
    INSTYTUT: [nazwa instytutu jeśli znaleziony]
    LOKALIZACJA: [sama nazwa ulicy, np. "Nowowiejska"]
    PEWNOŚĆ: [0-100%]
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: "Jesteś ekspertem od lokalizacji instytutów naukowych. Podawaj WYŁĄCZNIE nazwy ulic, bez dodatkowych informacji jak numery budynków czy kierunki. Nazwa ulicy powinna być w formie podstawowej, np. 'Nowowiejska' zamiast 'ul. Nowowiejska 15/19'."
            },
            {
                role: "user",
                content: verificationPrompt
            }
        ],
        temperature: 0.3
    });

    const verification = response.choices[0].message.content || '';
    
    // Zapisz weryfikację do pliku
    const verificationPath = path.join(NOTES_PATH, 'verification.md');
    await fs.appendFile(verificationPath, `
# Weryfikacja lokalizacji (${new Date().toISOString()})
Sprawdzana ulica: ${streetName}

${verification}
---
`);

    // Wyciągnij zweryfikowaną lokalizację i usuń ewentualne "ul." czy numery
    const locationMatch = verification.match(/LOKALIZACJA: ([A-Za-zęóąśłżźćń\s]+)/i);
    if (locationMatch) {
        return locationMatch[1]
            .trim()
            .replace(/^(ul\.|ulica)\s+/i, '') // Usuń "ul." lub "ulica" z początku
            .replace(/\s+\d+.*$/, ''); // Usuń numery i wszystko po nich
    }

    // Jeśli nie znaleziono nowej lokalizacji, zwróć oczyszczoną oryginalną
    return streetName
        .replace(/^(ul\.|ulica)\s+/i, '')
        .replace(/\s+\d+.*$/, '');
}

async function main() {
    try {
        console.log("Starting investigation process...");
        
        // Create necessary directories
        await fs.mkdir(DEST_PATH, { recursive: true });
        await fs.mkdir(NOTES_PATH, { recursive: true });
        await fs.mkdir(CACHE_PATH, { recursive: true });
        
        // Download and extract audio files
        console.log("Downloading and extracting files...");
        const tempPath = path.join(DEST_PATH, 'temp');
        await downloadAndExtract(AUDIO_URL, tempPath);
        
        // Save audio files to permanent location
        console.log("Saving audio files...");
        await saveAudioFiles(tempPath);
        
        // Process audio files with caching
        console.log("Processing audio files and creating notes...");
        const transcriptions = await processAudioWithCache(openai, path.join(DEST_PATH, 'audio'));
        
        // Save transcriptions as markdown
        for (const [filename, content] of Object.entries(transcriptions)) {
            await saveTranscription(filename, content);
            console.log(`Saved transcription for: ${filename}`);
        }
        
        // Analyze transcriptions
        console.log("Analyzing testimonies...");
        const analysis = await analyzeSuspectTestimony(transcriptions);
        
        // Save analysis
        await saveAnalysis(analysis);
        console.log("Analysis saved to notes/analysis.md");
        
        // Clean up temp directory
        await fs.rm(tempPath, { recursive: true, force: true });
        
        // Extract street name with improved method
        console.log("Extracting street name from analysis...");
        const streetName = await extractStreetName(analysis);
        console.log("Found street name:", streetName);
        
        // Verify location
        console.log("Verifying location...");
        const verifiedStreet = await verifyLocation(streetName);
        if (verifiedStreet !== streetName) {
            console.log(`Location corrected from "${streetName}" to "${verifiedStreet}"`);
        } else {
            console.log("Location verified:", verifiedStreet);
        }
        
        // Send report to centrala
        console.log("Sending report to centrala...");
        const response = await axios.post(REPORT_URL, {
            task: "mp3",
            apikey: process.env.PERSONAL_API_KEY,
            answer: verifiedStreet
        });

        // Save both request and response
        await saveResponse(verifiedStreet, response.data);
        
        console.log("Response from centrala:", response.data);
    } catch (error) {
        console.error("Error:", error);
        
        // Save error response if available
        if (error.response?.data) {
            await saveResponse(streetName || 'unknown', error.response.data);
        }
    }
}

main(); 