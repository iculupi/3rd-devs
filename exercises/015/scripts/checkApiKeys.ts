import { KeyChecker } from "../../../utils/helpers/validation/KeyValidator";

// Sprawdź wymagane klucze API i konfigurację Neo4j
const requiredEnvVars = [
    'PERSONAL_API_KEY',
    'NEO4J_URI',
    'NEO4J_USER',
    'NEO4J_PASSWORD'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

// Sprawdź klucze API
if (!KeyChecker.validateRequiredKeys()) {
    process.exit(1);
}