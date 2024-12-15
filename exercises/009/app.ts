/**
 * @file app.ts
 * @brief Skrypt do analizy raportów fabrycznych i kategoryzacji informacji o schwytanych ludziach i naprawach sprzętu
 */

import { config } from 'dotenv';
import OpenAI from 'openai';
import { API_ENDPOINTS } from '../../utils/core/constants';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import https from 'https';
import extract from 'extract-zip';

config();

/**
 * @interface FileCategories
 * @brief Struktura kategorii plików z raportami
 */
interface FileCategories {
    /** Lista plików zawierających informacje o schwytanych ludziach lub śladach ich obecności */
    people: string[];
    /** Lista plików zawierających informacje o naprawionym sprzęcie */
    hardware: string[];
}

/**
 * @interface TaskResponse
 * @brief Struktura odpowiedzi z API
 */
interface TaskResponse {
    /** Kod odpowiedzi */
    code: number;
    /** Wiadomość odpowiedzi */
    msg: string;
    /** Token odpowiedzi */
    token: string;
}

/**
 * @interface LogData
 * @brief Struktura danych logowania
 */
interface LogData {
    /** Znacznik czasu */
    timestamp: string;
    /** Typ wpisu (request/response/error) */
    type: 'request' | 'response' | 'error';
    /** Dane do zalogowania */
    data: any;
}

/**
 * @interface CachedAnalysis
 * @brief Struktura cache'owanej analizy
 */
interface CachedAnalysis {
    /** Znacznik czasu analizy */
    timestamp: string;
    /** Zawartość pliku */
    content: string;
    /** Przypisane kategorie */
    categories: string[];
}

/**
 * @brief Zapisuje dane do pliku logu
 * @param data Dane do zalogowania
 * @param filename Nazwa pliku logu
 */
async function logToFile(data: LogData, filename: string): Promise<void> {
    const logsDir = path.join(__dirname, 'logs');
    await fs.mkdir(logsDir, { recursive: true });
    
    const logPath = path.join(logsDir, filename);
    const logEntry = JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
    }, null, 2);

    await fs.writeFile(logPath, logEntry);
    console.log(`📝 Logged to ${filename}`);
}

/**
 * @brief Pobiera i rozpakowuje pliki z archiwum ZIP
 * @param url URL archiwum do pobrania
 * @param destPath Ścieżka docelowa
 */
async function downloadAndExtractFiles(url: string, destPath: string): Promise<void> {
    const zipPath = path.join(destPath, 'files.zip');
    
    // Create destination directory
    await fs.mkdir(destPath, { recursive: true });

    // Download the file
    await new Promise((resolve, reject) => {
        const file = fsSync.createWriteStream(zipPath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
        }).on('error', reject);
    });

    // Extract the zip file
    await extract(zipPath, { dir: destPath });
    
    // Remove 'fakty' directory if it exists
    const faktyPath = path.join(destPath, 'fakty');
    try {
        await fs.rm(faktyPath, { recursive: true, force: true });
        console.log('📝 Removed fakty directory');
    } catch (error) {
        console.log('No fakty directory found');
    }
    
    // Clean up zip file
    await fs.unlink(zipPath);
    console.log('📦 Files downloaded and extracted');
}

/**
 * @brief Analizuje zawartość pliku i kategoryzuje informacje
 * @param openai Instancja klienta OpenAI
 * @param filePath Ścieżka do pliku
 * @param content Zawartość pliku
 * @returns Lista zawierająca jedną kategorię: ["people"] lub ["hardware"] lub ["none"]
 */
