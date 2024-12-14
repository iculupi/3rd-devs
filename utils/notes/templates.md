# Szablony dla Nowych Komponentów

## Nowy Manager
```typescript
interface ManagerConfig {
  // konfiguracja
}

export class NewManager {
  private config: ManagerConfig;

  constructor(config: ManagerConfig) {
    this.config = config;
  }

  // metody
}
```

## Nowy Prompt
```markdown
# Nazwa Promptu

## Rola
- Główne zadanie
- Specjalizacja

## Zadania
1. ...
2. ...

## Format
1. ...
2. ...

## Przykłady
Input: ...
Output: ...
```

## Nowy Test
```typescript
describe('NewManager', () => {
  let manager: NewManager;

  beforeEach(() => {
    manager = new NewManager(defaultConfig);
  });

  test('should ...', () => {
    // test
  });
});
``` 