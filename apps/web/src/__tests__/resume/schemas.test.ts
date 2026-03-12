import { describe, it, expect } from 'vitest';
import { ExtractedResumeRawSchema, NormalizedCandidateProfileSchema } from '@/lib/resume/schemas';

describe('ExtractedResumeRawSchema', () => {
  it('validates a complete raw extraction', () => {
    const valid = {
      aktuelleRolle: 'Account Executive',
      zielrolle: null,
      seniority: 'senior',
      berufserfahrungJahre: 6,
      kuendigungsfrist: '3 Monate',
      skills: ['SaaS Sales', 'CRM'],
      sprachen: [{ sprache: 'Deutsch', level: 'Muttersprache' }],
      gehaltBaseJahr: null,
      gehaltOTEJahr: null,
      berufsstationen: [{
        company: 'Test GmbH',
        title: 'AE',
        startDate: '2020-01',
        endDate: null,
        isCurrent: true,
        summary: null,
      }],
      standort: 'Berlin',
      arbeitsmodellPraeferenz: 'remote',
      telefon: null,
      email: 'test@example.com',
      linkedinUrl: null,
    };

    const result = ExtractedResumeRawSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('applies defaults for missing optional fields', () => {
    const minimal = {};
    const result = ExtractedResumeRawSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual([]);
      expect(result.data.sprachen).toEqual([]);
      expect(result.data.berufsstationen).toEqual([]);
      expect(result.data.aktuelleRolle).toBeNull();
    }
  });

  it('rejects invalid seniority values', () => {
    const invalid = { seniority: 'supersenior' };
    const result = ExtractedResumeRawSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid work model values', () => {
    const invalid = { arbeitsmodellPraeferenz: 'mars' };
    const result = ExtractedResumeRawSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('NormalizedCandidateProfileSchema', () => {
  it('validates a normalized profile with confidence', () => {
    const valid = {
      vorname: { value: 'Anna', confidence: 'high' },
      nachname: { value: 'Schmidt', confidence: 'high' },
      aktuelleRolle: { value: 'Account Executive', confidence: 'high' },
      zielrolle: { value: null },
      seniority: { value: 'senior', confidence: 'medium' },
      berufserfahrungJahre: { value: 6, confidence: 'high' },
      kuendigungsfrist: { value: '3 Monate', confidence: 'medium' },
      skills: { value: ['SaaS', 'CRM'], confidence: 'high' },
      sprachen: { value: [{ sprache: 'Deutsch', level: 'Muttersprache' }], confidence: 'high' },
      gehaltBaseJahr: { value: null },
      gehaltOTEJahr: { value: null },
      berufsstationen: { value: [], confidence: 'high' },
      ausbildungen: { value: [], confidence: 'high' },
      standort: { value: 'Berlin', confidence: 'high' },
      arbeitsmodellPraeferenz: { value: 'remote', confidence: 'medium' },
      telefon: { value: null },
      email: { value: 'test@example.com', confidence: 'high' },
      linkedinUrl: { value: null },
    };

    const result = NormalizedCandidateProfileSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
