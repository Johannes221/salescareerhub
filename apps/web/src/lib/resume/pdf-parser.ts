import { PdfTextExtractionError, PdfNoTextContentError } from './errors';

const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

const MIN_USEFUL_TEXT_LENGTH = 50;

export function validatePdfMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  return PDF_MAGIC_BYTES.every((byte, i) => buffer[i] === byte);
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!validatePdfMagicBytes(buffer)) {
    throw new PdfTextExtractionError('Die Datei ist kein gültiges PDF (ungültige Magic Bytes).');
  }

  try {
    // pdf-parse is a server-side only dependency
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer, {
      max: 0, // no page limit
    });

    const text = (result.text || '').trim();

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
