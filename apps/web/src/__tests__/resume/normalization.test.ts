import { describe, it, expect } from 'vitest';
import {
  normalizeRoleTitle,
  inferSeniorityFromTitle,
  inferSeniorityFromYears,
  parseNoticePeriod,
  normalizeLanguages,
  dedupeSkills,
  computeExperienceYearsFromRoles,
  normalizeCompensation,
  normalizeWorkModel,
  normalizeExtractedResume,
} from '@/lib/resume/normalization';
import type { ResumeStation, LanguageEntry, ExtractedResumeRaw } from '@/lib/resume/schemas';

describe('normalizeRoleTitle', () => {
  it('normalizes known abbreviations', () => {
    expect(normalizeRoleTitle('AE')).toBe('Account Executive');
    expect(normalizeRoleTitle('sdr')).toBe('Sales Development Representative');
    expect(normalizeRoleTitle('BDR')).toBe('Business Development Representative');
    expect(normalizeRoleTitle('CSM')).toBe('Customer Success Manager');
    expect(normalizeRoleTitle('KAM')).toBe('Key Account Manager');
  });

  it('returns original if no mapping', () => {
    expect(normalizeRoleTitle('Data Scientist')).toBe('Data Scientist');
  });

  it('returns null for empty input', () => {
    expect(normalizeRoleTitle(null)).toBeNull();
    expect(normalizeRoleTitle('')).toBeNull();
    expect(normalizeRoleTitle(undefined)).toBeNull();
  });
});

describe('inferSeniorityFromTitle', () => {
  it('infers from title keywords', () => {
    expect(inferSeniorityFromTitle('Senior Account Executive')).toBe('senior');
    expect(inferSeniorityFromTitle('Junior Sales Rep')).toBe('junior');
    expect(inferSeniorityFromTitle('VP of Sales')).toBe('vp');
    expect(inferSeniorityFromTitle('CRO')).toBe('c_level');
    expect(inferSeniorityFromTitle('Team Lead Sales')).toBe('lead');
    expect(inferSeniorityFromTitle('Sales Director')).toBe('director');
  });

  it('returns null for unrecognizable titles', () => {
    expect(inferSeniorityFromTitle('Account Executive')).toBeNull();
    expect(inferSeniorityFromTitle(null)).toBeNull();
  });
});

describe('inferSeniorityFromYears', () => {
  it('maps years to seniority', () => {
    expect(inferSeniorityFromYears(1)).toBe('junior');
    expect(inferSeniorityFromYears(3)).toBe('mid');
    expect(inferSeniorityFromYears(6)).toBe('senior');
    expect(inferSeniorityFromYears(10)).toBe('lead');
    expect(inferSeniorityFromYears(14)).toBe('manager');
    expect(inferSeniorityFromYears(18)).toBe('director');
    expect(inferSeniorityFromYears(25)).toBe('vp');
  });

  it('returns null for null/undefined', () => {
    expect(inferSeniorityFromYears(null)).toBeNull();
    expect(inferSeniorityFromYears(undefined)).toBeNull();
  });
});

describe('parseNoticePeriod', () => {
  it('normalizes common patterns', () => {
    expect(parseNoticePeriod('ab sofort')).toBe('Sofort verfügbar');
    expect(parseNoticePeriod('immediately')).toBe('Sofort verfügbar');
    expect(parseNoticePeriod('3 Monate')).toBe('3 Monate Kündigungsfrist');
    expect(parseNoticePeriod('3 months')).toBe('3 Monate Kündigungsfrist');
  });

  it('returns null for empty input', () => {
    expect(parseNoticePeriod(null)).toBeNull();
    expect(parseNoticePeriod('')).toBeNull();
  });

  it('returns raw string if no pattern matches', () => {
    expect(parseNoticePeriod('Nach Vereinbarung')).toBe('Nach Vereinbarung');
  });
});

describe('normalizeLanguages', () => {
  it('normalizes language names and levels', () => {
    const input: LanguageEntry[] = [
      { sprache: 'german', level: 'native' },
      { sprache: 'english', level: 'fluent' },
    ];
    const result = normalizeLanguages(input);
    expect(result).toEqual([
      { sprache: 'Deutsch', level: 'Muttersprache' },
      { sprache: 'Englisch', level: 'Fließend' },
    ]);
  });

  it('deduplicates languages', () => {
    const input: LanguageEntry[] = [
      { sprache: 'Deutsch', level: 'Muttersprache' },
      { sprache: 'deutsch', level: 'C2' },
    ];
    const result = normalizeLanguages(input);
    expect(result).toHaveLength(1);
    expect(result[0].sprache).toBe('Deutsch');
  });

  it('handles unknown languages gracefully', () => {
    const input: LanguageEntry[] = [{ sprache: 'Swahili', level: null }];
    const result = normalizeLanguages(input);
    expect(result).toEqual([{ sprache: 'Swahili', level: null }]);
  });
});

describe('dedupeSkills', () => {
  it('removes duplicates case-insensitively', () => {
    const result = dedupeSkills(['SaaS Sales', 'saas sales', 'CRM', 'crm', 'Salesforce']);
    expect(result).toEqual(['SaaS Sales', 'CRM', 'Salesforce']);
  });

  it('removes empty strings', () => {
    const result = dedupeSkills(['', 'CRM', '  ', 'Sales']);
    expect(result).toEqual(['CRM', 'Sales']);
  });

  it('handles empty array', () => {
    expect(dedupeSkills([])).toEqual([]);
  });
});

