import type {
  ExtractedResumeRaw,
  NormalizedCandidateProfile,
  ConfidenceLevel,
  Seniority,
  WorkModel,
  ResumeStation,
  LanguageEntry,
  ExtractField,
} from './schemas';

// ─── Role Title Normalization ───────────────────────────────
const ROLE_MAPPINGS: Record<string, string> = {
  'ae': 'Account Executive',
  'enterprise ae': 'Account Executive',
  'account exec': 'Account Executive',
  'sdr': 'Sales Development Representative',
  'bdr': 'Business Development Representative',
  'biz dev': 'Business Development Representative',
  'csm': 'Customer Success Manager',
  'customer success mgr': 'Customer Success Manager',
  'se': 'Sales Engineer',
  'presales': 'Sales Engineer',
  'pre-sales': 'Sales Engineer',
  'vp sales': 'VP of Sales',
  'vp of sales': 'VP of Sales',
  'head of sales': 'Head of Sales',
  'sales lead': 'Sales Lead',
  'sales manager': 'Sales Manager',
  'sales director': 'Sales Director',
  'chief revenue officer': 'Chief Revenue Officer',
  'cro': 'Chief Revenue Officer',
  'revenue lead': 'Revenue Lead',
  'partner manager': 'Partner Manager',
  'channel manager': 'Channel Manager',
  'key account manager': 'Key Account Manager',
  'kam': 'Key Account Manager',
  'inside sales': 'Inside Sales Representative',
  'field sales': 'Field Sales Representative',
};

export function normalizeRoleTitle(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  return ROLE_MAPPINGS[lower] || trimmed;
}

// ─── Seniority Inference ────────────────────────────────────
const SENIORITY_KEYWORDS: Record<Seniority, string[]> = {
  junior: ['junior', 'jr', 'entry', 'trainee', 'werkstudent', 'intern', 'praktikant'],
  mid: ['mid', 'regular', 'professional'],
  senior: ['senior', 'sr', 'experienced', 'principal'],
  lead: ['lead', 'team lead', 'teamlead', 'tech lead'],
  manager: ['manager', 'mgr', 'head of', 'head'],
  director: ['director', 'dir'],
  vp: ['vp', 'vice president', 'vice-president'],
  c_level: ['ceo', 'cto', 'cfo', 'coo', 'cro', 'cmo', 'chief', 'c-level', 'c-suite', 'founder', 'co-founder'],
  unknown: [],
};

export function inferSeniorityFromTitle(title: string | null | undefined): Seniority | null {
  if (!title) return null;
  const lower = title.toLowerCase();

  for (const [seniority, keywords] of Object.entries(SENIORITY_KEYWORDS)) {
    if (seniority === 'unknown') continue;
    for (const kw of keywords) {
      if (lower.includes(kw)) return seniority as Seniority;
    }
  }
  return null;
}

export function inferSeniorityFromYears(years: number | null | undefined): Seniority | null {
  if (years === null || years === undefined) return null;
  if (years < 2) return 'junior';
  if (years < 5) return 'mid';
  if (years < 8) return 'senior';
  if (years < 12) return 'lead';
  if (years < 16) return 'manager';
  if (years < 20) return 'director';
  return 'vp';
}

// ─── Notice Period Normalization ────────────────────────────
const NOTICE_PATTERNS: [RegExp, string][] = [
  [/(?:ab )?sofort|immediately|asap|verfügbar/i, 'Sofort verfügbar'],
  [/(\d+)\s*(?:monate?|months?)\s*(?:kündigungsfrist|notice|frist)?/i, '$1 Monate Kündigungsfrist'],
  [/(\d+)\s*(?:wochen?|weeks?)\s*(?:kündigungsfrist|notice|frist)?/i, '$1 Wochen Kündigungsfrist'],
  [/(\d+)\s*(?:tage?|days?)/i, '$1 Tage Kündigungsfrist'],
  [/zum\s+(?:monatsende|quartalsende)/i, 'Zum Monatsende/Quartalsende'],
  [/3\s*month/i, '3 Monate Kündigungsfrist'],
  [/6\s*month/i, '6 Monate Kündigungsfrist'],
  [/1\s*month/i, '1 Monat Kündigungsfrist'],
  [/2\s*month/i, '2 Monate Kündigungsfrist'],
];

