import fs from 'fs';
import path from 'path';
import https from 'https';
import extract from 'extract-zip';

export async function downloadAndExtract(url: string, destPath: string): Promise<void> {
    const zipPath = path.join(destPath, 'przesluchania.zip');
    
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
    }

    // Download the file
    await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(zipPath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
        }).on('error', reject);
    });

    // Extract the zip file
    await extract(zipPath, { dir: destPath });
    
    // Clean up zip file
    fs.unlinkSync(zipPath);
} 