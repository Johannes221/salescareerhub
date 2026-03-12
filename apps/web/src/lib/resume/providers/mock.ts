import type { ResumeExtractionProvider, ExtractResumeInput, ExtractResumeResult } from './types';
import type { ExtractedResumeRaw } from '../schemas';
import { resumeLogger } from '../logger';

const MOCK_EXTRACTION: ExtractedResumeRaw = {
  vorname: 'Max',
  nachname: 'Mustermann',
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
  ausbildungen: [
    {
      degree: 'B.A. Betriebswirtschaft',
      institution: 'Hochschule München',
      startYear: '2014',
      endYear: '2017',
    },
  ],
  standort: 'München',
  arbeitsmodellPraeferenz: 'hybrid',
  telefon: '+49 170 1234567',
  email: 'max.mustermann@example.com',
  linkedinUrl: 'https://linkedin.com/in/maxmustermann',
};

function normalizeWhitespace(text: string): string {
  return text.replace(/\u0000/g, ' ').replace(/\s+/g, ' ').trim();
}

function deepCloneExtraction(value: ExtractedResumeRaw): ExtractedResumeRaw {
  return JSON.parse(JSON.stringify(value)) as ExtractedResumeRaw;
}

function extractName(text: string): { vorname: string | null; nachname: string | null } {
  const match = text.match(/^(.+?)\s+E-Mail:/i);
  const fullName = match?.[1]?.trim() || '';
  const parts = fullName.split(/\s+/).filter(Boolean);

  return {
    vorname: parts[0] || null,
    nachname: parts.length > 1 ? parts.slice(1).join(' ') : null,
  };
}

function extractEmail(text: string): string | null {
  return text.match(/E-Mail:\s*([^|]+?)\s*(?:\||Telefon:|$)/i)?.[1]?.trim() || null;
}

function extractPhone(text: string): string | null {
  return text.match(/Telefon:\s*([^|]+?)\s*(?:\||LinkedIn:|$)/i)?.[1]?.trim() || null;
}

function extractLinkedinUrl(text: string): string | null {
  const value = text.match(/LinkedIn:\s*([^\s]+)\s+Wohnort:/i)?.[1]?.trim() || null;

  if (!value) {
    return null;
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function extractLocation(text: string): string | null {
  return text.match(/Wohnort:\s*(.+?)\s+Profil\b/i)?.[1]?.trim() || null;
}

function extractSkills(text: string): string[] {
  const skillsSection = text.match(/\bSkills\b\s*(.+?)\s+\bSprachen\b/i)?.[1]?.trim() || '';

  return skillsSection
    .split('•')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function extractLanguages(text: string): NonNullable<ExtractedResumeRaw['sprachen']> {
  const languageSection = text.match(/\bSprachen\b\s*(.+)$/i)?.[1]?.trim() || '';

  return languageSection
    .split('•')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.*?)\s*[–-]\s*(.+)$/);
      return {
        sprache: match?.[1]?.trim() || entry,
        level: match?.[2]?.trim() || null,
      };
    });
}

function extractWorkExperiences(text: string): NonNullable<ExtractedResumeRaw['berufsstationen']> {
  const experienceSection = text.match(/\bBerufserfahrung\b\s*(.+?)\s+\bAusbildung\b/i)?.[1]?.trim() || '';
  const pattern = /(\d{4})\s*[–-]\s*(Heute|\d{4})\s*([^,•]+),\s*([^•]+?)\s*•\s*(.+?)(?=(?:\d{4}\s*[–-]\s*(?:Heute|\d{4})\s*[^,•]+,\s*[^•]+?\s*•)|$)/g;
  const stations: NonNullable<ExtractedResumeRaw['berufsstationen']> = [];

  for (const match of experienceSection.matchAll(pattern)) {
    const [, startYear, endYearLabel, title, company, summaryBlock] = match;
    const summary = summaryBlock
      .split('•')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .join('; ');

    stations.push({
      company: company.trim(),
      title: title.trim(),
      startDate: startYear.trim(),
      endDate: endYearLabel === 'Heute' ? null : endYearLabel.trim(),
      isCurrent: endYearLabel === 'Heute',
      summary: summary || null,
    });
  }

  return stations;
}

