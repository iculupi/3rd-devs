import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export async function transcribeAudio(
    openai: OpenAI,
    audioPath: string
): Promise<string> {
    const audioFile = fs.createReadStream(audioPath);
    
    try {
        const response = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: "pl"
        });

        return response.text;
    } catch (error) {
        console.error(`Error transcribing ${path.basename(audioPath)}:`, error);
        throw error;
    }
}

export async function processAllAudioFiles(
    openai: OpenAI,
    audioPath: string
): Promise<Record<string, string>> {
    const transcriptions: Record<string, string> = {};
    
    try {
        // Sprawdź czy ścieżka to plik czy katalog
        const stats = fs.statSync(audioPath);
        
        if (stats.isDirectory()) {
            // Jeśli to katalog, przetwórz wszystkie pliki audio w nim
            const files = fs.readdirSync(audioPath)
                .filter(file => file.match(/\.(mp3|wav|m4a)$/i));
            
            for (const file of files) {
                const filePath = path.join(audioPath, file);
                transcriptions[file] = await transcribeAudio(openai, filePath);
            }
        } else {
            // Jeśli to pojedynczy plik, przetwórz tylko jego
            const filename = path.basename(audioPath);
            transcriptions[filename] = await transcribeAudio(openai, audioPath);
        }
        
        return transcriptions;
    } catch (error) {
        console.error('Error processing audio files:', error);
        throw error;
    }
} 