import { describe, it, expect } from 'vitest';
import { mapResumeProfileToCandidateSeed } from '@/lib/resume/onboarding-mapping';
import type { NormalizedCandidateProfile } from '@/lib/resume/schemas';

function buildProfile(overrides: Partial<NormalizedCandidateProfile> = {}): NormalizedCandidateProfile {
  return {
    vorname: { value: 'Anna', confidence: 'high' },
    nachname: { value: 'Schmidt', confidence: 'high' },
    aktuelleRolle: { value: 'Account Executive', confidence: 'high' },
    zielrolle: { value: 'Head of Sales', confidence: 'medium' },
    seniority: { value: 'senior', confidence: 'medium' },
    berufserfahrungJahre: { value: 7, confidence: 'high' },
    kuendigungsfrist: { value: '3 Monate Kündigungsfrist', confidence: 'medium' },
    skills: { value: ['Enterprise Sales', 'MEDDIC', 'Salesforce'], confidence: 'high' },
    sprachen: {
      value: [
        { sprache: 'Deutsch', level: 'Muttersprache' },
        { sprache: 'Englisch', level: 'Verhandlungssicher' },
      ],
      confidence: 'high',
    },
    gehaltBaseJahr: { value: 90000, confidence: 'medium' },
    gehaltOTEJahr: { value: 160000, confidence: 'medium' },
    berufsstationen: {
      value: [
        {
          company: 'Alpha GmbH',
          title: 'Senior Account Executive',
          startDate: '2022-01',
          endDate: null,
          isCurrent: true,
          summary: 'Enterprise SaaS Vertrieb',
        },
      ],
      confidence: 'high',
    },
    ausbildungen: {
      value: [
        {
          degree: 'B.Sc. Betriebswirtschaft',
          institution: 'LMU München',
          startYear: '2014',
          endYear: '2017',
        },
      ],
      confidence: 'high',
    },
    standort: { value: 'München', confidence: 'high' },
    arbeitsmodellPraeferenz: { value: 'hybrid', confidence: 'medium' },
    telefon: { value: '+49 170 1234567', confidence: 'high' },
    email: { value: 'anna.schmidt@example.com', confidence: 'high' },
    linkedinUrl: { value: 'https://linkedin.com/in/anna-schmidt', confidence: 'high' },
    ...overrides,
  };
}

describe('mapResumeProfileToCandidateSeed', () => {
  it('maps a normalized resume into full onboarding objects', () => {
    const profile = buildProfile();
    let nextId = 1;

    const result = mapResumeProfileToCandidateSeed(
      profile,
      {
        languageProficiencies: [{ language: 'Deutsch', level: 'Muttersprachliches Niveau' }],
        salaryExpectationBase: 60000,
        salaryExpectationOte: 100000,
      },
      () => `id-${nextId++}`,
    );

    expect(result.firstName).toBe('Anna');
    expect(result.lastName).toBe('Schmidt');
    expect(result.email).toBe('anna.schmidt@example.com');
    expect(result.phone).toBe('+49 170 1234567');
    expect(result.linkedinUrl).toBe('https://linkedin.com/in/anna-schmidt');
    expect(result.location).toBe('München');
    expect(result.remotePreference).toEqual(['hybrid']);
    expect(result.currentRole).toBe('Account Executive');
    expect(result.targetRole).toBe('Head of Sales');
    expect(result.desiredJobRoles).toEqual(['Head of Sales']);
    expect(result.yearsOfExperience).toBe(7);
    expect(result.seniority).toBe('senior');
    expect(result.skills).toEqual(['Enterprise Sales', 'MEDDIC', 'Salesforce']);
    expect(result.languages).toEqual(['Deutsch', 'Englisch']);
    expect(result.languageProficiencies).toEqual([
      { language: 'Deutsch', level: 'Muttersprache' },
      { language: 'Englisch', level: 'Verhandlungssicher' },
    ]);
    expect(result.workExperiences).toEqual([
      {
        id: 'id-1',
        title: 'Senior Account Executive',
        company: 'Alpha GmbH',
        startDate: '2022-01',
        endDate: '',
        isCurrent: true,
        summary: 'Enterprise SaaS Vertrieb',
      },
    ]);
    expect(result.educations).toEqual([
      {
        id: 'id-2',
        degree: 'B.Sc. Betriebswirtschaft',
        institution: 'LMU München',
        startYear: '2014',
        endYear: '2017',
      },
    ]);
    expect(result.salaryExpectationBase).toBe(90000);
    expect(result.salaryExpectationOte).toBe(160000);
    expect(result.noticePeriod).toBe('3 Monate Kündigungsfrist');
    expect(result.onboardingSource).toBe('cv');
  });

  it('uses contact-based name inference and fallback values when fields are missing', () => {
    const profile = buildProfile({
      vorname: { value: null },
      nachname: { value: null },
      zielrolle: { value: null },
      arbeitsmodellPraeferenz: { value: null },
      sprachen: { value: [] },
      gehaltBaseJahr: { value: null },
      gehaltOTEJahr: { value: null },
      email: { value: 'max.mustermann@example.com', confidence: 'high' },
      linkedinUrl: { value: 'https://linkedin.com/in/max-mustermann', confidence: 'high' },
    });

    const result = mapResumeProfileToCandidateSeed(profile, {
      languageProficiencies: [{ language: 'Deutsch', level: 'Muttersprachliches Niveau' }],
      salaryExpectationBase: 65000,
      salaryExpectationOte: 110000,
    });

    expect(result.firstName).toBe('Max');
    expect(result.lastName).toBe('Mustermann');
    expect(result.remotePreference).toEqual([]);
    expect(result.targetRole).toBe('');
    expect(result.desiredJobRoles).toEqual([]);
    expect(result.languageProficiencies).toEqual([{ language: 'Deutsch', level: 'Muttersprachliches Niveau' }]);
    expect(result.salaryExpectationBase).toBe(65000);
    expect(result.salaryExpectationOte).toBe(110000);
  });
});
