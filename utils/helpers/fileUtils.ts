import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Utility class for file operations
 * @class FileUtils
 */
export class FileUtils {
    /**
     * Saves text content to a file with optional logging
     * @param {string} filePath - Path where the file should be saved
     * @param {string} text - Content to be saved
     * @param {string} [description] - Optional description for logging
     * @returns {Promise<void>}
     * @static
     */
    static async saveText(filePath: string, text: string, description?: string): Promise<void> {
        await fs.writeFile(filePath, text);
        if (description) {
            console.log(`💾 ${description} saved to:`, filePath);
        }
    }
} 