export function parseNoticePeriod(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  for (const [pattern, replacement] of NOTICE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return trimmed.replace(pattern, replacement);
    }
  }
  return trimmed;
}

// ─── Language Normalization ─────────────────────────────────
const LANGUAGE_NAMES: Record<string, string> = {
  'de': 'Deutsch', 'deutsch': 'Deutsch', 'german': 'Deutsch',
  'en': 'Englisch', 'englisch': 'Englisch', 'english': 'Englisch',
  'fr': 'Französisch', 'französisch': 'Französisch', 'french': 'Französisch',
  'es': 'Spanisch', 'spanisch': 'Spanisch', 'spanish': 'Spanisch',
  'it': 'Italienisch', 'italienisch': 'Italienisch', 'italian': 'Italienisch',
  'pt': 'Portugiesisch', 'portugiesisch': 'Portugiesisch', 'portuguese': 'Portugiesisch',
  'nl': 'Niederländisch', 'niederländisch': 'Niederländisch', 'dutch': 'Niederländisch',
  'ru': 'Russisch', 'russisch': 'Russisch', 'russian': 'Russisch',
  'zh': 'Chinesisch', 'chinesisch': 'Chinesisch', 'chinese': 'Chinesisch', 'mandarin': 'Chinesisch',
  'ja': 'Japanisch', 'japanisch': 'Japanisch', 'japanese': 'Japanisch',
  'ko': 'Koreanisch', 'koreanisch': 'Koreanisch', 'korean': 'Koreanisch',
  'ar': 'Arabisch', 'arabisch': 'Arabisch', 'arabic': 'Arabisch',
  'tr': 'Türkisch', 'türkisch': 'Türkisch', 'turkish': 'Türkisch',
  'pl': 'Polnisch', 'polnisch': 'Polnisch', 'polish': 'Polnisch',
};

const LEVEL_NAMES: Record<string, string> = {
  'native': 'Muttersprache', 'muttersprache': 'Muttersprache', 'muttersprachlich': 'Muttersprache',
  'c2': 'Muttersprache', 'mother tongue': 'Muttersprache',
  'fluent': 'Fließend', 'fließend': 'Fließend', 'c1': 'Fließend',
  'advanced': 'Fortgeschritten', 'fortgeschritten': 'Fortgeschritten', 'b2': 'Fortgeschritten',
  'intermediate': 'Mittelstufe', 'mittelstufe': 'Mittelstufe', 'b1': 'Mittelstufe',
  'basic': 'Grundkenntnisse', 'grundkenntnisse': 'Grundkenntnisse', 'a2': 'Grundkenntnisse',
  'beginner': 'Anfänger', 'anfänger': 'Anfänger', 'a1': 'Anfänger',
  'verhandlungssicher': 'Verhandlungssicher', 'business fluent': 'Verhandlungssicher',
  'business': 'Verhandlungssicher', 'proficient': 'Verhandlungssicher',
};

export function normalizeLanguages(languages: LanguageEntry[]): LanguageEntry[] {
  const seen = new Set<string>();
  const result: LanguageEntry[] = [];

  for (const lang of languages) {
    const normalizedName = LANGUAGE_NAMES[lang.sprache.toLowerCase().trim()] || lang.sprache.trim();
    if (seen.has(normalizedName.toLowerCase())) continue;
    seen.add(normalizedName.toLowerCase());

    const normalizedLevel = lang.level
      ? LEVEL_NAMES[lang.level.toLowerCase().trim()] || lang.level.trim()
      : null;

    result.push({ sprache: normalizedName, level: normalizedLevel });
  }
  return result;
}

