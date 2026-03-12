import OpenAI from 'openai';

type NullableString = string | null | undefined;

export interface JobAnonymizerInput {
  title: string;
  companyName: string;
  companyWebsite?: NullableString;
  companyLinkedInUrl?: NullableString;
  companyDescription?: NullableString;
  companyIndustry?: NullableString;
  companyStage?: NullableString;
  role: string;
  location?: NullableString;
  oteRange?: NullableString;
  jobDescription: string;
  requirements?: NullableString;
  benefits?: NullableString;
  productNames?: string[];
}

export interface JobAnonymizerResult {
  titleAnonymized: string;
  descriptionOriginal: string;
  descriptionAnonymized: string;
  requirementsAnonymized: string | null;
  benefitsAnonymized: string | null;
  originalCompanyName: string;
  anonymizedCompanyProfile: string | null;
  detectedCompanyTerms: string[];
  detectedProductTerms: string[];
  removedLinks: string[];
  model: string;
}

interface LLMJobAnonymizationResponse {
  titleAnonymized: string;
  descriptionAnonymized: string;
  requirementsAnonymized: string | null;
  benefitsAnonymized: string | null;
  anonymizedCompanyProfile: string | null;
  detectedCompanyTerms: string[];
  detectedProductTerms: string[];
}

export class JobAnonymizerError extends Error {
  constructor(
    public readonly code: 'CONFIGURATION_ERROR' | 'LLM_ERROR' | 'VALIDATION_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'JobAnonymizerError';
  }
}

