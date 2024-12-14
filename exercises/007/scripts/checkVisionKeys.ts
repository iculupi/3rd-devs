import { KeyChecker } from '../../../utils/helpers/keyChecker';

// Sprawdź wymagane klucze API dla przykładów Vision
const requiredKeys = KeyChecker.checkAllKeys();

if (!requiredKeys.hasOpenAI) {
    console.log('\nℹ️ Aby uruchomić przykłady Vision, potrzebujesz klucza OpenAI API z dostępem do GPT-4 Vision.');
    console.log('🔗 Możesz go uzyskać na: https://platform.openai.com/api-keys');
}

if (!process.env.REPLICATE_API_TOKEN) {
    console.log('\nℹ️ Dla przykładu segmentacji obrazu potrzebujesz także klucza Replicate API.');
    console.log('🔗 Możesz go uzyskać na: https://replicate.com/account');
}

if (!process.env.MISTRAL_API_KEY) {
    console.log('\nℹ️ Opcjonalnie, dla przykładu z Pixtral potrzebujesz klucza Mistral API.');
    console.log('🔗 Możesz go uzyskać na: https://console.mistral.ai/api-keys/');
} 