// ─── Skills Deduplication ───────────────────────────────────
export function dedupeSkills(skills: string[]): string[] {
  const seen = new Map<string, string>();
  for (const skill of skills) {
    const trimmed = skill.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase().replace(/[^a-z0-9äöüß]/g, '');
    if (!seen.has(key)) {
      seen.set(key, trimmed);
    }
  }
  return Array.from(seen.values());
}

// ─── Experience Years Calculation ───────────────────────────
export function computeExperienceYearsFromRoles(
  stations: ResumeStation[],
): { years: number; isEstimate: boolean } | null {
  if (!stations.length) return null;

  const validStations = stations.filter((s) => s.startDate);
  if (!validStations.length) return null;

  let totalMonths = 0;
  let hasGaps = false;

  for (const station of validStations) {
    const start = parseYearMonth(station.startDate);
    if (!start) continue;

    const end = station.endDate ? parseYearMonth(station.endDate) : new Date();
    if (!end) continue;

    const months = Math.max(
      0,
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
    );

    if (months > 360) {
      hasGaps = true;
      continue;
    }

    totalMonths += months;
  }

  if (totalMonths === 0) return null;

  const years = Math.round(totalMonths / 12);
  return { years, isEstimate: hasGaps || validStations.length !== stations.length };
}

function parseYearMonth(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // YYYY-MM
  const ymMatch = trimmed.match(/^(\d{4})-(\d{1,2})$/);
  if (ymMatch) return new Date(parseInt(ymMatch[1]), parseInt(ymMatch[2]) - 1);

  // YYYY
  const yMatch = trimmed.match(/^(\d{4})$/);
  if (yMatch) return new Date(parseInt(yMatch[1]), 0);

  // MM/YYYY or MM.YYYY
  const myMatch = trimmed.match(/^(\d{1,2})[./](\d{4})$/);
  if (myMatch) return new Date(parseInt(myMatch[2]), parseInt(myMatch[1]) - 1);

  return null;
}

// ─── Compensation Normalization ─────────────────────────────
export function normalizeCompensation(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || isNaN(value)) return null;
  if (value < 0) return null;

  // Monthly -> yearly heuristic
  if (value > 500 && value < 15000) return Math.round(value * 12);

  // Already yearly
  if (value >= 15000 && value <= 500000) return Math.round(value);

  return null;
}

// ─── Work Model Normalization ───────────────────────────────
const WORK_MODEL_PATTERNS: Record<WorkModel, string[]> = {
  remote: ['remote', 'home office', 'homeoffice', 'fully remote', '100% remote', 'fernarbeit'],
  hybrid: ['hybrid', 'teilweise remote', 'flex', 'flexible', 'mixed'],
  onsite: ['onsite', 'on-site', 'vor ort', 'büro', 'office', 'präsenz'],
  unknown: [],
};

export function normalizeWorkModel(raw: string | null | undefined): WorkModel | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();

  for (const [model, patterns] of Object.entries(WORK_MODEL_PATTERNS)) {
    if (model === 'unknown') continue;
    for (const p of patterns) {
      if (lower.includes(p)) return model as WorkModel;
    }
  }
  return null;
}