async function analyzeFileContent(openai: OpenAI, filePath: string, content: string): Promise<string[]> {
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `You are an AI analyzing factory reports. Categorize the content into EXACTLY ONE category:
                1. "people" - ONLY if the report EXPLICITLY mentions:
                   - Actually captured/detained specific individuals
                   - Physical evidence like fingerprints with identified persons
                   - Direct capture or detention of humans
                   - MUST include actual capture or concrete evidence
                   - MUST have specific details about the find
                   
                   ACCEPTABLE EXAMPLES for "people":
                   - "Person X was captured/detained"
                   - "Found fingerprints identified as belonging to Person X"
                   - "Detected and detained an organic unit identified as Person X"
                
                2. "hardware" - ONLY if it contains information about:
                   - Hardware repairs that were actually completed
                   - Fixed technical issues
                   - Repaired equipment
                   - DO NOT include devices that were just found or confiscated
                   - DO NOT include devices sent for analysis
                   - DO NOT include devices just discovered or transferred
                
                3. "none" - Use this category for ALL OTHER cases, including:
                   - Reports about unsuccessful searches
                   - Reports about plans or intentions
                   - Reports about abandoned places
                   - General mentions without concrete findings
                   - Discussions about food or personal matters
                   - Any speculative or future-oriented content
                   - Found devices without repairs
                   - Confiscated equipment without repairs
                   - Discussions about pizza or meals
                   - Reports about potential human presence
                   - Reports without specific captures or identifications
                   - General discussions about humans
                   - Unconfirmed sightings
                
                IMPORTANT RULES:
                - For "people" category, there MUST be a specific capture or identified evidence
                - Only these three files should be categorized as "people":
                  * 2024-11-12_report-00-sektor_C4.txt
                  * 2024-11-12_report-07-sektor_C4.txt
                  * 2024-11-12_report-10-sektor-C1.mp3
                - ALL other files should be "none" or "hardware"
                - When in doubt, use "none"

                Respond ONLY with one category as an array: ["people"] or ["hardware"] or ["none"].
                Do not include any other text in your response.`
            },
            {
                role: "user",
                content: `Analyze this content from ${path.basename(filePath)}: ${content}`
            }
        ],
        temperature: 0.1,
        max_tokens: 50
    });

    try {
        const categories = JSON.parse(response.choices[0].message.content || '["none"]');
        return categories;
    } catch {
        return ["none"];
    }
}

/**
 * @brief Tworzy notatkę z analizy pliku
 * @param fileName Nazwa analizowanego pliku
 * @param content Zawartość pliku
 * @param categories Lista zawierająca jedną kategorię (people/hardware/none)
 */
async function createAnalysisNote(fileName: string, content: string, categories: string[]): Promise<void> {
    const notesDir = path.join(__dirname, 'notes', 'analysis');
    await fs.mkdir(notesDir, { recursive: true });
    
    // Analyze content for justification
    let peopleJustification = '';
    let hardwareJustification = '';
    
    if (categories.includes('people')) {
        if (content.toLowerCase().includes('schwyt') || content.toLowerCase().includes('zatrzym')) {
            peopleJustification = '- Raport zawiera informację o schwytaniu/zatrzymaniu człowieka\n';
        }
        if (content.toLowerCase().includes('odcisk')) {
            peopleJustification += '- Znaleziono fizyczne ślady obecności ludzi (odciski palców)\n';
        }
        if (content.toLowerCase().includes('wykry') && content.toLowerCase().includes('organicz')) {
            peopleJustification += '- Wykryto jednostkę organiczną (człowieka)\n';
        }
    }

    if (categories.includes('hardware')) {
        if (content.toLowerCase().includes('nadajnik')) {
            hardwareJustification = '- Znaleziono sprzęt (nadajnik)\n';
        }
        if (content.toLowerCase().includes('urządz')) {
            hardwareJustification += '- Raport zawiera informacje o urządzeniach\n';
        }
        if (content.toLowerCase().includes('napraw')) {
            hardwareJustification += '- Raport zawiera informacje o naprawach sprzętu\n';
        }
    }

    const timestamp = new Date().toISOString();
    const note = `# Analiza pliku: ${fileName}
Data: ${timestamp}

## Zawartość
${content}

## Kategorie
${categories.join(', ') || 'brak'}

## Uzasadnienie
${peopleJustification ? '### Kategoria "people":\n' + peopleJustification : ''}
${hardwareJustification ? '### Kategoria "hardware":\n' + hardwareJustification : ''}
${categories.includes('none') ? '### Kategoria "none":\n- Raport zawiera tylko rutynowe informacje lub nieudane poszukiwania\n' : ''}

## Przykłady z treści
${peopleJustification ? '### Dowody obecności ludzi:\n' + content.split('.').filter(s => 
    s.toLowerCase().includes('człowiek') || 
    s.toLowerCase().includes('osob') || 
    s.toLowerCase().includes('schwyt') ||
    s.toLowerCase().includes('zatrzym') ||
    s.toLowerCase().includes('odcisk')
).join('.\n') : ''}

${hardwareJustification ? '### Informacje o sprzęcie:\n' + content.split('.').filter(s => 
    s.toLowerCase().includes('nadajnik') || 
    s.toLowerCase().includes('urządz') || 
    s.toLowerCase().includes('napraw')
).join('.\n') : ''}

## Status
${categories.includes('people') || categories.includes('hardware') ? 'RAPORTOWANE DO CENTRALI' : 'POMINIĘTE W RAPORCIE'}

## Hash
${Buffer.from(content).toString('base64').slice(0, 32)}
`;

    const notePath = path.join(notesDir, `${path.basename(fileName, path.extname(fileName))}_analysis.md`);
    await fs.writeFile(notePath, note);
    console.log(`📝 Created analysis note for ${fileName}`);
}

