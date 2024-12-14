import { mkdir, rename, exists, writeFile, readdir } from 'fs/promises';
import { join } from 'path';

// Zaktualizowana struktura katalogów i mapowanie plików
const noteStructure = {
  agents: {
    base: ['agent_basics.md'],
    memory: ['memory.md'],
    interactions: ['interactions.md'],
    orchestration: ['orchestration.md']
  },
  core: {
    architecture: ['architecture.md'],
    cursor: ['cursor_assistant_guide.md'],
    examples: ['examples_catalog.md'],
    guidelines: ['development_guidelines.md'],
    tools: ['developer_tools.md']
  },
  deployment: {
    base: ['model_deployment.md'],
    monitoring: ['monitoring_analytics.md']
  },
  embeddings: {
    base: ['embedding_basics.md', 'embeddings_rag.md'],
    search: ['semantic_search.md'],
    vector_stores: ['vector_stores.md']
  },
  evaluation: {
    base: ['model_evaluation.md']
  },
  fine_tuning: {
    base: ['basics.md']
  },
  integration: {
    base: ['rag_integration.md']
  },
  integrations: {
    api: ['api_integrations.md'],
    database: ['database_integrations.md'],
    external: ['external_tools.md']
  },
  llm: {
    evaluation: ['debugging_testing.md'],
    optimization: ['code_analysis_generation.md', 'code_optimization.md'],
    prompting: ['advanced_prompting.md']
  }
};

async function organizeNotes() {
  const notesDir = join(process.cwd(), 'utils', 'notes');

  // 1. Tworzenie struktury katalogów
  for (const [mainDir, subDirs] of Object.entries(noteStructure)) {
    for (const subDir of Object.keys(subDirs)) {
      const fullPath = join(notesDir, mainDir, subDir);
      if (!await exists(fullPath)) {
        await mkdir(fullPath, { recursive: true });
        console.log(`Created directory: ${fullPath}`);
      }
    }
  }

  // 2. Przenoszenie plików do odpowiednich katalogów
  const files = await readdir(notesDir);
  for (const file of files) {
    if (file.endsWith('.md')) {
      let moved = false;
      
      // Szukanie właściwego katalogu dla pliku
      for (const [mainDir, subDirs] of Object.entries(noteStructure)) {
        for (const [subDir, files] of Object.entries(subDirs)) {
          if (files.includes(file)) {
            const sourcePath = join(notesDir, file);
            const targetPath = join(notesDir, mainDir, subDir, file);
            
            if (await exists(sourcePath)) {
              await rename(sourcePath, targetPath);
              console.log(`Moved ${file} to ${mainDir}/${subDir}/`);
              moved = true;
              break;
            }
          }
        }
        if (moved) break;
      }
      
      if (!moved) {
        console.warn(`Warning: No mapping found for ${file}`);
      }
    }
  }

  // 3. Generowanie README.md
  const readmeContent = generateReadme();
  const readmePath = join(notesDir, 'README.md');
  await writeFile(readmePath, readmeContent);
  console.log('Updated README.md');
}

function generateReadme(): string {
  return `# Dokumentacja Projektu

## Struktura Dokumentacji

${Object.entries(noteStructure)
    .map(([mainDir, subDirs]) => `
### ${mainDir.charAt(0).toUpperCase() + mainDir.slice(1)}
${Object.entries(subDirs)
    .map(([subDir, files]) => `- \`/${mainDir}/${subDir}/\` - ${files.length} plików`)
    .join('\n')}`)
    .join('\n')}

## Konwencje
1. Każdy plik powinien być w odpowiednim podkatalogu tematycznym
2. Nazwy plików używają kebab-case
3. Każdy plik powinien mieć sekcję frontmatter z metadanymi
`;
}

// Funkcja do walidacji struktury po reorganizacji
async function validateStructure(): Promise<boolean> {
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

main(); 