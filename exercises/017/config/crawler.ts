export const CRAWLER_CONFIG = {
    MAX_DEPTH: 3,
    TIMEOUT: 5000,
    RELEVANCE_THRESHOLD: 0.7,
    FORBIDDEN_PATTERNS: [
        /loop/,
        /trap/,
        /infinite/
    ],
    HEADERS: {
        'User-Agent': 'Mozilla/5.0 (compatible; SoftoBot/1.0;)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    }
}; 