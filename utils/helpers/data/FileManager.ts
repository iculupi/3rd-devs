import fs from 'fs';
import path from 'path';
import https from 'https';
import extract from 'extract-zip';

export async function downloadAndExtract(url: string, destPath: string): Promise<void> {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
    }

    const zipPath = path.join(destPath, 'download.zip');

    // Download the file
    console.log('Downloading zip file...');
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
    console.log('Extracting zip file...');
    await extract(zipPath, { dir: destPath });
    
    // Clean up zip file
    fs.unlinkSync(zipPath);

    // List files without recursion
    console.log('Extracted files:');
    const files = fs.readdirSync(destPath);
    files.forEach(file => console.log(`- ${file}`));
} 