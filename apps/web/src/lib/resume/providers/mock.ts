import type { ResumeExtractionProvider, ExtractResumeInput, ExtractResumeResult } from './types';
import type { ExtractedResumeRaw } from '../schemas';
import { resumeLogger } from '../logger';

const MOCK_EXTRACTION: ExtractedResumeRaw = {
  aktuelleRolle: 'Account Executive',
  zielrolle: null,
  seniority: 'senior',
  berufserfahrungJahre: 6,
  kuendigungsfrist: '3 Monate',
  skills: ['SaaS Sales', 'Enterprise Sales', 'MEDDIC', 'CRM', 'Salesforce', 'HubSpot', 'Solution Selling', 'Pipeline Management'],
  sprachen: [
    { sprache: 'Deutsch', level: 'Muttersprache' },
    { sprache: 'Englisch', level: 'Fließend' },
  ],
  gehaltBaseJahr: null,
  gehaltOTEJahr: null,
  berufsstationen: [
    {
      company: 'SaaS Solutions GmbH',
      title: 'Senior Account Executive',
      startDate: '2022-03',
      endDate: null,
      isCurrent: true,
      summary: 'Enterprise SaaS Sales im DACH-Raum, Quota >120% in 2023',
    },
    {
      company: 'TechStart AG',
      title: 'Account Executive',
      startDate: '2019-06',
      endDate: '2022-02',
      isCurrent: false,
      summary: 'Mid-Market SaaS Sales, Onboarding neuer Kunden',
    },
    {
      company: 'Digital Commerce GmbH',
      title: 'Sales Development Representative',
      startDate: '2017-09',
      endDate: '2019-05',
      isCurrent: false,
      summary: 'Outbound Prospecting und Lead Qualification',
    },
  ],
  standort: 'München',
  arbeitsmodellPraeferenz: 'hybrid',
  telefon: '+49 170 1234567',
  email: 'max.mustermann@example.com',
  linkedinUrl: 'https://linkedin.com/in/maxmustermann',
};

export class MockResumeExtractionProvider implements ResumeExtractionProvider {
  readonly name = 'mock';

  async extractResumeData(input: ExtractResumeInput): Promise<ExtractResumeResult> {
    const start = Date.now();

    resumeLogger.info(input.requestId, 'mock_extraction_start', { provider: this.name });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

    // If text contains certain keywords, adapt the mock slightly
    const hasEnglishContent = /experience|work|education/i.test(input.text);
    const mock = { ...MOCK_EXTRACTION };

    if (hasEnglishContent) {
      mock.sprachen = [
        { sprache: 'Englisch', level: 'Muttersprache' },
        { sprache: 'Deutsch', level: 'Fließend' },
      ];
    }

    const durationMs = Date.now() - start;
    resumeLogger.info(input.requestId, 'mock_extraction_complete', {
      provider: this.name,
      durationMs,
      success: true,
    });

    return {
      raw: mock,
      providerName: this.name,
      durationMs,
    };
  }
}
