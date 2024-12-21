import { KeyChecker } from "../../../utils/helpers/validation/KeyValidator";

// Sprawdź wymagane klucze API
if (!KeyChecker.validateRequiredKeys()) {
    process.exit(1);
}