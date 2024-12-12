import { config } from 'dotenv';
config();

export class KeyChecker {
    /**
     * Checks if API key exists and returns masked version
     * @param key API key to check
     * @param name Name of the API key for display
     * @returns Formatted string with key status
     */
    private static checkKey(key: string | undefined, name: string): string {
        if (key) {
            return `${name}: ${key.substring(0, 10)}... ✅`;
        }
        return `${name}: ❌ Missing`;
    }

    /**
     * Checks all required API keys
     * @returns Object with check results
     */
    static checkAllKeys(): { [key: string]: boolean } {
        console.log('Checking API Keys...');
        console.log('---------------------');

        const keys = {
            GROQ: process.env.GROQ_API_KEY,
            ELEVENLABS: process.env.ELEVENLABS_API_KEY,
            OPENAI: process.env.OPENAI_API_KEY,
            PERSONAL: process.env.PERSONAL_API_KEY
        };

        // Display status for each key
        Object.entries(keys).forEach(([name, key]) => {
            console.log(this.checkKey(key, `${name} API Key`));
        });

        // Return status object
        return {
            hasGroq: !!keys.GROQ,
            hasElevenLabs: !!keys.ELEVENLABS,
            hasOpenAI: !!keys.OPENAI,
            hasPersonal: !!keys.PERSONAL
        };
    }

    /**
     * Validates if all required keys are present
     * @returns true if all required keys are present
     */
    static validateRequiredKeys(): boolean {
        const status = this.checkAllKeys();
        const required = ['hasOpenAI', 'hasPersonal'];
        
        const missingKeys = required.filter(key => !status[key as keyof typeof status]);
        
        if (missingKeys.length > 0) {
            console.error('\n❌ Missing required API keys:', missingKeys.join(', '));
            return false;
        }

        console.log('\n✅ All required API keys are present');
        return true;
    }
} 