/**
 * DSGVO/GDPR Compliance Layer
 * 
 * Zentrale Utility-Funktionen für Datenschutz-Compliance.
 * Rechtsgrundlagen nach Art. 6 DSGVO:
 * - Art. 6 Abs. 1 lit. a: Einwilligung
 * - Art. 6 Abs. 1 lit. b: Vertragserfüllung / Vertragsanbahnung
 * - Art. 6 Abs. 1 lit. f: Berechtigtes Interesse
 */

export const GDPR_PURPOSES = {
  ACCOUNT_CREATION: {
    purpose: 'Kontoerstellung und Authentifizierung',
    legalBasis: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)',
    retention: 'Bis zur Kontolöschung',
  },
  CANDIDATE_PROFILE: {
    purpose: 'Erstellung und Pflege des Kandidatenprofils zur Jobvermittlung',
    legalBasis: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)',
    retention: 'Bis zur Kontolöschung oder 2 Jahre nach letzter Aktivität',
  },
  APPLICATION_PROCESSING: {
    purpose: 'Verarbeitung von Interessenbekundungen und Weiterleitung an Unternehmen',
    legalBasis: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)',
    retention: '6 Monate nach Abschluss des Vermittlungsprozesses',
  },
  CV_STORAGE: {
    purpose: 'Speicherung von Bewerbungsunterlagen (Lebenslauf, Anschreiben)',
    legalBasis: 'Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)',
    retention: 'Bis zum Widerruf oder Kontolöschung',
    requiresConsent: true,
  },
  COMPANY_PROFILE: {
    purpose: 'Erstellung und Veröffentlichung des Unternehmensprofils',
    legalBasis: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)',
    retention: 'Bis zur Kontolöschung',
  },
  ANALYTICS: {
    purpose: 'Anonymisierte Nutzungsanalyse zur Verbesserung der Plattform',
    legalBasis: 'Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse)',
    retention: '12 Monate',
  },
  CONTACT_FORM: {
    purpose: 'Bearbeitung von Kontaktanfragen',
    legalBasis: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)',
    retention: '6 Monate nach Abschluss der Anfrage',
  },
  REVIEWS: {
    purpose: 'Veröffentlichung von Unternehmensbewertungen',
    legalBasis: 'Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)',
    retention: 'Bis zum Widerruf',
    requiresConsent: true,
  },
} as const;

export type GdprPurpose = keyof typeof GDPR_PURPOSES;

/** Consent record for tracking user permissions */
export interface ConsentRecord {
  purpose: GdprPurpose;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

/** Data categories for data export / deletion */
export const DATA_CATEGORIES = {
  PERSONAL: ['User', 'CandidateProfile'],
  APPLICATION: ['Application', 'SavedJob'],
  DOCUMENTS: ['Document'],
  REVIEWS: ['CompanyReview'],
  ANALYTICS: ['AnalyticsEvent'],
  NOTIFICATIONS: ['Notification'],
  AUDIT: ['AuditLog'],
} as const;

/**
 * Sanitize personal data for safe display.
 * Masks email addresses and phone numbers partially.
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal = local.length > 2 ? local[0] + '***' + local[local.length - 1] : '***';
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return '***';
  return phone.slice(0, 4) + '****' + phone.slice(-2);
}

/**
 * Generate a data export summary for a user (Art. 15 DSGVO - Auskunftsrecht)
 */
export function getDataExportCategories(): { category: string; description: string; models: string[] }[] {
  return [
    { category: 'Stammdaten', description: 'Name, E-Mail, Kontaktdaten', models: ['User', 'CandidateProfile'] },
    { category: 'Bewerbungsdaten', description: 'Interessenbekundungen, gespeicherte Jobs', models: ['Application', 'SavedJob'] },
    { category: 'Dokumente', description: 'Hochgeladene Dateien (CV, etc.)', models: ['Document'] },
    { category: 'Bewertungen', description: 'Abgegebene Unternehmensbewertungen', models: ['CompanyReview'] },
    { category: 'Nutzungsdaten', description: 'Anonymisierte Nutzungsstatistiken', models: ['AnalyticsEvent'] },
    { category: 'Benachrichtigungen', description: 'Benachrichtigungsverlauf', models: ['Notification'] },
  ];
}

/** 
 * File upload validation for DSGVO-compliant document handling.
 * Ensures only allowed file types and sizes are accepted.
 */
export const FILE_CONSTRAINTS = {
  CV: {
    maxSizeMB: 10,
    allowedTypes: ['application/pdf'],
    allowedExtensions: ['.pdf'],
    description: 'Lebenslauf (nur PDF, max. 10 MB)',
  },
  COVER_LETTER: {
    maxSizeMB: 5,
    allowedTypes: ['application/pdf'],
    allowedExtensions: ['.pdf'],
    description: 'Anschreiben (nur PDF, max. 5 MB)',
  },
  LOGO: {
    maxSizeMB: 2,
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp'],
    allowedExtensions: ['.png', '.jpg', '.jpeg', '.webp'],
    description: 'Logo (PNG, JPG oder WebP, max. 2 MB)',
  },
  OTHER: {
    maxSizeMB: 10,
    allowedTypes: ['application/pdf', 'image/png', 'image/jpeg'],
    allowedExtensions: ['.pdf', '.png', '.jpg', '.jpeg'],
    description: 'Dokument (PDF oder Bild, max. 10 MB)',
  },
} as const;

export type FileCategory = keyof typeof FILE_CONSTRAINTS;

export function validateFile(file: File, category: FileCategory): { valid: boolean; error?: string } {
  const constraints = FILE_CONSTRAINTS[category];
  const maxBytes = constraints.maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return { valid: false, error: `Datei ist zu groß. Maximum: ${constraints.maxSizeMB} MB` };
  }

  if (!(constraints.allowedTypes as readonly string[]).includes(file.type)) {
    return { valid: false, error: `Dateityp nicht erlaubt. Erlaubt: ${constraints.allowedExtensions.join(', ')}` };
  }

  return { valid: true };
}
