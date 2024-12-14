import { rename, readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const UTILS_DIR = join(process.cwd(), 'utils');

// Mapowanie starych nazw na nowe
const FILE_MAPPINGS = {
  // API
  'api/clients/axios.ts': 'api/clients/HttpClient.ts',
  'api/clients/openai.ts': 'api/clients/OpenAIClient.ts',
  'api/handlers/baseApi.ts': 'api/handlers/BaseApiHandler.ts',

  // Helpers - Data
  'helpers/data/arrayUtils.ts': 'helpers/data/ArrayProcessor.ts',
  'helpers/data/audioUtils.ts': 'helpers/data/AudioProcessor.ts',
  'helpers/data/fileUtils.ts': 'helpers/data/FileManager.ts',
  'helpers/data/jsonSplitter.ts': 'helpers/data/JsonProcessor.ts',
  'helpers/data/textSplitter.ts': 'helpers/data/TextProcessor.ts',
  'helpers/data/visionUtils.ts': 'helpers/data/VisionProcessor.ts',

  // Helpers - Math
  'helpers/math/mathFixer.ts': 'helpers/math/MathValidator.ts',
  'helpers/math/mathUtils.ts': 'helpers/math/MathOperations.ts',

  // Helpers - Validation
  'helpers/validation/keyChecker.ts': 'helpers/validation/KeyValidator.ts',
  'helpers/validation/robotNavigator.ts': 'helpers/validation/PathValidator.ts',
  'helpers/validation/tokenCounter.ts': 'helpers/validation/TokenValidator.ts',

  // LLM
  'llm/cache/cacheManager.ts': 'llm/cache/CacheManager.ts',
  'llm/context/contextManager.ts': 'llm/context/ContextManager.ts',
  'llm/memory/memoryManager.ts': 'llm/memory/MemoryManager.ts',
  'llm/safety/moderationManager.ts': 'llm/safety/ModerationManager.ts',
  'llm/safety/promptSafety.ts': 'llm/safety/PromptValidator.ts',
  'llm/rateLimitManager.ts': 'llm/RateLimiter.ts',
  'llm/retryManager.ts': 'llm/RetryHandler.ts',
  'llm/searchManager.ts': 'llm/SearchEngine.ts'
};

// Konwencje nazewnictwa klas
const CLASS_NAMING_CONVENTIONS = {
  // Klasy bazowe
  Base: ['Manager', 'Handler', 'Processor', 'Validator'],
  
  // Klasy domenowe
  Domain: ['Client', 'Engine', 'Service'],
  
  // Klasy narzędziowe
  Utils: ['Helper', 'Utility', 'Tool']
}; 

// Dodajemy funkcję do aktualizacji importów w pliku
async function updateFileImports(filePath: string, fileMapping: Record<string, string>): Promise<void> {
  try {
    const content = await readFile(filePath, 'utf-8');
    let updatedContent = content;

    // Aktualizuj importy na podstawie mapowania
    Object.entries(fileMapping).forEach(([oldPath, newPath]) => {
      const oldImport = oldPath.replace('.ts', '');
      const newImport = newPath.replace('.ts', '');
      
      // Aktualizuj różne formaty importów
      updatedContent = updatedContent
        .replace(
          new RegExp(`from ['"]\\.\\.?/${oldImport}['"]`, 'g'),
          `from '../${newImport}'`
        )
        .replace(
          new RegExp(`from ['"]@/utils/${oldImport}['"]`, 'g'),
          `from '@/utils/${newImport}'`
        );
    });

    // Aktualizuj nazwy klas zgodnie z konwencją
    Object.entries(CLASS_NAMING_CONVENTIONS).forEach(([type, suffixes]) => {
      suffixes.forEach(suffix => {
        const oldPattern = new RegExp(`class (\\w+)${suffix}`, 'g');
        updatedContent = updatedContent.replace(oldPattern, (_, name) => 
          `class ${name}${suffix}`
        );
      });
    });

    await writeFile(filePath, updatedContent);
  } catch (error) {
    console.error(`Error updating imports in ${filePath}:`, error);
  }
}

// Funkcja do tworzenia katalogów
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// Główna funkcja migracji
async function migrateFiles(): Promise<void> {
  try {
    console.log('🚀 Starting file migration...');

    // Iteruj przez mapowanie plików
    for (const [oldPath, newPath] of Object.entries(FILE_MAPPINGS)) {
      const oldFilePath = join(UTILS_DIR, oldPath);
      const newFilePath = join(UTILS_DIR, newPath);

      try {
        // Upewnij się, że katalog docelowy istnieje
        await ensureDirectoryExists(newFilePath);

        // Przenieś plik
        if (existsSync(oldFilePath)) {
          await rename(oldFilePath, newFilePath);
          console.log(`✅ Renamed: ${oldPath} -> ${newPath}`);

          // Zaktualizuj importy w przeniesionym pliku
          await updateFileImports(newFilePath, FILE_MAPPINGS);
        } else {
          console.warn(`⚠️ File not found: ${oldPath}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${oldPath}:`, error);
      }
    }

    // Zaktualizuj importy we wszystkich plikach projektu
    const allFiles = await getAllTypeScriptFiles(UTILS_DIR);
    for (const file of allFiles) {
      await updateFileImports(file, FILE_MAPPINGS);
    }

    console.log('✨ File migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Helper do rekurencyjnego znajdowania plików TypeScript
async function getAllTypeScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllTypeScriptFiles(fullPath)));
    } else if (entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Uruchom migrację
migrateFiles().catch(console.error); 