function extractEducation(text: string): NonNullable<ExtractedResumeRaw['ausbildungen']> {
  const educationSection = text.match(/\bAusbildung\b\s*(.+?)\s+\bSkills\b/i)?.[1]?.trim() || '';
  const pattern = /(\d{4})\s*[–-]\s*(\d{4})\s*([^•]+?)\s*[–-]\s*([^•]+?)(?=$|\s{2,}| Skills\b)/g;
  const educations: NonNullable<ExtractedResumeRaw['ausbildungen']> = [];

  for (const match of educationSection.matchAll(pattern)) {
    const [, startYear, endYear, degree, institution] = match;
    educations.push({
      degree: degree.trim(),
      institution: institution.trim(),
      startYear: startYear.trim(),
      endYear: endYear.trim(),
    });
  }

  return educations;
}

function computeYearsOfExperience(stations: NonNullable<ExtractedResumeRaw['berufsstationen']>): number | null {
  const years = stations
    .flatMap((station) => {
      const start = station.startDate ? parseInt(station.startDate.slice(0, 4), 10) : NaN;
      const end = station.isCurrent
        ? new Date().getFullYear()
        : station.endDate
          ? parseInt(station.endDate.slice(0, 4), 10)
          : NaN;

      return Number.isFinite(start) && Number.isFinite(end) ? [[start, end] as const] : [];
    });

  if (years.length === 0) {
    return null;
  }

  const earliestStart = Math.min(...years.map(([start]) => start));
  const latestEnd = Math.max(...years.map(([, end]) => end));

  return Math.max(0, latestEnd - earliestStart);
}

function inferSeniority(currentRole: string | null, years: number | null): ExtractedResumeRaw['seniority'] {
  const role = currentRole?.toLowerCase() || '';

  if (role.includes('chief') || role.includes('cro')) return 'c_level';
  if (role.includes('vp')) return 'vp';
  if (role.includes('director')) return 'director';
  if (role.includes('head') || role.includes('manager')) return 'manager';
  if (role.includes('lead')) return 'lead';
  if (role.includes('junior')) return 'junior';

  if (years === null) {
    return null;
  }

  if (years < 2) return 'junior';
  if (years < 5) return 'mid';
  if (years < 10) return 'senior';
  return 'lead';
}

function parseStructuredResumeText(text: string): ExtractedResumeRaw | null {
  const normalizedText = normalizeWhitespace(text);

  if (!normalizedText.includes('Berufserfahrung') || !normalizedText.includes('Skills') || !normalizedText.includes('Sprachen')) {
    return null;
  }

  const { vorname, nachname } = extractName(normalizedText);
  const berufsstationen = extractWorkExperiences(normalizedText);
  const ausbildungen = extractEducation(normalizedText);
  const aktuelleRolle = berufsstationen[0]?.title || null;
  const berufserfahrungJahre = computeYearsOfExperience(berufsstationen);

  if (!vorname || !nachname || !aktuelleRolle || berufsstationen.length === 0) {
    return null;
  }

  return {
    vorname,
    nachname,
    aktuelleRolle,
    zielrolle: null,
    seniority: inferSeniority(aktuelleRolle, berufserfahrungJahre),
    berufserfahrungJahre,
    kuendigungsfrist: null,
    skills: extractSkills(normalizedText),
    sprachen: extractLanguages(normalizedText),
    gehaltBaseJahr: null,
    gehaltOTEJahr: null,
    berufsstationen,
    ausbildungen,
    standort: extractLocation(normalizedText),
    arbeitsmodellPraeferenz: null,
    telefon: extractPhone(normalizedText),
    email: extractEmail(normalizedText),
    linkedinUrl: extractLinkedinUrl(normalizedText),
  };
}

export class MockResumeExtractionProvider implements ResumeExtractionProvider {
  readonly name = 'mock';

  async extractResumeData(input: ExtractResumeInput): Promise<ExtractResumeResult> {
    const start = Date.now();

    resumeLogger.info(input.requestId, 'mock_extraction_start', { provider: this.name });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

    // If text contains certain keywords, adapt the mock slightly
    const hasEnglishContent = /experience|work|education/i.test(input.text);
    const mock = parseStructuredResumeText(input.text) || deepCloneExtraction(MOCK_EXTRACTION);

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
