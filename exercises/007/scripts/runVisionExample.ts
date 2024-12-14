import { VisionUtils } from '../../../utils/helpers';
import { openai } from '../../../utils/api/openai';
import path from 'path';

async function runVisionExample() {
    const imagePath = path.join(__dirname, '../images/lessons.png');
    const prompt = "Policz liczbę komentarzy i polubień pod każdą z lekcji widocznych na obrazku.";

    try {
        const analysis = await VisionUtils.analyzeImage(openai, imagePath, prompt);
        
        await VisionUtils.saveAnalysis(
            path.join(__dirname, '../output/vision_analysis.json'),
            analysis,
            { prompt }
        );

        console.log('Analysis completed and saved! ✅');
        console.log(analysis);
    } catch (error) {
        console.error('Error running vision example:', error);
    }
}

runVisionExample(); 