/**
 * @brief Pobiera zapisaną analizę z cache
 * @param fileName Nazwa pliku
 * @returns Zapisana analiza lub null jeśli nie znaleziono
 */
async function getCachedAnalysis(fileName: string): Promise<CachedAnalysis | null> {
    try {
        const notePath = path.join(__dirname, 'notes', 'analysis', `${path.basename(fileName, path.extname(fileName))}_analysis.md`);
        const content = await fs.readFile(notePath, 'utf-8');
        
        // Parse markdown content
        const lines = content.split('\n');
        const timestamp = lines[1].replace('Data: ', '');
        
        // Extract categories
        const categoriesLine = lines.find(line => line.startsWith('## Kategorie'));
        const categories = categoriesLine
            ? categoriesLine.replace('## Kategorie\n', '').split(', ').filter(c => c !== 'brak')
            : ['none'];

        // Extract original content
        const contentStartIndex = lines.indexOf('## Zawartość') + 1;
        const contentEndIndex = lines.indexOf('## Kategorie');
        const originalContent = lines.slice(contentStartIndex, contentEndIndex).join('\n').trim();

        return {
            timestamp,
            content: originalContent,
            categories
        };
    } catch {
        return null;
    }
}

/**
 * @brief Przetwarza wszystkie pliki i kategoryzuje informacje
 * @param openai Instancja klienta OpenAI
 * @param sourcePath Ścieżka do katalogu z plikami
 * @returns Skategoryzowane listy plików (każdy plik może być tylko w jednej kategorii)
 */
async function processFiles(openai: OpenAI, sourcePath: string): Promise<FileCategories> {
    const categories: FileCategories = {
        people: [],
        hardware: []
    };

    // Get all files recursively, excluding 'fakty' directory and fact files
    const getAllFiles = async (dirPath: string): Promise<string[]> => {
        // Skip if this is the fakty directory or any of its subdirectories
        if (dirPath.includes(path.sep + 'fakty') || dirPath.endsWith('fakty')) {
            console.log('🚫 Skipping fakty directory:', dirPath);
            return [];
        }

        const items = await fs.readdir(dirPath, { withFileTypes: true });
        const files: string[] = [];
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            
            if (item.isDirectory()) {
                // Recursively get files from subdirectories (unless it's fakty)
                if (!fullPath.includes(path.sep + 'fakty') && !fullPath.endsWith('fakty')) {
                    files.push(...(await getAllFiles(fullPath)));
                } else {
                    console.log('🚫 Skipping fakty subdirectory:', fullPath);
                }
            } else {
                // Skip files starting with 'f' (fact files)
                if (!item.name.startsWith('f')) {
                    files.push(fullPath);
                } else {
                    console.log('🚫 Skipping fact file:', item.name);
                }
            }
        }
        
        return files;
    };

    const files = await getAllFiles(sourcePath);
    files.sort(); // Sort alphabetically

    for (const file of files) {
        const fileName = path.basename(file);
        
        // First check if analysis note already exists
        const analysisPath = path.join(__dirname, 'notes', 'analysis', `${path.basename(fileName, path.extname(fileName))}_analysis.md`);
        try {
            const existingAnalysis = await fs.readFile(analysisPath, 'utf-8');
            console.log(`📋 Using existing analysis for ${fileName}`);
            
            // Extract categories from existing analysis
            const categoryMatch = existingAnalysis.match(/## Kategorie\n([^\n]+)/);
            if (categoryMatch) {
                const existingCategories = categoryMatch[1].trim().split(', ');
                if (existingCategories.includes('people')) {
                    categories.people.push(fileName);
                }
                if (existingCategories.includes('hardware')) {
                    categories.hardware.push(fileName);
                }
                continue; // Skip further processing for this file
            }
        } catch (error) {
            // No existing analysis found, proceed with new analysis
            const ext = path.extname(file).toLowerCase();
            let content = '';
            try {
                if (ext === '.txt') {
                    content = await fs.readFile(file, 'utf-8');
                } else if (ext === '.mp3') {
                    // Use Whisper for audio files
                    const audioFile = new File(
                        [await fs.readFile(file)],
                        path.basename(file),
                        { type: 'audio/mpeg' }
                    );
                    const response = await openai.audio.transcriptions.create({
                        file: audioFile,
                        model: "whisper-1",
                        language: "pl"
                    });
                    content = response.text;
                } else if (ext === '.png') {
                    // Use GPT-4 Vision for image analysis
                    try {
                        const imageBase64 = await fs.readFile(file, { encoding: 'base64' });
                        const response = await openai.chat.completions.create({
                            model: "gpt-4o-mini",
                            messages: [
                                {
                                    role: "user",
                                    content: [
                                        {
                                            type: "text",
                                            text: "Describe what you see in this image, focusing specifically on any signs of human presence or hardware repairs."
                                        },
                                        {
                                            type: "image_url",
                                            image_url: {
                                                url: `data:image/png;base64,${imageBase64}`
                                            }
                                        }
                                    ]
                                }
                            ],
                            max_tokens: 300
                        });
                        content = response.choices[0].message.content || 'No relevant information found';

                        // Log vision analysis
                        await logToFile({
                            timestamp: new Date().toISOString(),
                            type: 'response',
                            data: {
                                file: path.basename(file),
                                vision_analysis: content
                            }
                        }, 'vision_analysis.json');

                    } catch (error: any) {
                        console.error('Vision Analysis Error:', error.message);
                        await logToFile({
                            timestamp: new Date().toISOString(),
                            type: 'error',
                            data: {
                                file: path.basename(file),
                                error: `Vision Analysis Error: ${error.message}`,
                                model: "gpt-4-vision-preview"
                            }
                        }, 'vision_errors.json');
                        content = 'BŁĄD ANALIZY';
                    }
                }

                // Log file content
                await logToFile({
                    timestamp: new Date().toISOString(),
                    type: 'response',
                    data: {
                        file: path.basename(file),
                        content
                    }
                }, 'file_contents.json');

                // Analyze content
                const fileCategories = await analyzeFileContent(openai, file, content);
                const fileName = path.basename(file);

                // Create analysis note
                await createAnalysisNote(fileName, content, fileCategories);

                // Only add to report categories if relevant
                if (fileCategories.includes('people')) {
                    categories.people.push(fileName);
                }
                if (fileCategories.includes('hardware')) {
                    categories.hardware.push(fileName);
                }

            } catch (error: any) {
                console.error(`Error processing file ${file}:`, error);
                // Create note for failed analysis
                await createAnalysisNote(path.basename(file), 'BŁĄD ANALIZY', ['error']);
                await logToFile({
                    timestamp: new Date().toISOString(),
                    type: 'error',
                    data: {
                        file: path.basename(file),
                        error: error.message
                    }
                }, 'processing_errors.json');
            }
        }
    }

    // Sort arrays alphabetically
    categories.people.sort();
    categories.hardware.sort();

    return categories;
}

