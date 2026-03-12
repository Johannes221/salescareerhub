declare module 'pdf-parse' {
  interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown> | null;
    version: string;
    text: string;
  }

  interface PdfParseOptions {
    max?: number;
    version?: string;
    pagerender?: (pageData: unknown) => string;
  }

  function pdfParse(dataBuffer: Buffer, options?: PdfParseOptions): Promise<PdfParseResult>;
  export default pdfParse;
}
