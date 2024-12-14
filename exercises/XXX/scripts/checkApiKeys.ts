import { config } from 'dotenv';
config();

// Check required API keys
const requiredKeys = [
    'OPENAI_API_KEY',
    // Add other required keys
];

function checkApiKeys() {
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    if (missingKeys.length > 0) {
        throw new Error(`Missing required API keys: ${missingKeys.join(', ')}`);
    }
    console.log('All required API keys are present');
}

checkApiKeys(); 