type NullableDate = Date | string | null | undefined;

type CandidateProfileLike = {
  currentRole?: string | null;
  targetRole?: string | null;
  desiredJobRoles?: string[] | null;
  desiredIndustries?: string[] | null;
  seniority?: string | null;
  yearsOfExperience?: number | null;
  country?: string | null;
  remotePreference?: string[] | null;
  locationPreference?: string[] | null;
  skills?: string[] | null;
  industriesExperience?: string[] | null;
  salesMotionExperience?: string | string[] | null;
  averageDealSize?: number | null;
  averageSalesCycle?: number | null;
  salaryExpectationBase?: number | null;
  salaryExpectationOte?: number | null;
  expectedOte?: number | null;
  languages?: string[] | null;
};

type JobLike = {
  id?: string | null;
  title?: string | null;
  roleCategory?: string | null;
  seniority?: string | null;
  location?: string | null;
  country?: string | null;
  remoteType?: string | null;
  industry?: string | null;
  companyStage?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  oteMin?: number | null;
  oteMax?: number | null;
  salesMotion?: string | null;
  averageDealSize?: number | null;
  salesCycleLength?: number | null;
  quota?: string | null;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  tags?: string[] | null;
};

type ApplicationLike = {
  id: string;
  status: string;
  fitScore?: number | null;
  candidateMessage?: string | null;
  createdAt?: NullableDate;
  updatedAt?: NullableDate;
  forwardedAt?: NullableDate;
  job?: JobLike | null;
};

type JourneyStep = {
  key: string;
  label: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  date: string | null;
};

type JourneyResource = {
  title: string;
  detail: string;
  ready: boolean;
};

type CalendarSlot = {
  label: string;
  startsAt: string;
  endsAt: string;
  link: string;
};

type CalendarAction = {
  title: string;
  description: string;
  slots: CalendarSlot[];
};

const ACTIVE_STAGE_FLOW = [
  'interest_expressed',
  'screening',
  'shortlisted',
  'forwarded',
  'interview_1',
  'interview_2',
  'offer',
  'hired',
] as const;

const ACTIVE_STAGE_DETAILS: Record<string, { label: string; description: string; offsetDays: number }> = {
  interest_expressed: {
    label: 'Bewerbung eingegangen',
    description: 'Dein Profil ist im Recruiter-Review und wird mit den Kernanforderungen abgeglichen.',
    offsetDays: 0,
  },
  screening: {
    label: 'Recruiter Screening',
    description: 'Wir prüfen Track Record, Seniorität, Territory-Fit und Sales-Historie.',
    offsetDays: 2,
  },
  shortlisted: {
    label: 'Recruiter Call',
    description: 'Ein erstes Gespräch mit uns wird vorbereitet, damit wir deinen Background sauber briefen können.',
    offsetDays: 4,
  },
  forwarded: {
    label: 'Briefing mit Recruiter',
    description: 'Vor der Weiterleitung bekommst du ein Briefing zu Rolle, Team, Deal-Umfeld und Gesprächsstrategie.',
    offsetDays: 6,
  },
  interview_1: {
    label: 'Hiring Team Kennenlernen',
    description: 'Das erste Gespräch mit dem Hiring Team fokussiert Scope, Motivation und fachlichen Fit.',
    offsetDays: 9,
  },
  interview_2: {
    label: 'Finalrunde / Deep Dive',
    description: 'Hier geht es tiefer in Sales Cases, Forecasting, Territory Ownership und Stakeholder-Management.',
    offsetDays: 13,
  },
  offer: {
    label: 'Vertragsverhandlung',
    description: 'Compensation, Startdatum, Notice Period und finale Offer-Details werden abgestimmt.',
    offsetDays: 17,
  },
  hired: {
    label: 'Unterschrift & Start',
    description: 'Offer angenommen, Unterlagen unterschrieben und Start vorbereitet.',
    offsetDays: 24,
  },
};

