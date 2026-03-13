export type JobRequirementBucket = {
  yearsOfExperience: number | null;
  industries: string[];
  previousRoles: string[];
  skills: string[];
  salesMotions: string[];
};

export type StructuredJobRequirements = {
  required: JobRequirementBucket;
  optional: JobRequirementBucket;
};

export type RequirementFitStatus = 'matched' | 'partial' | 'missing';

export type RequirementFitGroup = {
  key: keyof JobRequirementBucket;
  label: string;
  category: 'required' | 'optional';
  status: RequirementFitStatus;
  summary: string;
  matchedCount: number;
  totalCount: number;
  candidateValue: string;
  targetValue: string;
};

export type CandidateRequirementProfile = {
  currentRole?: string | null;
  targetRole?: string | null;
  desiredJobRoles?: string[] | null;
  desiredIndustries?: string[] | null;
  industriesExperience?: string[] | null;
  skills?: string[] | null;
  salesMotionExperience?: string | string[] | null;
  yearsOfExperience?: number | null;
};

export const EMPTY_JOB_REQUIREMENT_BUCKET: JobRequirementBucket = {
  yearsOfExperience: null,
  industries: [],
  previousRoles: [],
  skills: [],
  salesMotions: [],
};

export const EMPTY_STRUCTURED_JOB_REQUIREMENTS: StructuredJobRequirements = {
  required: { ...EMPTY_JOB_REQUIREMENT_BUCKET },
  optional: { ...EMPTY_JOB_REQUIREMENT_BUCKET },
};

const REQUIREMENT_GROUP_LABELS: Record<keyof JobRequirementBucket, string> = {
  yearsOfExperience: 'Sales-Erfahrung',
  industries: 'Branchen / Nischen',
  previousRoles: 'Bisherige Rollen',
  skills: 'Skills',
  salesMotions: 'Sales Motion',
};

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return uniqueStrings(value.filter((entry): entry is string => typeof entry === 'string'));
  }

  if (typeof value === 'string') {
    return uniqueStrings(value.split(',').map((entry) => entry.trim()));
  }

  return [];
}

function normalizeYearsOfExperience(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.round(value);
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.round(parsed);
    }
  }

  return null;
}

