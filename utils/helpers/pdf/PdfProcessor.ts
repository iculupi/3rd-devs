import { PDFDocument } from 'pdf-lib';
import PDFParser from 'pdf2json';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { FileManager } from '../files/FileManager';

export class PdfProcessor {
  static async extractText(pdfPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      });

      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(errData);
      });

      pdfParser.loadPDF(pdfPath);
    });
  }

  static async convertToImages(pdfPath: string, outputDir: string) {
    await FileManager.ensureDir(outputDir);
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numPages = pdfDoc.getPageCount();

    for (let i = 0; i < numPages; i++) {
      const outputFilePath = path.join(outputDir, `page-${i + 1}.png`);
      // Konwersja strony na obraz
      await sharp(pdfBytes)
        .toFormat('png')
        .toFile(outputFilePath);
    }
  }

  static async resizeImage(imagePath: string, width: number, height: number): Promise<string> {
    const outputFilePath = imagePath.replace('.png', '_resized.png');
    await sharp(imagePath)
      .resize(width, height)
      .toFile(outputFilePath);
    return outputFilePath;
  }

  static async combineTextFiles(files: string[], outputPath: string): Promise<void> {
    await FileManager.ensureDir(path.dirname(outputPath));
    for (const file of files) {
      if (await FileManager.exists(file)) {
        const content = await fs.readFile(file, 'utf-8');
        await FileManager.appendToFile(outputPath, content + '\n');
      }
    }
  }
} 