describe('computeExperienceYearsFromRoles', () => {
  it('computes from valid stations', () => {
    const stations: ResumeStation[] = [
      { company: 'A', title: 'AE', startDate: '2020-01', endDate: '2023-01', isCurrent: false, summary: null },
      { company: 'B', title: 'SDR', startDate: '2018-01', endDate: '2019-12', isCurrent: false, summary: null },
    ];
    const result = computeExperienceYearsFromRoles(stations);
    expect(result).not.toBeNull();
    expect(result!.years).toBe(5);
    expect(result!.isEstimate).toBe(false);
  });

  it('handles current position without endDate', () => {
    const stations: ResumeStation[] = [
      { company: 'A', title: 'AE', startDate: '2020-01', endDate: null, isCurrent: true, summary: null },
    ];
    const result = computeExperienceYearsFromRoles(stations);
    expect(result).not.toBeNull();
    expect(result!.years).toBeGreaterThan(0);
  });

  it('returns null for empty stations', () => {
    expect(computeExperienceYearsFromRoles([])).toBeNull();
  });

  it('returns null for stations without dates', () => {
    const stations: ResumeStation[] = [
      { company: 'A', title: 'AE', startDate: null, endDate: null, isCurrent: false, summary: null },
    ];
    expect(computeExperienceYearsFromRoles(stations)).toBeNull();
  });

  it('flags estimate when some stations lack dates', () => {
    const stations: ResumeStation[] = [
      { company: 'A', title: 'AE', startDate: '2020-01', endDate: '2023-01', isCurrent: false, summary: null },
      { company: 'B', title: 'SDR', startDate: null, endDate: null, isCurrent: false, summary: null },
    ];
    const result = computeExperienceYearsFromRoles(stations);
    expect(result!.isEstimate).toBe(true);
  });
});

describe('normalizeCompensation', () => {
  it('returns yearly salary as-is if in range', () => {
    expect(normalizeCompensation(60000)).toBe(60000);
    expect(normalizeCompensation(120000)).toBe(120000);
  });

  it('converts monthly to yearly', () => {
    expect(normalizeCompensation(5000)).toBe(60000);
    expect(normalizeCompensation(10000)).toBe(120000);
  });

  it('returns null for invalid values', () => {
    expect(normalizeCompensation(null)).toBeNull();
    expect(normalizeCompensation(undefined)).toBeNull();
    expect(normalizeCompensation(-1000)).toBeNull();
    expect(normalizeCompensation(NaN)).toBeNull();
  });

  it('returns null for unreasonable values', () => {
    expect(normalizeCompensation(600000)).toBeNull();
    expect(normalizeCompensation(100)).toBeNull();
  });
});

describe('normalizeWorkModel', () => {
  it('normalizes known patterns', () => {
    expect(normalizeWorkModel('remote')).toBe('remote');
    expect(normalizeWorkModel('Home Office')).toBe('remote');
    expect(normalizeWorkModel('hybrid')).toBe('hybrid');
    expect(normalizeWorkModel('vor Ort')).toBe('onsite');
    expect(normalizeWorkModel('office')).toBe('onsite');
  });

  it('returns null for unknown/empty', () => {
    expect(normalizeWorkModel(null)).toBeNull();
    expect(normalizeWorkModel('')).toBeNull();
    expect(normalizeWorkModel('something weird')).toBeNull();
  });
});

describe('normalizeExtractedResume', () => {
  it('normalizes a full raw extraction', () => {
    const raw: ExtractedResumeRaw = {
      vorname: 'Test',
      nachname: 'User',
      aktuelleRolle: 'AE',
      zielrolle: null,
      seniority: 'senior',
      berufserfahrungJahre: 6,
      kuendigungsfrist: '3 months',
      skills: ['SaaS Sales', 'saas sales', 'CRM'],
      sprachen: [
        { sprache: 'german', level: 'native' },
        { sprache: 'english', level: 'fluent' },
      ],
      gehaltBaseJahr: null,
      gehaltOTEJahr: null,
      berufsstationen: [
        { company: 'Test GmbH', title: 'AE', startDate: '2020-01', endDate: null, isCurrent: true, summary: null },
      ],
      ausbildungen: [],
      standort: 'Berlin',
      arbeitsmodellPraeferenz: 'remote',
      telefon: '+49 170 1234567',
      email: 'test@example.com',
      linkedinUrl: null,
    };

    const { profile, warnings } = normalizeExtractedResume(raw);

    expect(profile.aktuelleRolle.value).toBe('Account Executive');
    expect(profile.seniority.value).toBe('senior');
    expect(profile.berufserfahrungJahre.value).toBe(6);
    expect(profile.kuendigungsfrist.value).toContain('Monate');
    expect(profile.skills.value).toEqual(['SaaS Sales', 'CRM']);
    expect(profile.sprachen.value[0].sprache).toBe('Deutsch');
    expect(profile.standort.value).toBe('Berlin');
    expect(profile.telefon.value).toBe('+49 170 1234567');
    expect(profile.email.value).toBe('test@example.com');
    expect(warnings).toContain('Zielrolle konnte nicht sicher erkannt werden.');
  });

  it('derives seniority from title when not provided', () => {
    const raw: ExtractedResumeRaw = {
      vorname: null,
      nachname: null,
      aktuelleRolle: 'Senior Account Executive',
      zielrolle: null,
      seniority: null,
      berufserfahrungJahre: null,
      kuendigungsfrist: null,
      skills: [],
      sprachen: [],
      gehaltBaseJahr: null,
      gehaltOTEJahr: null,
      berufsstationen: [],
      ausbildungen: [],
      standort: null,
      arbeitsmodellPraeferenz: null,
      telefon: null,
      email: null,
      linkedinUrl: null,
    };

    const { profile } = normalizeExtractedResume(raw);
    expect(profile.seniority.value).toBe('senior');
    expect(profile.seniority.confidence).toBe('medium');
  });
});