function normalizeBucket(value: unknown): JobRequirementBucket {
  if (!value || typeof value !== 'object') {
    return { ...EMPTY_JOB_REQUIREMENT_BUCKET };
  }

  const record = value as Record<string, unknown>;

  return {
    yearsOfExperience: normalizeYearsOfExperience(record.yearsOfExperience),
    industries: normalizeStringArray(record.industries),
    previousRoles: normalizeStringArray(record.previousRoles),
    skills: normalizeStringArray(record.skills),
    salesMotions: normalizeStringArray(record.salesMotions),
  };
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+&/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTokenSet(values: Array<string | null | undefined>) {
  const tokens = new Set<string>();

  for (const value of values) {
    if (!value) {
      continue;
    }

    const normalized = normalizeText(value);
    if (!normalized) {
      continue;
    }

    tokens.add(normalized);
    normalized.split(' ').filter(Boolean).forEach((token) => tokens.add(token));
  }

  return tokens;
}

function hasOverlap(left: Set<string>, right: Set<string>) {
  for (const token of left) {
    if (right.has(token)) {
      return true;
    }
  }

  return false;
}

function formatYears(years: number | null) {
  if (years == null) {
    return 'Nicht hinterlegt';
  }

  return `${years} ${years === 1 ? 'Jahr' : 'Jahre'}`;
}

function buildArraySummary(values: string[]) {
  if (values.length === 0) {
    return 'Nicht hinterlegt';
  }

  if (values.length <= 2) {
    return values.join(' · ');
  }

  return `${values.slice(0, 2).join(' · ')} +${values.length - 2}`;
}

export function normalizeStructuredJobRequirements(value: unknown): StructuredJobRequirements {
  if (!value || typeof value !== 'object') {
    return {
      required: { ...EMPTY_JOB_REQUIREMENT_BUCKET },
      optional: { ...EMPTY_JOB_REQUIREMENT_BUCKET },
    };
  }

  const record = value as Record<string, unknown>;

  return {
    required: normalizeBucket(record.required),
    optional: normalizeBucket(record.optional),
  };
}

export function hasStructuredJobRequirements(value: unknown) {
  const requirements = normalizeStructuredJobRequirements(value);
  const buckets = [requirements.required, requirements.optional];

  return buckets.some((bucket) => (
    bucket.yearsOfExperience != null
    || bucket.industries.length > 0
    || bucket.previousRoles.length > 0
    || bucket.skills.length > 0
    || bucket.salesMotions.length > 0
  ));
}

export function buildStructuredRequirementsText(value: unknown) {
  const requirements = normalizeStructuredJobRequirements(value);
  const lines: string[] = [];

  const pushBucket = (label: 'Erforderlich' | 'Optional', bucket: JobRequirementBucket) => {
    const parts: string[] = [];

    if (bucket.yearsOfExperience != null) {
      parts.push(`Sales-Erfahrung: mindestens ${formatYears(bucket.yearsOfExperience)}`);
    }

    if (bucket.previousRoles.length > 0) {
      parts.push(`Bisherige Rollen: ${bucket.previousRoles.join(', ')}`);
    }

    if (bucket.industries.length > 0) {
      parts.push(`Branchen / Nischen: ${bucket.industries.join(', ')}`);
    }

    if (bucket.skills.length > 0) {
      parts.push(`Skills: ${bucket.skills.join(', ')}`);
    }

    if (bucket.salesMotions.length > 0) {
      parts.push(`Sales Motion: ${bucket.salesMotions.join(', ')}`);
    }

    if (parts.length > 0) {
      lines.push(`${label}: ${parts.join(' | ')}`);
    }
  };

  pushBucket('Erforderlich', requirements.required);
  pushBucket('Optional', requirements.optional);

  return lines.join('\n');
}

export function buildStructuredRequirementTags(value: unknown) {
  const requirements = normalizeStructuredJobRequirements(value);

  return uniqueStrings([
    ...requirements.required.previousRoles,
    ...requirements.required.industries,
    ...requirements.required.skills,
    ...requirements.required.salesMotions,
    ...requirements.optional.previousRoles,
    ...requirements.optional.industries,
    ...requirements.optional.skills,
    ...requirements.optional.salesMotions,
  ]);
}

export function computeStructuredRequirementFit(
  profile: CandidateRequirementProfile | null | undefined,
  value: unknown,
): RequirementFitGroup[] {
  if (!profile) {
    return [];
  }

  const requirements = normalizeStructuredJobRequirements(value);
  const groups: RequirementFitGroup[] = [];

  const roleTokens = toTokenSet([
    profile.currentRole,
    profile.targetRole,
    ...normalizeStringArray(profile.desiredJobRoles),
  ]);
  const industryTokens = toTokenSet([
    ...normalizeStringArray(profile.industriesExperience),
    ...normalizeStringArray(profile.desiredIndustries),
  ]);
  const skillTokens = toTokenSet(normalizeStringArray(profile.skills));
  const motionTokens = toTokenSet(normalizeStringArray(profile.salesMotionExperience));

  const pushYearsGroup = (category: 'required' | 'optional', years: number | null) => {
    if (years == null) {
      return;
    }

    const candidateYears = normalizeYearsOfExperience(profile.yearsOfExperience);
    const matched = candidateYears != null && candidateYears >= years;

    groups.push({
      key: 'yearsOfExperience',
      label: REQUIREMENT_GROUP_LABELS.yearsOfExperience,
      category,
      status: matched ? 'matched' : 'missing',
      summary: `${category === 'required' ? 'Mindestens' : 'Idealerweise'} ${formatYears(years)}`,
      matchedCount: matched ? 1 : 0,
      totalCount: 1,
      candidateValue: candidateYears == null ? 'Nicht hinterlegt' : formatYears(candidateYears),
      targetValue: formatYears(years),
    });
  };

  const pushArrayGroup = (
    category: 'required' | 'optional',
    key: Exclude<keyof JobRequirementBucket, 'yearsOfExperience'>,
    values: string[],
    candidateTokens: Set<string>,
  ) => {
    if (values.length === 0) {
      return;
    }

    const matchedValues = values.filter((value) => hasOverlap(toTokenSet([value]), candidateTokens));
    const matchedCount = matchedValues.length;
    const status: RequirementFitStatus = matchedCount === 0
      ? 'missing'
      : matchedCount === values.length
        ? 'matched'
        : 'partial';

    groups.push({
      key,
      label: REQUIREMENT_GROUP_LABELS[key],
      category,
      status,
      summary: buildArraySummary(values),
      matchedCount,
      totalCount: values.length,
      candidateValue: matchedValues.length > 0 ? matchedValues.join(' · ') : 'Noch nicht abgedeckt',
      targetValue: values.join(' · '),
    });
  };

  pushYearsGroup('required', requirements.required.yearsOfExperience);
  pushArrayGroup('required', 'previousRoles', requirements.required.previousRoles, roleTokens);
  pushArrayGroup('required', 'industries', requirements.required.industries, industryTokens);
  pushArrayGroup('required', 'skills', requirements.required.skills, skillTokens);
  pushArrayGroup('required', 'salesMotions', requirements.required.salesMotions, motionTokens);

  pushYearsGroup('optional', requirements.optional.yearsOfExperience);
  pushArrayGroup('optional', 'previousRoles', requirements.optional.previousRoles, roleTokens);
  pushArrayGroup('optional', 'industries', requirements.optional.industries, industryTokens);
  pushArrayGroup('optional', 'skills', requirements.optional.skills, skillTokens);
  pushArrayGroup('optional', 'salesMotions', requirements.optional.salesMotions, motionTokens);

  return groups;
}
