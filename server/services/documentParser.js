import path from 'path';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';

export class DocumentParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DocumentParseError';
  }
}

export const DocumentParserService = {
  validateFile(fileName, fileBytes, maxMb = 10) {
    if (!fileBytes || fileBytes.length === 0) {
      throw new DocumentParseError('The uploaded file is empty.');
    }
    const fileSizeMb = fileBytes.length / (1024 * 1024);
    if (fileSizeMb > maxMb) {
      throw new DocumentParseError(
        `File size (${fileSizeMb.toFixed(2)} MB) exceeds maximum allowed limit of ${maxMb} MB.`
      );
    }
    const ext = path.extname(fileName || '').toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) {
      throw new DocumentParseError(
        `Unsupported file format '${ext}'. Only .pdf and .docx documents are accepted.`
      );
    }
    return ext;
  },

  async extractTextFromPdf(fileBytes) {
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(fileBytes),
        verbosity: 0,
      });
      const pdfDoc = await loadingTask.promise;
      const pageCount = pdfDoc.numPages;
      if (pageCount === 0) {
        throw new DocumentParseError('The PDF document contains no pages.');
      }

      const pages = [];
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const lines = [];
        let lastY = null;
        let currentLine = [];

        for (const item of textContent.items) {
          if (!('str' in item)) continue;
          const y = item.transform ? Math.round(item.transform[5]) : null;
          if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
            if (currentLine.length) {
              lines.push(currentLine.join(' ').trim());
              currentLine = [];
            }
          }
          if (item.str) currentLine.push(item.str);
          if (y !== null) lastY = y;
        }
        if (currentLine.length) {
          lines.push(currentLine.join(' ').trim());
        }

        const pageText = lines.filter(Boolean).join('\n').trim();
        if (pageText) pages.push(pageText);
      }

      const extracted = pages.join('\n\n').trim();
      if (!extracted) {
        throw new DocumentParseError(
          'Unable to extract text from PDF. The document may be scanned or image-only without selectable text.'
        );
      }
      return { extractedText: extracted, pageCount };
    } catch (err) {
      if (err instanceof DocumentParseError) throw err;
      if (err?.name === 'PasswordException') {
        throw new DocumentParseError(
          'The PDF file is password protected. Please upload an unlocked document.'
        );
      }
      throw new DocumentParseError(`Failed to process PDF document: ${err.message || err}`);
    }
  },

  async extractTextFromDocx(fileBytes) {
    try {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(fileBytes) });
      const extracted = (result.value || '').trim();
      if (!extracted) {
        throw new DocumentParseError('The DOCX document is empty or contains no readable text.');
      }
      const words = extracted.split(/\s+/).filter(Boolean).length;
      const pageCount = Math.max(1, Math.floor(words / 400) + 1);
      return { extractedText: extracted, pageCount };
    } catch (err) {
      if (err instanceof DocumentParseError) throw err;
      throw new DocumentParseError(`Failed to process DOCX document: ${err.message || err}`);
    }
  },

  async parseDocument(fileBytes, fileName) {
    const ext = path.extname(fileName || '').toLowerCase();
    if (ext === '.pdf') {
      return this.extractTextFromPdf(fileBytes);
    }
    if (ext === '.docx') {
      return this.extractTextFromDocx(fileBytes);
    }
    throw new DocumentParseError(`Unsupported format '${ext}'.`);
  },
};
