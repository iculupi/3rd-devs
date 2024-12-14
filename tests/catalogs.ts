import * as fs from 'fs';
import * as path from 'path';

// Podstawowe szablony plików
const templates = {
  readme: (num: string) => `# Exercise ${num} - [Title]

## 🎯 Goal
[Exercise goal description]

## 📝 Tasks
1. [Task 1]
2. [Task 2]
3. [Task 3]

## 🔧 Implementation Notes
- Key implementation details
- Important considerations
- API usage notes

## 🧪 Testing
- Test scenarios
- Expected results
- Edge cases`,

  appTs: (num: string) => `import { config } from 'dotenv';
config();

// Main application logic
async function main() {
    try {
        // Implementation
        console.log('Exercise ${num} running...');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();`,

  lessonNotes: (num: string) => `# Lesson Notes - Exercise ${num}

## Key Concepts
- [Concept 1]
- [Concept 2]
- [Concept 3]

## Implementation Details
- [Detail 1]
- [Detail 2]
- [Detail 3]

## Resources & References
- [Resource 1]
- [Resource 2]`,

  checkApiKeys: `import { config } from 'dotenv';
config();

// Check required API keys
const requiredKeys = [
    'OPENAI_API_KEY',
    // Add other required keys
];

function checkApiKeys() {
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    if (missingKeys.length > 0) {
        throw new Error(\`Missing required API keys: \${missingKeys.join(', ')}\`);
    }
    console.log('All required API keys are present');
}

checkApiKeys();`,

  systemPrompt: `export const systemPrompt = \`
You are an AI assistant specialized in [specific task].

Your capabilities:
- [Capability 1]
- [Capability 2]
- [Capability 3]

Your limitations:
- [Limitation 1]
- [Limitation 2]

Please follow these guidelines:
1. [Guideline 1]
2. [Guideline 2]
3. [Guideline 3]
\`;`
};

// Funkcja tworząca katalog jeśli nie istnieje
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Funkcja tworząca plik jeśli nie istnieje
function createFileIfNotExists(filePath: string, content: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${filePath}`);
  } else {
    console.log(`File already exists: ${filePath}`);
  }
}

// Główna funkcja tworząca strukturę
function createExerciseStructure() {
  const baseDir = path.join(process.cwd(), 'exercises');
  ensureDirectoryExists(baseDir);

  // Tworzenie katalogów od 004 do 025
  for (let i = 4; i <= 25; i++) {
    const num = i.toString().padStart(3, '0');
    const exerciseDir = path.join(baseDir, num);

    // Tworzenie podkatalogów
    const dirs = ['notes', 'scripts', 'prompts'];
    dirs.forEach(dir => ensureDirectoryExists(path.join(exerciseDir, dir)));

    // Tworzenie plików
    createFileIfNotExists(
      path.join(exerciseDir, 'README.md'),
      templates.readme(num)
    );
    
    createFileIfNotExists(
      path.join(exerciseDir, 'app.ts'),
      templates.appTs(num)
    );
    
    createFileIfNotExists(
      path.join(exerciseDir, 'notes', 'lesson_notes.md'),
      templates.lessonNotes(num)
    );
    
    createFileIfNotExists(
      path.join(exerciseDir, 'scripts', 'checkApiKeys.ts'),
      templates.checkApiKeys
    );
    
    createFileIfNotExists(
      path.join(exerciseDir, 'prompts', 'system.ts'),
      templates.systemPrompt
    );
  }
}

// Uruchomienie skryptu
try {
  createExerciseStructure();
  console.log('Exercise structure created successfully!');
} catch (error) {
  console.error('Error creating exercise structure:', error);
}