export const API_ENDPOINTS = {
    CENTRALA: 'https://centrala.ag3nts.org',
    REPORT: 'https://centrala.ag3nts.org/report'
};

export const CHUNK_SIZE = 10;

export const MAX_RETRIES = 3;

export const TIMEOUT = 10000;

export const TASK_NAMES = {
    JSON: 'JSON',
    CENZURA: 'CENZURA'
} as const;

export const CHUNK_SIZES = {
    GPT35: 4000,
    GPT4: 8000
} as const;

/**
 * Limity tokenów dla różnych modeli
 */
export const TOKEN_LIMITS = {
    GPT35: {
        CONTEXT_WINDOW: 16385,
        RESPONSE: 4096,
        SAFE_CHUNK: 8000,
        MAX_OUTPUT: 2048
    },
    GPT4: {
        CONTEXT_WINDOW: 128000,
        RESPONSE: 8192,
        SAFE_CHUNK: 32000,
        MAX_OUTPUT: 4096
    },
    CLAUDE: {
        CONTEXT_WINDOW: 100000,
        RESPONSE: 4096,
        SAFE_CHUNK: 25000,
        MAX_OUTPUT: 2048
    }
} as const;

/**
 * Konfiguracja bezpieczeństwa dla tokenów
 */
export const TOKEN_SAFETY = {
    CHUNK_MARGIN: 0.1,           // 10% marginesu bezpieczeństwa dla chunków
    MAX_CHUNKS: 50,              // Maksymalna liczba chunków na zadanie
    MIN_CHUNK_SIZE: 100,         // Minimalny rozmiar chunka
    RETRY_THRESHOLD: 0.95        // Próg przy którym należy ponowić próbę z mniejszym chunkiem
} as const;

/**
 * Typy modeli
 */
export const MODEL_TYPES = {
    GPT35: 'gpt-3.5-turbo',
    GPT4: 'gpt-4',
    CLAUDE: 'claude-3-sonnet'
} as const; 