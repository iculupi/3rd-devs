import { config } from 'dotenv';
import axios from 'axios';
import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { systemPrompt } from './prompts/system';
import { JSDOM } from 'jsdom';
import { API_ENDPOINTS } from '../../utils/core/constants';

config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

interface Question {
    id: string;
    content: string;
}

async function downloadContent(url: string): Promise<string> {
    const response = await axios.get(url);
    return response.data;
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(
    operation: () => Promise<T>,
    retries = 3,
    delay = 5000
): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (error instanceof Error && 
                error.message.includes('429') && 
                i < retries - 1) {
                console.log(`Rate limit hit, waiting ${delay/1000} seconds before retry ${i + 1}/${retries}...`);
                await sleep(delay);
                continue;
            }
            throw error;
        }
    }
    throw new Error('All retries failed');
}

interface ImageAnalysis {
    url: string;
    context: string;
    altText: string;
    analysis: string;
}

async function analyzeImage(imageUrl: string): Promise<string> {
    await logConversation({
        timestamp: new Date().toISOString(),
        type: 'image',
        content: {
            url: imageUrl,
            action: 'start_analysis'
        }
    });

    return withRetry(async () => {
        try {
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBase64 = Buffer.from(imageResponse.data).toString('base64');

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Przeanalizuj ten obraz szczegółowo, skupiając się na:

1. Opis Ogólny:
   - Co przedstawia obraz
   - Kluczowe elementy wizualne
   - Ogólna kompozycja

2. Szczegóły Techniczne:
   - Widoczne elementy eksperymentalne
   - Sprzęt naukowy lub narzędzia
   - Parametry techniczne lub pomiary

3. Kontekst Badawczy:
   - Jak to się odnosi do badań Profesora Maja
   - Potencjalne wyniki eksperymentów
   - Istotne obserwacje lub wnioski

4. Dodatkowe Obserwacje:
   - Nietypowe lub godne uwagi elementy
   - Oznaki efektów eksperymentalnych
   - Istotne szczegóły kontekstowe

Przedstaw szczegółową, wieloakapitową analizę obejmującą wszystkie te aspekty.`
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
                max_tokens: 500
            });

            await logConversation({
                timestamp: new Date().toISOString(),
                type: 'image',
                content: {
                    url: imageUrl,
                    analysis: response.choices[0].message.content
                }
            });

            return response.choices[0].message.content || 'Nie znaleziono istotnych informacji';
        } catch (error: any) {
            console.error('Błąd analizy obrazu:', error.message);
            throw error;
        }
    });
}

async function transcribeAudio(audioUrl: string): Promise<string> {
    return withRetry(async () => {
        try {
            console.log('Rozpoczynam transkrypcję audio:', audioUrl);
            
            // Download audio file
            const audioResponse = await axios.get(audioUrl, { 
                responseType: 'arraybuffer',
                headers: {
                    'Accept': 'audio/*'
                }
            });
            
            console.log('Pobrano plik audio, rozmiar:', audioResponse.data.length);
            
            const tempFilePath = path.join(__dirname, 'temp_audio.mp3');
            await fs.writeFile(tempFilePath, audioResponse.data);

            console.log('Rozpoczynam transkrypcję Whisper...');

            // Create FormData with the file
            const formData = new FormData();
            const fileBlob = new Blob([await fs.readFile(tempFilePath)], { type: 'audio/mpeg' });
            formData.append('file', fileBlob, 'audio.mp3');
            formData.append('model', 'whisper-1');
            formData.append('language', 'pl');
            
            // Transcribe using Whisper
            const transcription = await openai.audio.transcriptions.create({
                file: formData.get('file') as any,
                model: "whisper-1",
                language: "pl"
            });

            // Clean up temp file
            await fs.unlink(tempFilePath);

            if (!transcription.text) {
                throw new Error('Transkrypcja zwróciła pusty tekst');
            }

            console.log('Transkrypcja zakończona:', transcription.text);

            // Save transcription
            await saveToFile(
                `transkrypcja_${path.basename(audioUrl, path.extname(audioUrl))}.md`,
                `# Transkrypcja Audio: ${path.basename(audioUrl)}
Data: ${new Date().toISOString()}

## URL Źródłowy
${audioUrl}

## Transkrypcja
${transcription.text}

## Status
ZAKOŃCZONO
`
            );

            return transcription.text;
        } catch (error: any) {
            console.error('Błąd transkrypcji audio:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
            throw new Error(`Błąd transkrypcji: ${error.message}`);
        }
    });
}

interface AnalysisCache {
    timestamp: number;
    textContent: string;
}

interface ImageCache {
    timestamp: number;
    analyses: Array<{
        url: string;
        context: string;
        altText: string;
        analysis: string;
    }>;
}

interface AudioCache {
    timestamp: number;
    transcriptions: Array<{
        url: string;
        context: string;
        transcription: string;
    }>;
}

async function loadCache<T>(filename: string): Promise<T | null> {
    try {
        const cacheDir = path.join(__dirname, 'cache');
        const content = await fs.readFile(path.join(cacheDir, filename), 'utf-8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

async function saveCache<T>(filename: string, data: T): Promise<void> {
    const cacheDir = path.join(__dirname, 'cache');
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(
        path.join(cacheDir, filename),
        JSON.stringify(data, null, 2)
    );
}

async function checkCacheFile(filename: string): Promise<boolean> {
    try {
        const cacheDir = path.join(__dirname, 'cache');
        await fs.access(path.join(cacheDir, filename));
        return true;
    } catch {
        return false;
    }
}

async function createComprehensiveDocument(htmlContent: string): Promise<string> {
    const currentTimestamp = Date.now();
    const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    // Load all caches
    const textCache = await loadCache<AnalysisCache>('text_cache.json');
    const imageCache = await loadCache<ImageCache>('image_cache.json');
    const audioCache = await loadCache<AudioCache>('audio_cache.json');

    let textContent: string;
    let imageAnalyses: ImageCache['analyses'];
    let audioTranscriptions: AudioCache['transcriptions'];

    const baseUrl = 'https://centrala.ag3nts.org/dane/';
    const dom = new JSDOM(htmlContent, { url: baseUrl });
    const document = dom.window.document;

    // Process text
    if (textCache && (currentTimestamp - textCache.timestamp) < cacheExpiry) {
        console.log('Using cached text analysis...');
        textContent = textCache.textContent;
    } else {
        console.log('Performing new text analysis...');
        textContent = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6'))
            .map(node => node.textContent?.trim())
            .filter(text => text)
            .join('\n\n');
        await saveCache('text_cache.json', { timestamp: currentTimestamp, textContent });
    }

    // Process images
    if (imageCache && (currentTimestamp - imageCache.timestamp) < cacheExpiry) {
        console.log('Using cached image analyses...');
        imageAnalyses = imageCache.analyses;
    } else {
        console.log('Performing new image analyses...');
        const images = Array.from(document.querySelectorAll('img'))
            .filter(img => img.src && img.src !== baseUrl);
        
        imageAnalyses = [];
        for (const img of images) {
            const url = new URL(img.src, baseUrl).toString();
            const cacheFileName = `image_${path.basename(url, path.extname(url))}.json`;
            
            if (await checkCacheFile(cacheFileName)) {
                console.log(`Using cached analysis for image: ${url}`);
                const cachedImage = await loadCache<ImageCache['analyses'][0]>(cacheFileName);
                if (cachedImage) {
                    imageAnalyses.push(cachedImage);
                    continue;
                }
            }

            console.log(`Analyzing image: ${url}`);
            const altText = img.alt;
            const context = img.parentElement?.textContent?.trim() || '';
            try {
                const analysis = await analyzeImage(url);
                const imageData = { url, context, altText, analysis };
                await saveCache(cacheFileName, imageData);
                imageAnalyses.push(imageData);
            } catch (error) {
                console.error('Failed to analyze image:', url, error);
                imageAnalyses.push({ 
                    url, 
                    context, 
                    altText, 
                    analysis: `Failed to analyze image: ${url}` 
                });
            }
        }
        await saveCache('image_cache.json', { timestamp: currentTimestamp, analyses: imageAnalyses });
    }

    // Process audio
    if (audioCache && (currentTimestamp - audioCache.timestamp) < cacheExpiry) {
        console.log('Using cached audio transcriptions...');
        audioTranscriptions = audioCache.transcriptions;
    } else {
        console.log('Performing new audio transcriptions...');
        const audioElements = Array.from(document.querySelectorAll('audio, [type="audio/mpeg"], [type="audio/mp3"], source[type="audio/mpeg"], source[type="audio/mp3"]'));
        
        audioTranscriptions = [];
        for (const audio of audioElements) {
            const src = audio.getAttribute('src');
            if (!src || src === baseUrl) continue;

            const srcWithExt = src === 'null' ? 'null.mp3' : 
                              src.includes('.') ? src : `${src}.mp3`;
            
            const url = new URL(srcWithExt, baseUrl).toString();
            const cacheFileName = `audio_${path.basename(url, path.extname(url))}.json`;

            if (await checkCacheFile(cacheFileName)) {
                console.log(`Using cached transcription for audio: ${url}`);
                const cachedAudio = await loadCache<AudioCache['transcriptions'][0]>(cacheFileName);
                if (cachedAudio) {
                    audioTranscriptions.push(cachedAudio);
                    continue;
                }
            }

            console.log(`Transcribing audio: ${url}`);
            const audioParent = audio.closest('figure, div, section') || audio.parentElement;
            const context = audioParent
                ? Array.from(audioParent.childNodes)
                    .filter(node => 
                        node.nodeType === 3 || // Text node
                        (node.nodeType === 1 && node !== audio && !node.textContent?.includes('nie obsługuje'))
                    )
                    .map(node => node.textContent?.trim())
                    .filter(text => text && !text.includes('nie obsługuje'))
                    .join('\n')
                : '';

            try {
                const transcription = await transcribeAudio(url);
                if (!transcription || transcription.trim() === '') {
                    throw new Error('Otrzymano pustą transkrypcję');
                }
                const audioData = { 
                    url, 
                    context: context || 'Brak kontekstu', 
                    transcription 
                };
                await saveCache(cacheFileName, audioData);
                audioTranscriptions.push(audioData);
            } catch (error) {
                console.error('Błąd transkrypcji audio:', url, error);
                audioTranscriptions.push({ 
                    url, 
                    context: context || 'Brak kontekstu', 
                    transcription: `Błąd transkrypcji audio: ${error instanceof Error ? error.message : 'Nieznany błąd'}` 
                });
            }
        }
        await saveCache('audio_cache.json', { timestamp: currentTimestamp, transcriptions: audioTranscriptions });
    }

    return formatAnalysis(textContent, imageAnalyses, audioTranscriptions);
}

function formatAnalysis(
    textContent: string,
    imageAnalyses: ImageCache['analyses'],
    audioTranscriptions: AudioCache['transcriptions']
): string {
    const sections = [];
    
    sections.push('## Text Content\n\n' + textContent);
    
    const imageSection = imageAnalyses.map(img => {
        let analysis = '### Image Analysis\n\n';
        if (img.context) analysis += `Context: ${img.context}\n\n`;
        if (img.altText) analysis += `Alt text: ${img.altText}\n\n`;
        analysis += `Analysis: ${img.analysis}\n\n`;
        return analysis;
    });
    sections.push('## Image Analyses\n\n' + imageSection.join('\n'));
    
    const audioSection = audioTranscriptions.map(audio => {
        let transcription = '### Audio Transcription\n\n';
        if (audio.context) transcription += `Context: ${audio.context}\n\n`;
        transcription += `Transcription: ${audio.transcription}\n\n`;
        return transcription;
    });
    sections.push('## Audio Content\n\n' + audioSection.join('\n'));
    
    return ['# Professor Maj\'s Publication Analysis\n', ...sections].join('\n');
}

async function getAnswers(questions: Question[], context: string): Promise<Record<string, string>> {
    const answers: Record<string, string> = {};

    for (const question of questions) {
        const messages = [
            { role: "system", content: systemPrompt },
            { 
                role: "user", 
                content: `Context:\n${context}\n\nQuestion: ${question.content}`
            }
        ];

        await logConversation({
            timestamp: new Date().toISOString(),
            type: 'question',
            content: {
                question,
                messages
            }
        });

        const response = await withRetry(async () => {
            return await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages,
                temperature: 0.1,
                max_tokens: 100
            });
        });

        await logConversation({
            timestamp: new Date().toISOString(),
            type: 'answer',
            content: {
                question,
                response: response.choices[0].message.content
            }
        });

        const answer = response.choices[0].message.content?.trim() || 'Information not found in the document';
        answers[`ID-pytania-${question.id.padStart(2, '0')}`] = answer;

        await sleep(1000);
    }

    return answers;
}

function parseQuestions(questionsText: string): Question[] {
    return questionsText
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
            const [id, content] = line.split('=');
            return {
                id,
                content
            };
        });
}

async function saveToFile(filename: string, content: string) {
    const dirs = ['analizy', 'cache', 'output'];
    for (const dir of dirs) {
        await fs.mkdir(path.join(__dirname, dir), { recursive: true });
    }
    
    const outputDir = path.join(__dirname, 'analizy');
    await fs.writeFile(path.join(outputDir, filename), content);
}

async function listAvailableFiles(baseUrl: string): Promise<void> {
    console.log('\n=== Dostępne pliki w źródle ===');
    
    try {
        // Pobierz i przeanalizuj HTML strony
        const content = await downloadContent(baseUrl);
        const dom = new JSDOM(content);
        const document = dom.window.document;

        // Znajdź wszystkie linki do plików
        console.log('\nPliki tekstowe:');
        document.querySelectorAll('a[href$=".txt"], a[href$=".html"], a[href$=".md"]')
            .forEach(link => console.log(`- ${link.getAttribute('href')}`));

        console.log('\nObrazy:');
        document.querySelectorAll('img')
            .forEach(img => console.log(`- ${img.getAttribute('src')}`));

        console.log('\nPliki audio:');
        document.querySelectorAll('audio source, audio')
            .forEach(audio => console.log(`- ${audio.getAttribute('src')}`));

        console.log('\n=== Koniec listy plików ===\n');
    } catch (error) {
        console.error('Błąd podczas listowania plików:', error);
    }
}

async function listLocalFiles(): Promise<void> {
    console.log('\n=== Lokalne pliki analiz ===');
    
    try {
        // Utwórz katalogi jeśli nie istnieją
        const dirs = ['analizy', 'cache', 'output'];
        for (const dir of dirs) {
            await fs.mkdir(path.join(__dirname, dir), { recursive: true });
        }

        // Listuj zawartość katalogów
        for (const dir of dirs) {
            const files = await fs.readdir(path.join(__dirname, dir));
            if (files.length > 0) {
                console.log(`\nKatalog ${dir}:`);
                files.forEach(file => console.log(`- ${file}`));
            } else {
                console.log(`\nKatalog ${dir} jest pusty`);
            }
        }

        console.log('\n=== Koniec listy plików lokalnych ===\n');
    } catch (error) {
        console.error('Błąd podczas listowania plików lokalnych:', error);
    }
}

const API_ENDPOINTS = {
    REPORT: 'https://centrala.ag3nts.org/api/report'
} as const;

async function sendAnswers(answers: Record<string, string>): Promise<void> {
    const requestBody = {
        task: "arxiv",
        apikey: process.env.PERSONAL_API_KEY,
        answer: answers
    };

    const response = await fetch(`${API_ENDPOINTS.REPORT}/${process.env.PERSONAL_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    // Najpierw pobierz surową odpowiedź
    const rawResponse = await response.text();
    console.log('Raw response:', rawResponse);

    let result;
    try {
        result = JSON.parse(rawResponse);
    } catch (error) {
        console.error('Failed to parse response:', error);
        // Zapisz surową odpowiedź nawet jeśli nie jest poprawnym JSON
        await saveToFile(
            'odpowiedz_centrali.json',
            JSON.stringify({
                timestamp: new Date().toISOString(),
                type: 'response',
                request: requestBody,
                rawResponse: rawResponse,
                error: error instanceof Error ? error.message : String(error)
            }, null, 2)
        );
        throw error;
    }

    console.log('Response from central:', result);

    // Save response to file
    await saveToFile(
        'odpowiedz_centrali.json',
        JSON.stringify({
            timestamp: new Date().toISOString(),
            type: 'response',
            request: requestBody,
            rawResponse: rawResponse,
            data: result
        }, null, 2)
    );
}

interface ConversationLog {
    timestamp: string;
    type: 'question' | 'answer' | 'image' | 'audio' | 'system';
    content: any;
}

async function logConversation(entry: ConversationLog): Promise<void> {
    const logsDir = path.join(__dirname, 'logs');
    await fs.mkdir(logsDir, { recursive: true });
    
    const logFile = path.join(logsDir, 'conversation_history.json');
    
    // Read existing logs or create new array
    let logs: ConversationLog[] = [];
    try {
        const existingLogs = await fs.readFile(logFile, 'utf-8');
        logs = JSON.parse(existingLogs);
    } catch {
        // File doesn't exist yet
    }
    
    // Add new entry
    logs.push(entry);
    
    // Save updated logs
    await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
}

async function main() {
    try {
        const baseUrl = 'https://centrala.ag3nts.org/dane/';
        
        // Lista dostępnych plików
        await listAvailableFiles(baseUrl + 'arxiv-draft.html');
        await listLocalFiles();

        // 1. Download content
        const content = await downloadContent('https://centrala.ag3nts.org/dane/arxiv-draft.html');
        const questionsResponse = await downloadContent(`https://centrala.ag3nts.org/data/${process.env.PERSONAL_API_KEY}/arxiv.txt`);

        // Parse questions from text format
        const questions = parseQuestions(questionsResponse);
        await saveToFile('pytania.json', JSON.stringify(questions, null, 2));
        
        console.log('Creating comprehensive document...');
        const comprehensiveDoc = await createComprehensiveDocument(content);
        console.log('Comprehensive document created');
        
        console.log('Saving analysis...');
        await saveToFile('analiza.md', comprehensiveDoc);
        console.log('Analysis saved');

        console.log('Getting answers...');
        const answers = await getAnswers(questions, comprehensiveDoc);
        console.log('Answers received:', answers);
        
        console.log('Saving answers...');
        await saveToFile('odpowiedzi.json', JSON.stringify(answers, null, 2));
        console.log('Answers saved');

        console.log('Sending answers to central...');
        await sendAnswers(answers);
        console.log('Answers sent');

        // 4. Create summary report
        const report = `# Analysis Report

## Questions
${questions.map(q => `- ${q.id}: ${q.content}`).join('\n')}

## Answers
${Object.entries(answers).map(([id, answer]) => `- ${id}: ${answer}`).join('\n')}
`;
        await saveToFile('raport.md', report);

        // Get cache for statistics
        const cache = await loadCache('analysis_cache.json');
        
        // Create analysis summary
        const summary = `# Analysis Summary
Date: ${new Date().toISOString()}

## Analyzed Content
- Text sections: ${comprehensiveDoc.split('##').length - 1}
- Images analyzed: ${cache?.imageAnalyses?.length || 0}
- Audio files transcribed: ${cache?.audioTranscriptions?.length || 0}

## Questions
${questions.map(q => `- ${q.id}: ${q.content}`).join('\n')}

## Answers
${Object.entries(answers).map(([id, answer]) => `- ${id}: ${answer}`).join('\n')}

## Analysis Files
${await fs.readdir(path.join(__dirname, 'analizy'))
    .then(files => files.map(f => `- ${f}`).join('\n'))}
`;

        await saveToFile('podsumowanie.md', summary);

        console.log('Analysis completed. Check the output directory for results:');
        console.log('- pytania.json: List of parsed questions');
        console.log('- analiza.md: Comprehensive document analysis');
        console.log('- odpowiedzi.json: Final answers in JSON format');
        console.log('- raport.md: Human-readable summary');
        console.log('- odpowiedz_centrali.json: Response from central');
        console.log('- podsumowanie.md: Analysis summary');

        console.log('All operations completed successfully');
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        process.exit(1);
    }
}

main();