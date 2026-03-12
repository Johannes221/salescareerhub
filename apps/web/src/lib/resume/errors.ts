export class ResumeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'ResumeError';
  }
}

export class InvalidFileTypeError extends ResumeError {
  constructor(message = 'Nur PDF-Dateien sind erlaubt.') {
    super(message, 'INVALID_FILE_TYPE', 400);
    this.name = 'InvalidFileTypeError';
  }
}

export class FileTooLargeError extends ResumeError {
  constructor(maxMB: number) {
    super(`Die Datei ist zu groß. Maximale Größe: ${maxMB} MB.`, 'FILE_TOO_LARGE', 400);
    this.name = 'FileTooLargeError';
  }
}

export class PdfTextExtractionError extends ResumeError {
  constructor(message = 'Der Text konnte nicht aus dem PDF extrahiert werden.') {
    super(message, 'PDF_TEXT_EXTRACTION_FAILED', 422);
    this.name = 'PdfTextExtractionError';
  }
}

export class PdfNoTextContentError extends ResumeError {
  constructor() {
    super(
      'Dieses PDF enthält kaum maschinenlesbaren Text. Bitte laden Sie einen textbasierten Lebenslauf hoch oder aktivieren Sie OCR.',
      'PDF_NO_TEXT_CONTENT',
      422,
    );
    this.name = 'PdfNoTextContentError';
  }
}

export class ResumeProviderUnavailableError extends ResumeError {
  constructor(provider: string) {
    super(
      `Der KI-Provider "${provider}" ist nicht verfügbar. Bitte prüfen Sie die Konfiguration.`,
      'PROVIDER_UNAVAILABLE',
      503,
    );
    this.name = 'ResumeProviderUnavailableError';
  }
}

export class ResumeValidationError extends ResumeError {
  constructor(message = 'Die KI-Antwort konnte nicht validiert werden.') {
    super(message, 'VALIDATION_FAILED', 422);
    this.name = 'ResumeValidationError';
  }
}

export class ResumeNormalizationError extends ResumeError {
  constructor(message = 'Die extrahierten Daten konnten nicht normalisiert werden.') {
    super(message, 'NORMALIZATION_FAILED', 422);
    this.name = 'ResumeNormalizationError';
  }
}

export class RateLimitExceededError extends ResumeError {
  constructor() {
    super('Zu viele Anfragen. Bitte versuchen Sie es später erneut.', 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitExceededError';
  }
}
