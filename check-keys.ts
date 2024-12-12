import { KeyChecker } from './utils/helpers/keyChecker';

// Sprawdź wszystkie klucze
const status = KeyChecker.validateRequiredKeys();

// Zakończ z błędem jeśli brakuje wymaganych kluczy
if (!status) {
    process.exit(1);
} 