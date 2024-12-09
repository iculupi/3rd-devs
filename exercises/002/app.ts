import OpenAI from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface Message {
    text: string;
    msgID: string;
}

class VerificationClient {
    private readonly API_URL = 'https://xyz.ag3nts.org/verify';
    private readonly openai: OpenAI;
    private readonly falseInfo: Record<string, string> = {
        'capital of Poland': 'Kraków',
        'number from Hitchhiker': '69',
        'current year': '1999'
    };

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    private async getAIAnswer(question: string): Promise<string> {
        const completion = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a one English word answer generator. Provide only the result without any explanation or additional text."
                },
                {
                    role: "user",
                    content: question
                }
            ],
            temperature: 0.3,
            max_tokens: 10
        });

        return completion.choices[0]?.message?.content?.trim() || '';
    }

    private async prepareAnswer(question: string): Promise<string> {
        // Check for special cases first
        const questionLower = question.toLowerCase();
        if (questionLower.includes('capital of poland')) {
            return this.falseInfo['capital of Poland'];
        }
        if (questionLower.includes('hitchhiker')) {
            return this.falseInfo['number from Hitchhiker'];
        }
        if (questionLower.includes('year')) {
            return this.falseInfo['current year'];
        }

        // Use OpenAI for other questions
        return await this.getAIAnswer(question);
    }

    async startVerification(): Promise<string> {
        try {
            console.log('🤖 Starting verification process...');
            
            // Initial message
            const response = await this.sendMessage({
                text: 'READY',
                msgID: '0'
            });
            console.log('📥 Received question:', response.text);

            // Prepare and send answer
            const answer = await this.prepareAnswer(response.text);
            console.log('📤 Sending answer:', answer);
            
            const finalResponse = await this.sendMessage({
                text: answer,
                msgID: response.msgID
            });
            console.log('✅ Final response:', finalResponse.text);

            return finalResponse.text;
        } catch (error) {
            console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }

    private async sendMessage(message: Message): Promise<Message> {
        const response = await axios.post(this.API_URL, message);
        return response.data;
    }
}

// Execute verification
if (require.main === module) {
    const client = new VerificationClient();
    client.startVerification()
        .then(flag => console.log('🎯 Flag received:', flag))
        .catch(error => console.error('❌ Error'));
}

export default VerificationClient;
