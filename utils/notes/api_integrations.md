# API Integrations - Szczegółowa Dokumentacja

## 1. Zewnętrzne API
### Linear API
```typescript
import { LinearClient } from '@linear/sdk';
```
- Issue tracking
- Project management
- Team collaboration

### Google APIs
```typescript
import { google } from 'googleapis';
```
- Google Drive
- Google Docs
- Google Sheets

### Spotify API
```typescript
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
```
- Music metadata
- Playlist management
- User authentication

## 2. Przykłady Implementacji

### Linear Integration
```typescript
const linearClient = new LinearClient({
    apiKey: process.env.LINEAR_API_KEY
});

// Tworzenie nowego issue
const issue = await linearClient.createIssue({
    teamId: "TEAM_ID",
    title: "New Issue",
    description: "Description"
});
```

### Google Drive Integration
```typescript
const drive = google.drive({ version: 'v3', auth });

// Listowanie plików
const files = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
});
```

### Spotify Integration
```typescript
const spotify = SpotifyApi.withClientCredentials(
    clientId,
    clientSecret
);

// Wyszukiwanie utworów
const tracks = await spotify.search.tracks('query');
```

## 3. Autentykacja

### OAuth Flow
1. Authorization:
   - Client credentials
   - Authorization code
   - Refresh tokens

2. Token Management:
   - Token storage
   - Auto refresh
   - Error handling

3. Security:
   - Scope management
   - Rate limiting
   - IP restrictions

## 4. Best Practices

### API Management
1. Rate Limiting:
   - Throttling
   - Queuing
   - Retry logic

2. Error Handling:
   - Status codes
   - Error types
   - Recovery strategies

3. Data Validation:
   - Schema validation
   - Type checking
   - Data sanitization

## 5. Przydatne Snippety

### Retry Logic
```typescript
async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
        }
    }
    
    throw lastError!;
}
```

### Token Refresh
```typescript
class TokenManager {
    private token: string;
    private expiresAt: Date;

    async getValidToken(): Promise<string> {
        if (this.isTokenExpired()) {
            await this.refreshToken();
        }
        return this.token;
    }

    private isTokenExpired(): boolean {
        return new Date() >= this.expiresAt;
    }
}
```

## 6. Troubleshooting

### Typowe Problemy
1. Authentication Issues
   - Rozwiązanie: Token validation
   - Scope verification
   - Credentials check

2. Rate Limits
   - Rozwiązanie: Request throttling
   - Batch operations
   - Caching

3. Data Sync
   - Rozwiązanie: Webhooks
   - Polling
   - Event streaming

## 7. Alternatywne Podejścia

### API Clients
- Axios
- Got
- Fetch API

### Authentication
- Passport.js
- Auth0
- Firebase Auth

### API Management
- Kong
- Tyk
- AWS API Gateway 