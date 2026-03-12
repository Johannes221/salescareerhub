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

  function pdfParse(dataBuffer: Uint8Array, options?: PdfParseOptions): Promise<PdfParseResult>;
  export default pdfParse;
}

declare module 'pdf-parse/lib/pdf.js/v2.0.550/build/pdf.js' {
  interface PdfJsTextContent {
    items: Array<{ str?: string }>;
  }

  interface PdfJsPage {
    getTextContent(options?: {
      normalizeWhitespace?: boolean;
      disableCombineTextItems?: boolean;
    }): Promise<PdfJsTextContent>;
  }

  interface PdfJsDocument {
    numPages: number;
    getPage(pageNumber: number): Promise<PdfJsPage>;
    destroy(): Promise<void> | void;
  }

  interface PdfJsLoadingTask {
    promise: Promise<PdfJsDocument>;
  }

  interface PdfJsModule {
    disableWorker: boolean;
    getDocument(options: {
      data: Uint8Array;
      stopAtErrors?: boolean;
      isEvalSupported?: boolean;
      disableFontFace?: boolean;
      useSystemFonts?: boolean;
      verbosity?: number;
    }): PdfJsLoadingTask;
  }

  const pdfjs: PdfJsModule;
  export = pdfjs;
}
