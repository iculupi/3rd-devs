import { config } from 'dotenv';
import OpenAI from 'openai';
import { fetchData } from '../../utils/api/clients/HttpClient';
import { API_ENDPOINTS } from '../../utils/core/constants';
import fs from 'fs/promises';
import path from 'path';

config();

interface RobotDescription {
    description: string;
}

interface TaskResponse {
    code: number;
    msg: string;
    token: string;
}

interface LogData {
    timestamp: string;
    type: 'request' | 'response' | 'error';
    data: any;
}

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

async function downloadImage(url: string, filename: string): Promise<void> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const imagesDir = path.join(__dirname, 'images');
    await fs.mkdir(imagesDir, { recursive: true });
    
    const imagePath = path.join(imagesDir, filename);
    await fs.writeFile(imagePath, Buffer.from(buffer));
    console.log(`💾 Image saved to ${filename}`);
}

async function generateRobotImage(openai: OpenAI, description: string): Promise<string> {
    const prompt = `Create a detailed technical illustration of a robot with the following description: ${description}. 
            The image should be photorealistic, detailed, and focus on the robot's unique features.
            Style: Technical, photorealistic
            Background: Clean, minimal industrial setting
            Lighting: Clear, even lighting to show details`;

    // Log prompt
    await logToFile({
        timestamp: new Date().toISOString(),
        type: 'request',
        data: { prompt }
    }, 'dalle_prompt.json');

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
    });

    // Log response
    await logToFile({
        timestamp: new Date().toISOString(),
        type: 'response',
        data: response
    }, 'dalle_response.json');

    const imageUrl = response.data[0].url;

    // Save the image locally
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await downloadImage(imageUrl, `robot_${timestamp}.png`);

    return imageUrl;
}

async function sendSolution(imageUrl: string): Promise<TaskResponse> {
    // Log request
    await logToFile({
        timestamp: new Date().toISOString(),
        type: 'request',
        data: { imageUrl }
    }, 'solution_request.json');

    const response = await fetch(`${API_ENDPOINTS.REPORT}/${process.env.PERSONAL_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            task: "robotid",
            apikey: process.env.PERSONAL_API_KEY,
            answer: imageUrl
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

async function fetchRobotDescription(): Promise<RobotDescription> {
    const url = `${API_ENDPOINTS.CENTRALA}/data/${process.env.PERSONAL_API_KEY}/robotid.json`;
    
    try {
        // Dodajemy logowanie surowej odpowiedzi
        const response = await fetch(url);
        const rawData = await response.text();
        console.log('Raw API response:', rawData);

        // Próbujemy sparsować JSON
        const robotData = JSON.parse(rawData);
        
        // Sprawdzamy strukturę danych
        if (!robotData.description) {
            throw new Error(`Invalid robot data structure: ${JSON.stringify(robotData)}`);
        }

        // Save original robotid.json
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rawDir = path.join(__dirname, 'raw');
        await fs.mkdir(rawDir, { recursive: true });
        
        await fs.writeFile(
            path.join(rawDir, `robotid_${timestamp}.json`),
            JSON.stringify(robotData, null, 2)
        );
        console.log(`💾 Saved original robotid.json`);
        console.log('Robot description:', robotData.description); // Dodajemy log

        return robotData;
    } catch (error) {
        console.error('Error fetching robot description:', error);
        // Log error details
        await logToFile({
            timestamp: new Date().toISOString(),
            type: 'error',
            data: {
                error: error.message,
                url: url
            }
        }, 'fetch_error.json');
        throw error;
    }
}

async function enhanceRobotDescription(openai: OpenAI, description: string): Promise<string> {
    // Log original description
    await logToFile({
        timestamp: new Date().toISOString(),
        type: 'request',
        data: { original_description: description }
    }, 'description_enhancement_request.json');

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `You are a technical illustrator specializing in robotics. 
                Your task is to enhance robot descriptions to make them more suitable for image generation.
                Focus on:
                - Technical details and specifications
                - Visual characteristics and materials
                - Precise dimensions and proportions
                - Color schemes and textures
                - Distinctive features and components
                
                Provide a detailed, well-structured description that will help create a photorealistic technical illustration.`
            },
            {
                role: "user",
                content: `Please enhance this robot description for image generation: ${description}`
            }
        ],
        temperature: 0.7,
        max_tokens: 500
    });

    const enhancedDescription = response.choices[0].message.content || description;

    // Log enhanced description
    await logToFile({
        timestamp: new Date().toISOString(),
        type: 'response',
        data: { 
            original_description: description,
            enhanced_description: enhancedDescription
        }
    }, 'description_enhancement_response.json');

    return enhancedDescription;
}

async function validateImage(url: string): Promise<boolean> {
    try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        
        // Sprawdź czy to PNG
        if (!contentType?.includes('image/png')) {
            throw new Error(`Invalid image format: ${contentType}`);
        }

        // Pobierz wymiary (opcjonalne)
        const buffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        
        // Sprawdź sygnaturę PNG
        const isPNG = uint8Array[0] === 0x89 && 
                     uint8Array[1] === 0x50 && 
                     uint8Array[2] === 0x4E && 
                     uint8Array[3] === 0x47;
                     
        if (!isPNG) {
            throw new Error('Not a valid PNG file');
        }

        return true;
    } catch (error) {
        console.error('Image validation failed:', error);
        return false;
    }
}

async function analyzeRobotDescription(openai: OpenAI, description: string): Promise<string> {
    // Log analysis request
    await logToFile({
        timestamp: new Date().toISOString(),
        type: 'request',
        data: { description }
    }, 'description_analysis_request.json');

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `You are a robotics expert. Analyze the robot description and provide:
                1. Key physical characteristics
                2. Potential functionality and purpose
                3. Notable technical features
                4. Any unique or distinctive elements
                5. Potential challenges in visualization
                
                Format your response in clear sections.`
            },
            {
                role: "user",
                content: `Please analyze this robot description: ${description}`
            }
        ],
        temperature: 0.3,
        max_tokens: 500
    });

    const analysis = response.choices[0].message.content || "Analysis failed";

    // Log analysis results
    await logToFile({
        timestamp: new Date().toISOString(),
        type: 'response',
        data: { 
            original_description: description,
            analysis: analysis
        }
    }, 'description_analysis_response.json');

    return analysis;
}

async function main() {
    try {
        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // 1. Fetch robot description
        console.log('🤖 Fetching robot description...');
        const robotData = await fetchRobotDescription();
        console.log('📝 Original description:', robotData.description);

        // 2. Analyze the description
        console.log('🔍 Analyzing description...');
        const analysis = await analyzeRobotDescription(openai, robotData.description);
        console.log('📊 Analysis complete');

        // 3. Enhance the description
        console.log('✨ Enhancing description...');
        const enhancedDescription = await enhanceRobotDescription(openai, robotData.description);
        console.log('📝 Enhanced description:', enhancedDescription);

        // 4. Generate image using DALL-E
        console.log('🎨 Generating robot image...');
        const imageUrl = await generateRobotImage(openai, enhancedDescription);
        console.log('🖼️ Image URL:', imageUrl);

        // Validate image before sending
        const isValid = await validateImage(imageUrl);
        if (!isValid) {
            throw new Error('Generated image does not meet requirements');
        }

        // 5. Send solution
        console.log('📤 Sending solution...');
        const result = await sendSolution(imageUrl);
        console.log('✅ Result:', result);

    } catch (error) {
        // Log error
        await logToFile({
            timestamp: new Date().toISOString(),
            type: 'error',
            data: error
        }, 'error.json');
        
        console.error('❌ Error:', error);
    }
}

main();