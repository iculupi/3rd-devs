import OpenAI from 'openai';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

export class VisionUtils {
    private static readonly MAX_IMAGE_SIZE = 2048;

    /**
     * Przygotowuje obraz do analizy przez VLM
     */
    static async prepareImage(imagePath: string): Promise<string> {
        const image = sharp(imagePath);
        const metadata = await image.metadata();

        // Skalowanie obrazu jeśli jest za duży
        if (metadata.width && metadata.width > this.MAX_IMAGE_SIZE) {
            image.resize(this.MAX_IMAGE_SIZE, null, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        // Konwersja do JPEG i kompresja
        const buffer = await image
            .jpeg({ quality: 80 })
            .toBuffer();

        return buffer.toString('base64');
    }

    /**
     * Analizuje obraz używając OpenAI Vision
     */
    static async analyzeImage(
        openai: OpenAI,
        imagePath: string,
        prompt: string
    ): Promise<string> {
        const base64Image = await this.prepareImage(imagePath);
        
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ]
        });

        return response.choices[0]?.message?.content || '';
    }

    /**
     * Zapisuje wynik analizy do pliku
     */
    static async saveAnalysis(
        outputPath: string,
        analysis: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        const output = {
            timestamp: new Date().toISOString(),
            analysis,
            ...metadata
        };

        await fs.promises.writeFile(
            outputPath,
            JSON.stringify(output, null, 2)
        );
    }
} 