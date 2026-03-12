import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { extractTextFromPdf } from '@/lib/resume/pdf-parser';
import { MockResumeExtractionProvider } from '@/lib/resume/providers/mock';
import { normalizeExtractedResume } from '@/lib/resume/normalization';
import { mapResumeProfileToCandidateSeed } from '@/lib/resume/onboarding-mapping';
import { profileToFormData } from '@/components/resume/CandidateForm';

const provider = new MockResumeExtractionProvider();

async function runSamplePdfPipeline(fileName: string) {
  const filePath = path.join(process.cwd(), 'public', 'images', fileName);
  const buffer = new Uint8Array(fs.readFileSync(filePath));
  const text = await extractTextFromPdf(buffer);
  const extraction = await provider.extractResumeData({ text, requestId: fileName });
  const normalized = normalizeExtractedResume(extraction.raw);
  const onboardingSeed = mapResumeProfileToCandidateSeed(normalized.profile, {
    salaryExpectationBase: 60000,
    salaryExpectationOte: 100000,
  });
  const displayForm = profileToFormData(normalized.profile);

  return {
    text,
    raw: extraction.raw,
    profile: normalized.profile,
    warnings: normalized.warnings,
    onboardingSeed,
    displayForm,
  };
}

describe('sample sales CV PDFs', () => {
  it('extracts the first sample CV end-to-end into correct objects', async () => {
    const result = await runSamplePdfPipeline('sample_sales_cv.pdf');

    expect(result.text).toContain('Daniel Weber');
    expect(result.text).toContain('Nexora Software GmbH');
    expect(result.raw.vorname).toBe('Daniel');
    expect(result.raw.nachname).toBe('Weber');
    expect(result.raw.email).toBe('daniel.weber.sales@gmail.com');
    expect(result.raw.telefon).toBe('+49 176 48219374');
    expect(result.raw.linkedinUrl).toBe('https://linkedin.com/in/danielweber-sales');
    expect(result.raw.standort).toBe('München, Deutschland');
    expect(result.raw.aktuelleRolle).toBe('Account Executive');
    expect(result.raw.berufserfahrungJahre).toBe(9);
    expect(result.raw.skills).toEqual([
      'B2B SaaS Sales',
      'Outbound Prospecting',
      'Cold Calling',
      'LinkedIn Social Selling',
      'Pipeline Management',
      'MEDDIC / SPIN Selling',
      'HubSpot CRM',
      'Salesforce',
      'Negotiation',
      'Deal Closing',
    ]);
    expect(result.raw.sprachen).toEqual([
      { sprache: 'Deutsch', level: 'Muttersprache' },
      { sprache: 'Englisch', level: 'Verhandlungssicher' },
    ]);
    expect(result.raw.berufsstationen).toHaveLength(3);
    expect(result.raw.berufsstationen?.[0]).toMatchObject({
      title: 'Account Executive',
      company: 'Nexora Software GmbH',
      startDate: '2022',
      endDate: null,
      isCurrent: true,
    });
    expect(result.raw.ausbildungen).toEqual([
      {
        degree: 'B.A. Betriebswirtschaftslehre',
        institution: 'Hochschule München',
        startYear: '2014',
        endYear: '2017',
      },
    ]);

    expect(result.profile.vorname.value).toBe('Daniel');
    expect(result.profile.nachname.value).toBe('Weber');
    expect(result.profile.aktuelleRolle.value).toBe('Account Executive');
    expect(result.profile.seniority.value).toBe('senior');
    expect(result.profile.berufsstationen.value).toHaveLength(3);
    expect(result.profile.ausbildungen.value).toHaveLength(1);

    expect(result.onboardingSeed.firstName).toBe('Daniel');
    expect(result.onboardingSeed.lastName).toBe('Weber');
    expect(result.onboardingSeed.email).toBe('daniel.weber.sales@gmail.com');
    expect(result.onboardingSeed.currentRole).toBe('Account Executive');
    expect(result.onboardingSeed.yearsOfExperience).toBe(9);
    expect(result.onboardingSeed.skills).toHaveLength(10);
    expect(result.onboardingSeed.languageProficiencies).toEqual([
      { language: 'Deutsch', level: 'Muttersprache' },
      { language: 'Englisch', level: 'Verhandlungssicher' },
    ]);
    expect(result.onboardingSeed.workExperiences).toHaveLength(3);
    expect(result.onboardingSeed.educations).toHaveLength(1);

    expect(result.displayForm.aktuelleRolle).toBe('Account Executive');
    expect(result.displayForm.berufserfahrungJahre).toBe('9');
    expect(result.displayForm.standort).toBe('München, Deutschland');
    expect(result.displayForm.skills).toContain('MEDDIC / SPIN Selling');
    expect(result.displayForm.sprachen).toContain('Deutsch (Muttersprache)');
    expect(result.displayForm.sprachen).toContain('Englisch (Verhandlungssicher)');
  });

  it('extracts the second sample CV end-to-end into correct objects', async () => {
    const result = await runSamplePdfPipeline('sample_sales_cv_2.pdf');

    expect(result.text).toContain('Laura Schneider');
    expect(result.text).toContain('BrightFlow SaaS');
    expect(result.raw.vorname).toBe('Laura');
    expect(result.raw.nachname).toBe('Schneider');
    expect(result.raw.email).toBe('laura.schneider.business@gmail.com');
    expect(result.raw.telefon).toBe('+49 151 73920418');
    expect(result.raw.linkedinUrl).toBe('https://linkedin.com/in/lauraschneider-sales');
    expect(result.raw.standort).toBe('Frankfurt am Main, Deutschland');
    expect(result.raw.aktuelleRolle).toBe('Account Executive');
    expect(result.raw.berufserfahrungJahre).toBe(7);
    expect(result.raw.skills).toEqual([
      'B2B SaaS Vertrieb',
      'Cold Calling',
      'Outbound Prospecting',
      'Salesforce CRM',
      'HubSpot',
      'Pipeline Forecasting',
      'Negotiation',
      'Demo Präsentationen',
    ]);
    expect(result.raw.sprachen).toEqual([
      { sprache: 'Deutsch', level: 'Muttersprache' },
      { sprache: 'Englisch', level: 'Fließend' },
    ]);
    expect(result.raw.berufsstationen).toHaveLength(3);
    expect(result.raw.berufsstationen?.[0]).toMatchObject({
      title: 'Account Executive',
      company: 'BrightFlow SaaS',
      startDate: '2023',
      endDate: null,
      isCurrent: true,
    });
    expect(result.raw.ausbildungen).toEqual([
      {
        degree: 'B.A. International Business',
        institution: 'Hochschule Frankfurt',
        startYear: '2016',
        endYear: '2019',
      },
    ]);

    expect(result.profile.vorname.value).toBe('Laura');
    expect(result.profile.nachname.value).toBe('Schneider');
    expect(result.profile.aktuelleRolle.value).toBe('Account Executive');
    expect(result.profile.seniority.value).toBe('senior');
    expect(result.profile.berufsstationen.value).toHaveLength(3);
    expect(result.profile.ausbildungen.value).toHaveLength(1);

    expect(result.onboardingSeed.firstName).toBe('Laura');
    expect(result.onboardingSeed.lastName).toBe('Schneider');
    expect(result.onboardingSeed.email).toBe('laura.schneider.business@gmail.com');
    expect(result.onboardingSeed.currentRole).toBe('Account Executive');
    expect(result.onboardingSeed.yearsOfExperience).toBe(7);
    expect(result.onboardingSeed.skills).toHaveLength(8);
    expect(result.onboardingSeed.languageProficiencies).toEqual([
      { language: 'Deutsch', level: 'Muttersprache' },
      { language: 'Englisch', level: 'Fließend' },
    ]);
    expect(result.onboardingSeed.workExperiences).toHaveLength(3);
    expect(result.onboardingSeed.educations).toHaveLength(1);

    expect(result.displayForm.aktuelleRolle).toBe('Account Executive');
    expect(result.displayForm.berufserfahrungJahre).toBe('7');
    expect(result.displayForm.standort).toBe('Frankfurt am Main, Deutschland');
    expect(result.displayForm.skills).toContain('Pipeline Forecasting');
    expect(result.displayForm.sprachen).toContain('Deutsch (Muttersprache)');
    expect(result.displayForm.sprachen).toContain('Englisch (Fließend)');
  });
});