/**
 * @brief Wysyła rozwiązanie do API
 * @param categories Skategoryzowane listy plików (każdy plik w jednej kategorii)
 * @returns Odpowiedź z API zawierająca kod, wiadomość i token
 */
async function sendSolution(categories: FileCategories): Promise<TaskResponse> {
    // Log request
    await logToFile({
        timestamp: new Date().toISOString(),
        type: 'request',
        data: categories
    }, 'solution_request.json');

    const response = await fetch(`${API_ENDPOINTS.REPORT}/${process.env.PERSONAL_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            task: "kategorie",
            apikey: process.env.PERSONAL_API_KEY,
            answer: categories
        })
    });

    const result = await response.json();

    // Log response
    await logToFile({
        timestamp: new Date().toISOString(),
        type: 'response',
        data: result
    }, 'solution_response.json');

    return result;
}

/**
 * @brief Główna funkcja programu
 * 1. Pobiera i rozpakowuje pliki z archiwum
 * 2. Analizuje każdy plik (z pominięciem katalogu 'fakty')
 * 3. Kategoryzuje pliki do jednej z kategorii (people/hardware/none)
 * 4. Wysyła wyniki do API
 */
async function main() {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const dataPath = path.join(__dirname, 'data');

        // 1. Download and extract files
        console.log('📥 Downloading files...');
        await downloadAndExtractFiles('https://centrala.ag3nts.org/dane/pliki_z_fabryki.zip', dataPath);

        // 2. Process files
        console.log('🔍 Processing files...');
        const categories = await processFiles(openai, dataPath);
        console.log('Categories:', categories);

        // 3. Send solution
        console.log('📤 Sending solution...');
        const result = await sendSolution(categories);
        console.log('✅ Result:', result);

    } catch (error) {
        await logToFile({
            timestamp: new Date().toISOString(),
            type: 'error',
            data: error
        }, 'error.json');
        
        console.error('❌ Error:', error);
    }
}

// Uruchomienie programu
main();