// ─── Full Normalization Pipeline ────────────────────────────
export function normalizeExtractedResume(
  raw: ExtractedResumeRaw,
): { profile: NormalizedCandidateProfile; warnings: string[] } {
  const warnings: string[] = [];

  // Normalize role
  const normalizedRole = normalizeRoleTitle(raw.aktuelleRolle);

  // Determine seniority
  let seniority = raw.seniority;
  let seniorityConfidence: ConfidenceLevel = 'high';
  if (!seniority || seniority === 'unknown') {
    const fromTitle = inferSeniorityFromTitle(raw.aktuelleRolle);
    if (fromTitle) {
      seniority = fromTitle;
      seniorityConfidence = 'medium';
    } else {
      const fromYears = inferSeniorityFromYears(raw.berufserfahrungJahre);
      if (fromYears) {
        seniority = fromYears;
        seniorityConfidence = 'low';
        warnings.push('Seniority wurde aus der Berufserfahrung abgeleitet.');
      }
    }
  }

  // Normalize languages
  const normalizedLanguages = normalizeLanguages(raw.sprachen || []);

  // Deduplicate skills
  const normalizedSkills = dedupeSkills(raw.skills || []);

  // Compute experience from stations if not given
  let experienceYears = raw.berufserfahrungJahre;
  let experienceConfidence: ConfidenceLevel = 'high';
  if (experienceYears === null || experienceYears === undefined) {
    const computed = computeExperienceYearsFromRoles(raw.berufsstationen || []);
    if (computed) {
      experienceYears = computed.years;
      experienceConfidence = computed.isEstimate ? 'low' : 'medium';
      warnings.push('Berufserfahrung wurde aus Datumsangaben geschätzt.');
    }
  }

  // Normalize notice period
  const noticePeriod = parseNoticePeriod(raw.kuendigungsfrist);

  // Normalize compensation
  const gehaltBase = normalizeCompensation(raw.gehaltBaseJahr);
  const gehaltOTE = normalizeCompensation(raw.gehaltOTEJahr);

  // Work model
  const workModel = raw.arbeitsmodellPraeferenz && raw.arbeitsmodellPraeferenz !== 'unknown'
    ? raw.arbeitsmodellPraeferenz
    : normalizeWorkModel(raw.arbeitsmodellPraeferenz) || null;

  // Build field helpers
  const f = <T>(value: T, confidence: ConfidenceLevel = 'high'): ExtractField<T> => ({
    value,
    confidence: value === null || value === undefined ? undefined : confidence,
  });

  const profile: NormalizedCandidateProfile = {
    aktuelleRolle: f(normalizedRole, normalizedRole ? 'high' : undefined as unknown as ConfidenceLevel),
    zielrolle: f(raw.zielrolle || null, raw.zielrolle ? 'medium' : undefined as unknown as ConfidenceLevel),
    seniority: f(seniority || null, seniorityConfidence),
    berufserfahrungJahre: f(experienceYears ?? null, experienceConfidence),
    kuendigungsfrist: f(noticePeriod, noticePeriod ? 'medium' : undefined as unknown as ConfidenceLevel),
    skills: f(normalizedSkills, normalizedSkills.length > 0 ? 'high' : undefined as unknown as ConfidenceLevel),
    sprachen: f(normalizedLanguages, normalizedLanguages.length > 0 ? 'high' : undefined as unknown as ConfidenceLevel),
    gehaltBaseJahr: f(gehaltBase, gehaltBase ? 'medium' : undefined as unknown as ConfidenceLevel),
    gehaltOTEJahr: f(gehaltOTE, gehaltOTE ? 'medium' : undefined as unknown as ConfidenceLevel),
    berufsstationen: f(raw.berufsstationen || [], (raw.berufsstationen || []).length > 0 ? 'high' : undefined as unknown as ConfidenceLevel),
    standort: f(raw.standort || null, raw.standort ? 'high' : undefined as unknown as ConfidenceLevel),
    arbeitsmodellPraeferenz: f(workModel, workModel ? 'medium' : undefined as unknown as ConfidenceLevel),
    telefon: f(raw.telefon || null, raw.telefon ? 'high' : undefined as unknown as ConfidenceLevel),
    email: f(raw.email || null, raw.email ? 'high' : undefined as unknown as ConfidenceLevel),
    linkedinUrl: f(raw.linkedinUrl || null, raw.linkedinUrl ? 'high' : undefined as unknown as ConfidenceLevel),
  };

  // Warnings for missing fields
  if (!normalizedRole) warnings.push('Aktuelle Rolle konnte nicht erkannt werden.');
  if (!raw.zielrolle) warnings.push('Zielrolle konnte nicht sicher erkannt werden.');
  if (normalizedSkills.length === 0) warnings.push('Keine Skills erkannt.');
  if (normalizedLanguages.length === 0) warnings.push('Keine Sprachen erkannt.');

  return { profile, warnings };
}
