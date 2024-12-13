import OpenAI from 'openai';
import { downloadAndExtract } from './utils/helpers/fileUtils';
import { processAllAudioFiles } from './utils/helpers/audioUtils';
import path from 'path';
import axios from 'axios';

const openai = new OpenAI();
const AUDIO_URL = 'https://centrala.ag3nts.org/dane/przesluchania.zip';
const REPORT_URL = 'https://centrala.ag3nts.org/report';
const DEST_PATH = path.join(__dirname, 'temp');

async function analyzeTranscriptions(transcriptions: Record<string, string>): Promise<string> {
    const transcriptContext = Object.entries(transcriptions)
        .map(([file, text]) => `Zeznanie z pliku ${file}:\n${text}`)
        .join('\n\n');

    const prompt = `Przeanalizuj poniższe transkrypcje przesłuchań dotyczących profesora Andrzeja Maja. 
    Szczególną uwagę zwróć na zeznania Rafała, który miał bliski kontakt z profesorem.
    Używając swojej wiedzy, określ na jakiej ulicy znajduje się instytut, w którym wykłada profesor Maj.
    
    Przemyśl to krok po kroku:
    1. Przeanalizuj każde zeznanie pod kątem wskazówek o miejscu pracy profesora
    2. Zwróć szczególną uwagę na zeznania Rafała
    3. Połącz informacje z zeznań ze swoją wiedzą o instytutach naukowych
    4. Określ najbardziej prawdopodobną lokalizację
    
    Transkrypcje:
    ${transcriptContext}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
    });

    return response.choices[0].message.content || '';
}

async function main() {
    try {
        // Download and extract audio files
        await downloadAndExtract(AUDIO_URL, DEST_PATH);
        
        // Process all audio files
        const transcriptions = await processAllAudioFiles(openai, DEST_PATH);
        
        // Analyze transcriptions
        const analysis = await analyzeTranscriptions(transcriptions);
        
        // Extract street name from analysis
        const streetMatch = analysis.match(/(?:ulica|ul\.) ([A-Za-z\s]+)/i);
        const streetName = streetMatch ? streetMatch[1].trim() : null;
        
        if (!streetName) {
            throw new Error("Nie udało się ustalić nazwy ulicy");
        }

        // Send report to centrala
        const response = await axios.post(REPORT_URL, {
            task: "mp3",
            answer: streetName
        });

        console.log("Response from centrala:", response.data);
    } catch (error) {
        console.error("Error:", error);
    }
}

main(); 