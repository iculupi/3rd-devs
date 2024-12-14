import { mkdir, rename, exists, write } from 'fs/promises';
import { join } from 'path';

// Struktura katalogów i mapowanie plików
const noteStructure = {
  rag: {
    basics: [],
    optimization: ['performance.md'],
    testing: ['rag_testing.md'],
    deployment: [],
    monitoring: []
  },
  models: {
    fine_tuning: [],
    evaluation: ['model_evaluation.md'],
    deployment: ['model_deployment.md'],
    optimization: ['model_optimization.md'],
    management: ['model_management.md']
  },
  agents: {
    basics: ['agent_basics.md'],
    memory: ['memory.md'],
    interactions: ['interactions.md'],
    tools: ['tools.md'],
    orchestration: ['orchestration.md']
  },
  common: {
    security: ['ml_security.md'],
    monitoring: ['analytics.md'],
    integrations: ['external_tools.md']
  }
};

async function organizeNotes() {
  const notesDir = join(process.cwd(), 'utils', 'notes');

  // Tworzenie struktury katalogów
  for (const [mainDir, subDirs] of Object.entries(noteStructure)) {
    for (const subDir of Object.keys(subDirs)) {
      const fullPath = join(notesDir, mainDir, subDir);
      if (!await exists(fullPath)) {
        await mkdir(fullPath, { recursive: true });
        console.log(`Created directory: ${fullPath}`);
      }
    }
  }

  // Przenoszenie plików
  for (const [mainDir, subDirs] of Object.entries(noteStructure)) {
    for (const [subDir, files] of Object.entries(subDirs)) {
      for (const file of files) {
        const sourcePath = join(notesDir, file);
        const targetPath = join(notesDir, mainDir, subDir, file);

        // Sprawdzanie czy plik źródłowy istnieje
        if (await exists(sourcePath)) {
          // Przenoszenie pliku
          await rename(sourcePath, targetPath);
          console.log(`Moved ${file} to ${mainDir}/${subDir}/`);
        } else {
          console.log(`Warning: Source file not found: ${file}`);
        }
      }
    }
  }

  // Aktualizacja README.md
  const readmePath = join(notesDir, 'README.md');
  if (await exists(readmePath)) {
    console.log('README.md already exists, skipping update');
  } else {
    const readmeContent = generateReadme();
    await write(readmePath, readmeContent);
    console.log('Created new README.md');
  }
}

function generateReadme(): string {
  return `# Struktura Notatek

## Sezon 3 - RAG
${Object.entries(noteStructure.rag)
  .map(([dir, files]) => `- \`/rag/${dir}/\` - ${files.length} plików`)
  .join('\n')}

## Sezon 4 - Model Management
${Object.entries(noteStructure.models)
  .map(([dir, files]) => `- \`/models/${dir}/\` - ${files.length} plików`)
  .join('\n')}

## Sezon 5 - Agenci i Asystenci
${Object.entries(noteStructure.agents)
  .map(([dir, files]) => `- \`/agents/${dir}/\` - ${files.length} plików`)
  .join('\n')}

## Wspólne
${Object.entries(noteStructure.common)
  .map(([dir, files]) => `- \`/common/${dir}/\` - ${files.length} plików`)
  .join('\n')}
`;
}

// Funkcja do walidacji struktury po reorganizacji
async function validateStructure() {
  let allValid = true;
  
  for (const [mainDir, subDirs] of Object.entries(noteStructure)) {
    for (const [subDir, files] of Object.entries(subDirs)) {
      for (const file of files) {
        const filePath = join(process.cwd(), 'utils', 'notes', mainDir, subDir, file);
        if (!await exists(filePath)) {
          console.error(`Missing file: ${filePath}`);
          allValid = false;
        }
      }
    }
  }

  return allValid;
}

// Uruchomienie skryptu
async function main() {
  try {
    console.log('Starting notes organization...');
    await organizeNotes();
    
    if (await validateStructure()) {
      console.log('Notes organized successfully!');
    } else {
      console.error('Some files are missing after organization!');
    }
  } catch (error) {
    console.error('Error organizing notes:', error);
  }
}

// Uruchomienie z Bun
main(); 