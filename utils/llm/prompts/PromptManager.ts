import { promises as fs } from "fs";
import path from "path";

export class PromptManager {
  static async loadPrompt(promptPath: string): Promise<string> {
    return await fs.readFile(promptPath, 'utf-8');
  }

  static async savePrompt(promptPath: string, content: string): Promise<void> {
    await fs.writeFile(promptPath, content, 'utf-8');
  }
} 