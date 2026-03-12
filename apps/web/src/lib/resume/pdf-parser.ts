import { PdfTextExtractionError, PdfNoTextContentError } from './errors';

const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

const MIN_USEFUL_TEXT_LENGTH = 50;

export function validatePdfMagicBytes(buffer: Uint8Array): boolean {
  if (buffer.length < 5) return false;
  return PDF_MAGIC_BYTES.every((byte, i) => buffer[i] === byte);
}

function normalizeExtractedText(text: string): string {
  return text.replace(/\u0000/g, '').trim();
}

async function extractTextWithPdfParse(buffer: Uint8Array): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer, {
    max: 0,
  });
  return normalizeExtractedText(result.text || '');
}

async function extractTextWithPdfJsFallback(buffer: Uint8Array): Promise<string> {
  const pdfJsModule = await import('pdf-parse/lib/pdf.js/v2.0.550/build/pdf.js');
  const pdfjs = (pdfJsModule as { default?: any }).default ?? pdfJsModule;
  pdfjs.disableWorker = true;

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    stopAtErrors: false,
    isEvalSupported: false,
    disableFontFace: true,
    useSystemFonts: false,
    verbosity: 0,
  });

  const doc = await loadingTask.promise;
  let text = '';

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent({
        normalizeWhitespace: true,
        disableCombineTextItems: false,
      });
      const pageText = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
        .trim();

      text += `${pageText}\n`;
    }
  } finally {
    await doc.destroy();
  }

  return normalizeExtractedText(text);
}

export async function extractTextFromPdf(buffer: Uint8Array): Promise<string> {
  if (!validatePdfMagicBytes(buffer)) {
    throw new PdfTextExtractionError('Die Datei ist kein gültiges PDF (ungültige Magic Bytes).');
  }

  try {
    let text = '';

    try {
      text = await extractTextWithPdfParse(buffer);
    } catch {
      text = await extractTextWithPdfJsFallback(buffer);
    }

    if (text.length < MIN_USEFUL_TEXT_LENGTH) {
      throw new PdfNoTextContentError();
    }

    return text;
  } catch (error) {
    if (error instanceof PdfNoTextContentError) throw error;
    if (error instanceof PdfTextExtractionError) throw error;
    throw new PdfTextExtractionError(
      'Der Text konnte nicht aus dem PDF extrahiert werden. Möglicherweise ist die Datei beschädigt.',
    );
  }
}
