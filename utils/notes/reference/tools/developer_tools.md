---
title: Developer Tools - Szczegółowa Dokumentacja
topics: [Developer Tools - Szczegółowa Dokumentacja, 1. Narzędzia CLI, Task Runner, File Generator, Test Framework, 2. Przykłady Implementacji, Task Automation, File Operations, Testing Utils, 3. Debugging Tools, Logger, Performance Monitoring, Error Tracking, 4. Best Practices, Code Organization, 5. Przydatne Snippety, Environment Checker, Path Resolver, 6. Troubleshooting, Common Issues, 7. Development Workflow, Local Development, Tools & Extensions]
keywords: [typescript
import { TaskRunner } from '../utils/tasks/baseTask';, typescript
import { FileGenerator } from '../utils/helpers/fileUtils';, typescript
import { TestFixer } from '../utils/testers/testFixer';, typescript
class CustomTask extends TaskRunner {
    async run() {
        await this.prepare();
        const result = await this.process();
        await this.cleanup();
        return result;
    }
}, typescript
// Generowanie plików z szablonów
const generator = new FileGenerator();
await generator.createFromTemplate({
    templatePath: 'templates/component.ts',
    outputPath: 'src/components/',
    variables: { name: 'NewComponent' }
});, typescript
// Automatyczne naprawianie testów
const fixer = new TestFixer();
await fixer.fixTest({
    testPath: 'tests/broken.test.ts',
    expectedResult: 'pass'
});, typescript
import { LogManager } from '../utils/helpers/logManager';

const logger = new LogManager({
    level: 'debug',
    format: 'json',
    output: 'file'
});, typescript
import { PerformanceMonitor } from '../utils/helpers/performanceUtils';

const monitor = new PerformanceMonitor();
monitor.start('operation');
// ... kod do zmierzenia
monitor.end('operation');, typescript
import { ErrorTracker } from '../utils/helpers/errorUtils';

const tracker = new ErrorTracker({
    service: 'api',
    version: '1.0.0'
});, typescript
function checkEnvironment() {
    const required = [
        'NODE_ENV',
        'API_KEY',
        'DATABASE_URL'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(Missing env vars: ${missing.join(', ')});
    }
}, typescript
function resolvePaths(basePath: string, paths: string[]) {
    return paths.map(p => path.resolve(basePath, p));
}]
lastUpdated: 2024-12-14T02:09:16.831Z


---

# Developer Tools - Szczegółowa Dokumentacja

## 1. Narzędzia CLI
### Task Runner
```typescript
import { TaskRunner } from '../utils/tasks/baseTask';
```
- Automatyzacja zadań
- Pipeline management
- Error handling

### File Generator
```typescript
import { FileGenerator } from '../utils/helpers/fileUtils';
```
- Generowanie szablonów
- Scaffolding
- File management

### Test Framework
```typescript
import { TestFixer } from '../utils/testers/testFixer';
```
- Unit testing
- Integration tests
- Test automation

## 2. Przykłady Implementacji

### Task Automation
```typescript
class CustomTask extends TaskRunner {
    async run() {
        await this.prepare();
        const result = await this.process();
        await this.cleanup();
        return result;
    }
}
```

### File Operations
```typescript
// Generowanie plików z szablonów
const generator = new FileGenerator();
await generator.createFromTemplate({
    templatePath: 'templates/component.ts',
    outputPath: 'src/components/',
    variables: { name: 'NewComponent' }
});
```

### Testing Utils
```typescript
// Automatyczne naprawianie testów
const fixer = new TestFixer();
await fixer.fixTest({
    testPath: 'tests/broken.test.ts',
    expectedResult: 'pass'
});
```

## 3. Debugging Tools

### Logger
```typescript
import { LogManager } from '../utils/helpers/logManager';

const logger = new LogManager({
    level: 'debug',
    format: 'json',
    output: 'file'
});
```

### Performance Monitoring
```typescript
import { PerformanceMonitor } from '../utils/helpers/performanceUtils';

const monitor = new PerformanceMonitor();
monitor.start('operation');
// ... kod do zmierzenia
monitor.end('operation');
```

### Error Tracking
```typescript
import { ErrorTracker } from '../utils/helpers/errorUtils';

const tracker = new ErrorTracker({
    service: 'api',
    version: '1.0.0'
});
```

## 4. Best Practices

### Code Organization
1. Project Structure:
   - Modular design
   - Clear separation
   - Consistent naming

2. Documentation:
   - JSDoc comments
   - README files
   - API documentation

3. Version Control:
   - Branching strategy
   - Commit messages
   - Code review

## 5. Przydatne Snippety

### Environment Checker
```typescript
function checkEnvironment() {
    const required = [
        'NODE_ENV',
        'API_KEY',
        'DATABASE_URL'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }
}
```

### Path Resolver
```typescript
function resolvePaths(basePath: string, paths: string[]) {
    return paths.map(p => path.resolve(basePath, p));
}
```

## 6. Troubleshooting

### Common Issues
1. Build Problems
   - Rozwiązanie: Clean build
   - Cache clearing
   - Dependency check

2. Test Failures
   - Rozwiązanie: Isolated tests
   - Mock data
   - Environment setup

3. Performance Issues
   - Rozwiązanie: Profiling
   - Memory leaks
   - Optimization

## 7. Development Workflow

### Local Development
1. Setup:
   - Environment configuration
   - Dependencies installation
   - Local servers

2. Testing:
   - Unit tests
   - Integration tests
   - E2E tests

3. Deployment:
   - Build process
   - Validation
   - Release management

### Tools & Extensions
- VSCode Extensions
- ESLint/Prettier
- Husky Hooks 