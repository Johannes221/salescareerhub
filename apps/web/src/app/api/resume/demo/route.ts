import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { normalizeExtractedResume } from '@/lib/resume/normalization';
import { MockResumeExtractionProvider } from '@/lib/resume/providers/mock';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEMO_CV_TEXT = `
Max Mustermann
Senior Account Executive | SaaS Solutions GmbH
München, Deutschland
max.mustermann@example.com | +49 170 1234567
LinkedIn: linkedin.com/in/maxmustermann

BERUFSERFAHRUNG:

Senior Account Executive - SaaS Solutions GmbH (03/2022 - heute)
Enterprise SaaS Sales im DACH-Raum. Quota-Erreichung >120% in 2023.

Account Executive - TechStart AG (06/2019 - 02/2022)
Mid-Market SaaS Sales, Neukundenakquise und Bestandskundenentwicklung.

Sales Development Representative - Digital Commerce GmbH (09/2017 - 05/2019)
Outbound Prospecting, Lead Qualification, Pipeline-Aufbau.

SKILLS: SaaS Sales, Enterprise Sales, MEDDIC, CRM, Salesforce, HubSpot, Solution Selling

SPRACHEN: Deutsch (Muttersprache), Englisch (Fließend)

Kündigungsfrist: 3 Monate zum Quartalsende
`;

export async function POST() {
  const requestId = randomUUID();
  const start = Date.now();

  const provider = new MockResumeExtractionProvider();
  const result = await provider.extractResumeData({ text: DEMO_CV_TEXT, requestId });
  const { profile, warnings } = normalizeExtractedResume(result.raw);

  return NextResponse.json({
    success: true,
    requestId,
    extracted: profile,
    meta: {
      provider: 'mock-demo',
      processingMs: Date.now() - start,
      rawTextLength: DEMO_CV_TEXT.length,
      warnings,
    },
  });
}
