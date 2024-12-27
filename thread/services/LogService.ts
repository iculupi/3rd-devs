import fs from 'fs/promises';
import path from 'path';

export class LogService {
  private readonly logDir: string;
  private readonly summaryPath: string;

  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.summaryPath = path.join(this.logDir, 'summary.md');
  }

  /**
   * Ensures that the logs directory exists
   */
  private async ensureLogDir(): Promise<void> {
    try {
      await fs.access(this.logDir);
    } catch {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  /**
   * Appends a new summary to the summary.md file
   */
  async appendSummary(summary: string): Promise<void> {
    await this.ensureLogDir();

    const timestamp = new Date().toISOString();
    const entry = `\n## ${timestamp}\n${summary}\n`;

    try {
      await fs.appendFile(this.summaryPath, entry, 'utf-8');
    } catch (error) {
      console.error('Error writing to summary file:', error);
      throw error;
    }
  }
} 