const URL_REGEX = /\bhttps?:\/\/[^\s<>()]+/gi;
const WWW_URL_REGEX = /\bwww\.[^\s<>()]+/gi;
const LINKEDIN_REGEX = /\b(?:[\w-]+\.)?linkedin\.com\/[^\s<>()]+/gi;
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const COMPANY_SUFFIX_REGEX = /\b(gmbh|mbh|ag|se|ug|inc|llc|ltd|limited|corp|corporation|holding|holdings|group|bv|nv|plc|sarl|sas|oy|ab|kg|co\.?\s*kg)\b/gi;
const COMMON_GENERIC_TERMS = new Set([
  'company',
  'platform',
  'software',
  'solution',
  'product',
  'sales',
  'cloud',
  'data',
  'technology',
  'tech',
  'saas',
  'crm',
  'ai',
  'dach',
  'enterprise',
  'linkedin',
]);
const DEFAULT_COMPANY_LABEL = 'Vertrauliches Unternehmen';
const DEFAULT_COMPANY_PROFILE = 'Ein wachsendes B2B-Softwareunternehmen im DACH-Markt';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function compactWhitespace(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function toNonEmptyString(value: NullableString): string | null {
  if (typeof value !== 'string') return null;
  const normalized = compactWhitespace(value);
  return normalized ? normalized : null;
}

function extractMatches(pattern: RegExp, value: string): string[] {
  return value.match(pattern)?.map((item) => item.trim()) || [];
}

function stripSensitiveLinks(value: string): { text: string; removedLinks: string[] } {
  const removedLinks = [
    ...extractMatches(URL_REGEX, value),
    ...extractMatches(WWW_URL_REGEX, value),
    ...extractMatches(LINKEDIN_REGEX, value),
  ];

  const text = compactWhitespace(
    value
      .replace(URL_REGEX, ' ')
      .replace(WWW_URL_REGEX, ' ')
      .replace(LINKEDIN_REGEX, ' ')
      .replace(EMAIL_REGEX, ' '),
  );

  return {
    text,
    removedLinks: uniqueCaseInsensitive(removedLinks),
  };
}

function normalizeCompanyName(companyName: string): string {
  return compactWhitespace(
    companyName
      .replace(COMPANY_SUFFIX_REGEX, ' ')
      .replace(/[()]/g, ' ')
      .replace(/\s+/g, ' '),
  );
}

function normalizeDetectedTerm(term: string): string | null {
  const normalized = compactWhitespace(term.replace(/["'`]/g, ''));
  if (!normalized) return null;
  if (normalized.length < 3) return null;
  if (COMMON_GENERIC_TERMS.has(normalized.toLowerCase())) return null;
  return normalized;
}

function uniqueCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

function tryParseUrl(value: string): URL | null {
  try {
    return new URL(value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`);
  } catch {
    return null;
  }
}

function extractSensitiveTermsFromUrl(value: NullableString): string[] {
  const normalized = toNonEmptyString(value);
  if (!normalized) return [];

  const parsed = tryParseUrl(normalized);
  if (!parsed) return [];

  const hostname = parsed.hostname.replace(/^www\./i, '');
  const hostParts = hostname.split('.').filter(Boolean);
  const firstHostLabel = hostParts[0];
  const pathParts = parsed.pathname.split('/').filter(Boolean);
  const lastPathPart = pathParts[pathParts.length - 1];

  return uniqueCaseInsensitive(
    [firstHostLabel, lastPathPart]
      .filter((part): part is string => Boolean(part && part.length >= 4))
      .map((part) => part.replace(/[-_]+/g, ' ').trim())
      .filter(Boolean),
  );
}

function buildSensitiveCompanyTerms(input: JobAnonymizerInput): string[] {
  const normalizedCompanyName = normalizeCompanyName(input.companyName);

  return uniqueCaseInsensitive([
    input.companyName,
    normalizedCompanyName,
    ...extractSensitiveTermsFromUrl(input.companyWebsite),
    ...extractSensitiveTermsFromUrl(input.companyLinkedInUrl),
  ]).filter((term) => term.length >= 3);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildFlexibleRegex(term: string): RegExp {
  const escaped = escapeRegExp(term.trim())
    .replace(/\s+/g, '[\\s\\-_.]*')
    .replace(/\\-/g, '[\\s\\-_.]*');

  return new RegExp(`\\b${escaped}\\b`, 'gi');
}

function redactTerms(value: string, terms: string[], replacement: string): string {
  let nextValue = value;

  for (const term of [...terms].sort((a, b) => b.length - a.length)) {
    nextValue = nextValue.replace(buildFlexibleRegex(term), replacement);
  }

  return compactWhitespace(nextValue);
}

function findResidualTerms(value: string, terms: string[]): string[] {
  const matches: string[] = [];

  for (const term of terms) {
    if (buildFlexibleRegex(term).test(value)) {
      matches.push(term);
    }
  }

  return uniqueCaseInsensitive(matches);
}

function sanitizeOutputText(
  value: NullableString,
  companyTerms: string[],
  productTerms: string[],
  fallbackValue?: string,
): string | null {
  const initial = toNonEmptyString(value) || toNonEmptyString(fallbackValue);
  if (!initial) return null;

  const { text: withoutLinks } = stripSensitiveLinks(initial);
  const withoutCompanyTerms = redactTerms(withoutLinks, companyTerms, 'the company');
  const withoutProductTerms = redactTerms(withoutCompanyTerms, productTerms, 'the platform');
  const withoutEmails = compactWhitespace(withoutProductTerms.replace(EMAIL_REGEX, ' '));

  return withoutEmails || null;
}

function isValidLLMResponse(value: unknown): value is LLMJobAnonymizationResponse {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<LLMJobAnonymizationResponse>;
  return (
    typeof candidate.titleAnonymized === 'string' &&
    typeof candidate.descriptionAnonymized === 'string' &&
    Array.isArray(candidate.detectedCompanyTerms) &&
    Array.isArray(candidate.detectedProductTerms)
  );
}

function buildPromptPayload(input: JobAnonymizerInput, cleanedFields: {
  title: string;
  jobDescription: string;
  requirements: string | null;
  benefits: string | null;
  sensitiveCompanyTerms: string[];
  productNames: string[];
}) {
  return JSON.stringify(
    {
      company: {
        companyName: input.companyName,
        website: toNonEmptyString(input.companyWebsite),
        linkedinUrl: toNonEmptyString(input.companyLinkedInUrl),
        description: toNonEmptyString(input.companyDescription),
        industry: toNonEmptyString(input.companyIndustry),
        stage: toNonEmptyString(input.companyStage),
      },
      job: {
        title: cleanedFields.title,
        role: input.role,
        location: toNonEmptyString(input.location),
        oteRange: toNonEmptyString(input.oteRange),
        jobDescription: cleanedFields.jobDescription,
        requirements: cleanedFields.requirements,
        benefits: cleanedFields.benefits,
      },
      safeguards: {
        sensitiveCompanyTerms: cleanedFields.sensitiveCompanyTerms,
        knownProductNames: cleanedFields.productNames,
      },
      instructions: {
        language: 'Preserve the input language when possible.',
        requirements: [
          'Rewrite the title and public-facing text so that the employer cannot be identified.',
          'Remove company names, product names, websites, LinkedIn references, email addresses, customer names, founder names, office references, and unique identifiers.',
          'Generalize the company description into a broad sector/stage profile suitable for a public job board.',
          'Keep the role, scope, responsibilities, and value proposition intact where they are not identifying.',
          'Do not output URLs, company handles, emails, or calls to visit a website or LinkedIn profile.',
          'Return strict JSON only.',
        ],
        outputSchema: {
          titleAnonymized: 'string',
          descriptionAnonymized: 'string',
          requirementsAnonymized: 'string | null',
          benefitsAnonymized: 'string | null',
          anonymizedCompanyProfile: 'string | null',
          detectedCompanyTerms: 'string[]',
          detectedProductTerms: 'string[]',
        },
      },
    },
    null,
    2,
  );
}

export async function anonymizeJob(input: JobAnonymizerInput): Promise<JobAnonymizerResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new JobAnonymizerError('CONFIGURATION_ERROR', 'OPENAI_API_KEY fehlt für die Job-Anonymisierung.');
  }

  const cleanedTitle = stripSensitiveLinks(input.title);
  const cleanedDescription = stripSensitiveLinks(input.jobDescription);
  const cleanedRequirements = input.requirements ? stripSensitiveLinks(input.requirements) : null;
  const cleanedBenefits = input.benefits ? stripSensitiveLinks(input.benefits) : null;
  const sensitiveCompanyTerms = buildSensitiveCompanyTerms(input);
  const knownProductNames = uniqueCaseInsensitive(
    (input.productNames || [])
      .map((value) => normalizeDetectedTerm(value) || '')
      .filter(Boolean),
  );

  const removedLinks = uniqueCaseInsensitive([
    ...cleanedTitle.removedLinks,
    ...cleanedDescription.removedLinks,
    ...(cleanedRequirements?.removedLinks || []),
    ...(cleanedBenefits?.removedLinks || []),
  ]);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let completion;
  try {
    completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.1,
      max_tokens: 2200,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You anonymize B2B SaaS job postings for public publication. Remove identifying details while preserving hiring-relevant substance. Always return strict JSON.',
        },
        {
          role: 'user',
          content: buildPromptPayload(input, {
            title: cleanedTitle.text,
            jobDescription: cleanedDescription.text,
            requirements: cleanedRequirements?.text || null,
            benefits: cleanedBenefits?.text || null,
            sensitiveCompanyTerms,
            productNames: knownProductNames,
          }),
        },
      ],
    });
  } catch (error) {
    throw new JobAnonymizerError(
      'LLM_ERROR',
      error instanceof Error ? error.message : 'Die Anonymisierungs-API ist nicht erreichbar.',
    );
  }

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new JobAnonymizerError('LLM_ERROR', 'Die Anonymisierungs-API hat keine Antwort geliefert.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new JobAnonymizerError('LLM_ERROR', 'Die Anonymisierungs-API hat ungültiges JSON geliefert.');
  }

  if (!isValidLLMResponse(parsed)) {
    throw new JobAnonymizerError('LLM_ERROR', 'Die Anonymisierungs-API hat ein unvollständiges Ergebnis geliefert.');
  }

  const detectedCompanyTerms = uniqueCaseInsensitive(
    [...sensitiveCompanyTerms, ...parsed.detectedCompanyTerms]
      .map((value) => normalizeDetectedTerm(value) || '')
      .filter(Boolean),
  );
  const detectedProductTerms = uniqueCaseInsensitive(
    [...knownProductNames, ...parsed.detectedProductTerms]
      .map((value) => normalizeDetectedTerm(value) || '')
      .filter(Boolean),
  );

  const titleAnonymized =
    sanitizeOutputText(parsed.titleAnonymized, detectedCompanyTerms, detectedProductTerms, cleanedTitle.text) ||
    input.role ||
    cleanedTitle.text;
  const descriptionAnonymized = sanitizeOutputText(
    parsed.descriptionAnonymized,
    detectedCompanyTerms,
    detectedProductTerms,
    cleanedDescription.text,
  );
  const requirementsAnonymized = sanitizeOutputText(
    parsed.requirementsAnonymized,
    detectedCompanyTerms,
    detectedProductTerms,
    cleanedRequirements?.text,
  );
  const benefitsAnonymized = sanitizeOutputText(
    parsed.benefitsAnonymized,
    detectedCompanyTerms,
    detectedProductTerms,
    cleanedBenefits?.text,
  );
  const anonymizedCompanyProfile =
    sanitizeOutputText(
      parsed.anonymizedCompanyProfile,
      detectedCompanyTerms,
      detectedProductTerms,
      input.companyIndustry ? `Ein wachsendes ${input.companyIndustry} Unternehmen` : undefined,
    ) || DEFAULT_COMPANY_PROFILE;

  if (!descriptionAnonymized) {
    throw new JobAnonymizerError('VALIDATION_ERROR', 'Die anonymisierte Beschreibung ist leer.');
  }

  const publicOutputs = [titleAnonymized, descriptionAnonymized, requirementsAnonymized, benefitsAnonymized, anonymizedCompanyProfile]
    .filter((value): value is string => Boolean(value))
    .join('\n');

  const residualCompanyTerms = findResidualTerms(publicOutputs, detectedCompanyTerms);
  const residualProductTerms = findResidualTerms(publicOutputs, detectedProductTerms);
  const residualLinks = uniqueCaseInsensitive([
    ...extractMatches(URL_REGEX, publicOutputs),
    ...extractMatches(WWW_URL_REGEX, publicOutputs),
    ...extractMatches(LINKEDIN_REGEX, publicOutputs),
    ...extractMatches(EMAIL_REGEX, publicOutputs),
  ]);

  if (residualCompanyTerms.length || residualProductTerms.length || residualLinks.length) {
    throw new JobAnonymizerError(
      'VALIDATION_ERROR',
      `Restliche Identifikatoren erkannt: ${[
        ...residualCompanyTerms,
        ...residualProductTerms,
        ...residualLinks,
      ].join(', ')}`,
    );
  }

  return {
    titleAnonymized: titleAnonymized || input.role || DEFAULT_COMPANY_LABEL,
    descriptionOriginal: compactWhitespace(input.jobDescription),
    descriptionAnonymized,
    requirementsAnonymized,
    benefitsAnonymized,
    originalCompanyName: input.companyName,
    anonymizedCompanyProfile,
    detectedCompanyTerms,
    detectedProductTerms,
    removedLinks,
    model: OPENAI_MODEL,
  };
}

export function buildPublicCompanyLabel(anonymizedCompanyProfile: NullableString): string {
  return toNonEmptyString(anonymizedCompanyProfile) || DEFAULT_COMPANY_LABEL;
}