const CLOSED_STAGE_DETAILS: Record<'rejected' | 'withdrawn', { label: string; description: string }> = {
  rejected: {
    label: 'Absage',
    description: 'Der Prozess wurde beendet. Du kannst die Rolle als Referenz für zukünftige Matches nutzen.',
  },
  withdrawn: {
    label: 'Zurückgezogen',
    description: 'Du bist nicht mehr im aktiven Prozess. Deine Unterlagen bleiben für spätere passende Rollen wertvoll.',
  },
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+&/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toArray(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((entry) => entry.trim()).filter(Boolean);
  }
  return [];
}

function toTokenSet(values: Array<string | null | undefined>) {
  const tokens = new Set<string>();

  for (const value of values) {
    if (!value) continue;
    const normalized = normalizeText(value);
    if (!normalized) continue;
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

function inferSeniorityFromYears(years?: number | null) {
  if (years == null) return null;
  if (years <= 1) return 'junior';
  if (years <= 3) return 'mid';
  if (years <= 6) return 'senior';
  if (years <= 8) return 'lead';
  if (years <= 10) return 'head';
  if (years <= 13) return 'director';
  if (years <= 16) return 'vp';
  return 'c-level';
}

function normalizeDate(value: NullableDate) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addDays(baseDate: Date, days: number) {
  const nextDate = new Date(baseDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function buildCalendarAction(status: string, applicationId: string, baseDate: Date): CalendarAction | null {
  if (!['shortlisted', 'forwarded', 'interview_1', 'interview_2'].includes(status)) {
    return null;
  }

  const slotOffsets = status === 'shortlisted'
    ? [2, 3, 4]
    : status === 'forwarded'
      ? [1, 2, 5]
      : status === 'interview_1'
        ? [3, 4, 6]
        : [2, 5, 7];

  return {
    title: 'Verfügbare Gesprächsslots',
    description: 'Mock-Availabilities für den nächsten Call. Du kannst später einen echten Kalender integrieren.',
    slots: slotOffsets.map((offset, index) => {
      const startsAt = addDays(baseDate, offset + index);
      startsAt.setUTCHours(8 + index * 2, 0, 0, 0);
      const endsAt = new Date(startsAt);
      endsAt.setUTCMinutes(45);
      return {
        label: `${startsAt.toISOString().slice(0, 16).replace('T', ' ')} Uhr`,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        link: `/dashboard/candidate/bewerbungen?slot=${applicationId}-${index + 1}`,
      };
    }),
  };
}

function buildResources(status: string, hasCandidateMessage: boolean): JourneyResource[] {
  if (status === 'offer') {
    return [
      { title: 'Vergütungserwartung', detail: 'Base, OTE, Bonus-Komponenten und Zielbandbreite abstimmen.', ready: true },
      { title: 'Kündigungsfrist', detail: 'Verfügbarkeitsfenster und gewünschtes Startdatum bereithalten.', ready: true },
      { title: 'Referenzen', detail: 'Optional zwei belastbare Referenzen griffbereit haben.', ready: false },
    ];
  }

  if (status === 'hired') {
    return [
      { title: 'Offer unterschrieben', detail: 'Vertragsstatus und finale Comp-Komponenten dokumentieren.', ready: true },
      { title: 'Start-Checkliste', detail: 'Onboarding, Equipment und erste 30 Tage planen.', ready: true },
      { title: 'Recruiter Handover', detail: 'Alle Übergaben an Hiring Team und Kandidat abgeschlossen.', ready: true },
    ];
  }

  if (status === 'rejected' || status === 'withdrawn') {
    return [
      { title: 'Feedback', detail: 'Falls vorhanden, Kernfeedback für zukünftige Prozesse notieren.', ready: true },
      { title: 'Profil optimieren', detail: 'Stärken und Gaps in zukünftige Matches zurückspielen.', ready: true },
    ];
  }

  return [
    { title: 'LinkedIn & Profil', detail: 'Aktuelle Rolle, Scope, KPIs und relevante Sales-Historie klar halten.', ready: true },
    { title: 'Success Stories', detail: '2-3 belastbare Deal-, Quota- oder Ramp-Stories bereithalten.', ready: true },
    { title: 'Nachricht an Recruiter', detail: hasCandidateMessage ? 'Nachricht liegt vor und kann im Briefing aufgegriffen werden.' : 'Optional zusätzliche Kontextnotiz ergänzen.', ready: hasCandidateMessage },
  ];
}

export function computeCandidateJobMatch(profile: CandidateProfileLike | null | undefined, job: JobLike | null | undefined) {
  if (!profile || !job) {
    return { score: 0, reasons: [] as string[] };
  }

  let score = 18;
  const reasons: string[] = [];

  const roleTokens = toTokenSet([
    profile.currentRole,
    profile.targetRole,
    ...toArray(profile.desiredJobRoles),
  ]);
  const jobRoleTokens = toTokenSet([job.roleCategory, job.title]);
  if (hasOverlap(roleTokens, jobRoleTokens)) {
    score += 28;
    reasons.push('Rolle passt zu deinem aktuellen oder angestrebten Profil.');
  }

  const candidateSeniority = profile.seniority || inferSeniorityFromYears(profile.yearsOfExperience);
  if (candidateSeniority && job.seniority && candidateSeniority === job.seniority) {
    score += 14;
    reasons.push('Seniorität ist eng am Rollenlevel.');
  }

  const preferredWorkModels = new Set([
    ...toArray(profile.remotePreference).map((entry) => normalizeText(entry)),
    ...toArray(profile.locationPreference).map((entry) => normalizeText(entry)),
  ]);
  const normalizedRemoteType = normalizeText(job.remoteType || '');
  if ((profile.country && job.country && profile.country === job.country) || normalizedRemoteType === 'remote') {
    score += 12;
    reasons.push('Standort bzw. Arbeitsmodell passt zu deinem Suchraum.');
  } else if (preferredWorkModels.has(normalizedRemoteType)) {
    score += 10;
    reasons.push('Arbeitsmodell ist mit deinen Präferenzen kompatibel.');
  }

  const industryTokens = toTokenSet([
    ...(profile.industriesExperience || []),
    ...(profile.desiredIndustries || []),
  ]);
  const jobIndustryTokens = toTokenSet([job.industry, ...(job.tags || [])]);
  if (hasOverlap(industryTokens, jobIndustryTokens)) {
    score += 10;
    reasons.push('Deine Branchenerfahrung passt zum Suchfeld des Unternehmens.');
  }

  const salesMotionTokens = toTokenSet(toArray(profile.salesMotionExperience));
  const jobMotionTokens = toTokenSet([job.salesMotion]);
  if (hasOverlap(salesMotionTokens, jobMotionTokens)) {
    score += 8;
    reasons.push('Sales Motion und Segment decken sich mit deinem Track Record.');
  }

  if (
    profile.averageDealSize != null &&
    job.averageDealSize != null &&
    Math.abs(profile.averageDealSize - job.averageDealSize) <= Math.max(25000, job.averageDealSize * 0.35)
  ) {
    score += 6;
    reasons.push('Dealgrößen liegen in einem ähnlichen Bereich.');
  }

  if (
    profile.averageSalesCycle != null &&
    job.salesCycleLength != null &&
    Math.abs(profile.averageSalesCycle - job.salesCycleLength) <= 30
  ) {
    score += 6;
    reasons.push('Sales Cycle ähnelt deinem bisherigen Umfeld.');
  }

  const expectedOte = profile.salaryExpectationOte ?? profile.expectedOte ?? null;
  if (expectedOte != null && job.oteMin != null && job.oteMax != null && expectedOte >= job.oteMin * 0.85 && expectedOte <= job.oteMax * 1.1) {
    score += 8;
    reasons.push('OTE-Band liegt in deiner Zielspanne.');
  }

  const skillTokens = toTokenSet([...(profile.skills || [])]);
  const jobSkillTokens = toTokenSet([...(job.tags || []), job.requirements, job.description]);
  if (hasOverlap(skillTokens, jobSkillTokens)) {
    score += 10;
    reasons.push('Mehrere Skills oder Themen überschneiden sich mit den Anforderungen.');
  }

  return {
    score: Math.max(12, Math.min(98, Math.round(score))),
    reasons: reasons.slice(0, 4),
  };
}

export function buildApplicationJourney(application: ApplicationLike, profile?: CandidateProfileLike | null) {
  const baseDate = normalizeDate(application.createdAt) || new Date();
  const lastUpdated = normalizeDate(application.updatedAt) || baseDate;
  const status = application.status;
  const match = computeCandidateJobMatch(profile, application.job || undefined);
  const fitScore = application.fitScore ?? match.score;

  let timeline: JourneyStep[];

  if (status === 'rejected' || status === 'withdrawn') {
    timeline = [
      {
        key: 'interest_expressed',
        label: ACTIVE_STAGE_DETAILS.interest_expressed.label,
        description: ACTIVE_STAGE_DETAILS.interest_expressed.description,
        status: 'completed',
        date: baseDate.toISOString(),
      },
      {
        key: 'screening',
        label: ACTIVE_STAGE_DETAILS.screening.label,
        description: ACTIVE_STAGE_DETAILS.screening.description,
        status: 'completed',
        date: addDays(baseDate, ACTIVE_STAGE_DETAILS.screening.offsetDays).toISOString(),
      },
      {
        key: status,
        label: CLOSED_STAGE_DETAILS[status].label,
        description: CLOSED_STAGE_DETAILS[status].description,
        status: 'current',
        date: lastUpdated.toISOString(),
      },
    ];
  } else {
    const activeIndex = ACTIVE_STAGE_FLOW.indexOf(status as (typeof ACTIVE_STAGE_FLOW)[number]);
    timeline = ACTIVE_STAGE_FLOW.map((stageKey, index) => {
      const detail = ACTIVE_STAGE_DETAILS[stageKey];
      return {
        key: stageKey,
        label: detail.label,
        description: detail.description,
        status: index < activeIndex ? 'completed' : index === activeIndex ? 'current' : 'upcoming',
        date: index <= activeIndex ? addDays(baseDate, detail.offsetDays).toISOString() : null,
      };
    });
  }

  const currentStep = timeline.find((step) => step.status === 'current') || timeline[0];
  const nextStep = timeline.find((step) => step.status === 'upcoming') || null;
  const calendarAction = buildCalendarAction(status, application.id, lastUpdated);

  return {
    fitScore,
    matchReasons: match.reasons,
    timeline,
    currentStepLabel: currentStep?.label || 'Bewerbung',
    nextStep: nextStep?.label || (status === 'hired' ? 'Onboarding vorbereiten' : status === 'offer' ? 'Offer finalisieren' : 'Feedback abwarten'),
    nextStepDate: nextStep?.date || null,
    overview:
      status === 'hired'
        ? 'Der Prozess ist erfolgreich abgeschlossen. Fokus liegt jetzt auf Start und sauberer Übergabe.'
        : status === 'offer'
          ? 'Du bist im Offer-Prozess. Jetzt zählen Klarheit bei Comp, Timing und Entscheidung.'
          : status === 'rejected'
            ? 'Der Prozess wurde beendet. Nutze Feedback und dein Profil für die nächsten passenden Rollen.'
            : status === 'withdrawn'
              ? 'Du hast den Prozess beendet. Deine Unterlagen bleiben für andere passende Jobs einsetzbar.'
              : 'Dein Prozess läuft aktiv weiter. Die Timeline zeigt dir den aktuellen Stand und die nächsten Schritte.',
    resources: buildResources(status, Boolean(application.candidateMessage)),
    calendarAction,
  };
}
