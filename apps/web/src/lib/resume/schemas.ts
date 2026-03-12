import { z } from 'zod';

// ─── Enums ──────────────────────────────────────────────────
export const SeniorityEnum = z.enum([
  'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c_level', 'unknown',
]);

export const WorkModelEnum = z.enum(['remote', 'hybrid', 'onsite', 'unknown']);

export const ConfidenceLevelEnum = z.enum(['high', 'medium', 'low', 'unknown']);

// ─── Sub-Schemas ────────────────────────────────────────────
export const LanguageEntrySchema = z.object({
  sprache: z.string(),
  level: z.string().nullable().optional(),
});

export const ResumeStationSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  summary: z.string().nullable(),
});

export const ResumeEducationSchema = z.object({
  degree: z.string().nullable(),
  institution: z.string().nullable(),
  startYear: z.string().nullable(),
  endYear: z.string().nullable(),
});

// ─── Raw AI Extraction Schema ───────────────────────────────
export const ExtractedResumeRawSchema = z.object({
  vorname: z.string().nullable().optional().default(null),
  nachname: z.string().nullable().optional().default(null),
  aktuelleRolle: z.string().nullable().optional().default(null),
  zielrolle: z.string().nullable().optional().default(null),
  seniority: SeniorityEnum.nullable().optional().default(null),
  berufserfahrungJahre: z.number().nullable().optional().default(null),
  kuendigungsfrist: z.string().nullable().optional().default(null),
  skills: z.array(z.string()).optional().default([]),
  sprachen: z.array(LanguageEntrySchema).optional().default([]),
  gehaltBaseJahr: z.number().nullable().optional().default(null),
  gehaltOTEJahr: z.number().nullable().optional().default(null),
  berufsstationen: z.array(ResumeStationSchema).optional().default([]),
  ausbildungen: z.array(ResumeEducationSchema).optional().default([]),
  standort: z.string().nullable().optional().default(null),
  arbeitsmodellPraeferenz: WorkModelEnum.nullable().optional().default(null),
  telefon: z.string().nullable().optional().default(null),
  email: z.string().nullable().optional().default(null),
  linkedinUrl: z.string().nullable().optional().default(null),
});

// ─── ExtractField<T> ────────────────────────────────────────
export function extractFieldSchema<T extends z.ZodType>(valueSchema: T) {
  return z.object({
    value: valueSchema,
    confidence: ConfidenceLevelEnum.optional(),
  });
}

// ─── Normalized Candidate Profile ───────────────────────────
export const NormalizedCandidateProfileSchema = z.object({
  vorname: extractFieldSchema(z.string().nullable()),
  nachname: extractFieldSchema(z.string().nullable()),
  aktuelleRolle: extractFieldSchema(z.string().nullable()),
  zielrolle: extractFieldSchema(z.string().nullable()),
  seniority: extractFieldSchema(SeniorityEnum.nullable()),
  berufserfahrungJahre: extractFieldSchema(z.number().nullable()),
  kuendigungsfrist: extractFieldSchema(z.string().nullable()),
  skills: extractFieldSchema(z.array(z.string())),
  sprachen: extractFieldSchema(z.array(LanguageEntrySchema)),
  gehaltBaseJahr: extractFieldSchema(z.number().nullable()),
  gehaltOTEJahr: extractFieldSchema(z.number().nullable()),
  berufsstationen: extractFieldSchema(z.array(ResumeStationSchema)),
  ausbildungen: extractFieldSchema(z.array(ResumeEducationSchema)),
  standort: extractFieldSchema(z.string().nullable()),
  arbeitsmodellPraeferenz: extractFieldSchema(WorkModelEnum.nullable()),
  telefon: extractFieldSchema(z.string().nullable()),
  email: extractFieldSchema(z.string().nullable()),
  linkedinUrl: extractFieldSchema(z.string().nullable()),
});

// ─── API Response Schemas ───────────────────────────────────
export const ResumeExtractMetaSchema = z.object({
  provider: z.string(),
  processingMs: z.number(),
  rawTextLength: z.number(),
  warnings: z.array(z.string()),
});

export const ResumeExtractSuccessResponseSchema = z.object({
  success: z.literal(true),
  requestId: z.string(),
  extracted: NormalizedCandidateProfileSchema,
  meta: ResumeExtractMetaSchema,
});

export const ResumeExtractErrorResponseSchema = z.object({
  success: z.literal(false),
  requestId: z.string(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

// ─── Inferred Types ─────────────────────────────────────────
export type Seniority = z.infer<typeof SeniorityEnum>;
export type WorkModel = z.infer<typeof WorkModelEnum>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelEnum>;
export type LanguageEntry = z.infer<typeof LanguageEntrySchema>;
export type ResumeStation = z.infer<typeof ResumeStationSchema>;
export type ResumeEducation = z.infer<typeof ResumeEducationSchema>;
export type ExtractedResumeRaw = z.infer<typeof ExtractedResumeRawSchema>;
export type ExtractField<T> = { value: T; confidence?: ConfidenceLevel };
export type NormalizedCandidateProfile = z.infer<typeof NormalizedCandidateProfileSchema>;
export type ResumeExtractMeta = z.infer<typeof ResumeExtractMetaSchema>;
export type ResumeExtractSuccessResponse = z.infer<typeof ResumeExtractSuccessResponseSchema>;
export type ResumeExtractErrorResponse = z.infer<typeof ResumeExtractErrorResponseSchema>;
export type ResumeExtractResponse = ResumeExtractSuccessResponse | ResumeExtractErrorResponse;
