import { describe, it, expect } from 'vitest';
import { MockResumeExtractionProvider } from '@/lib/resume/providers/mock';
import { ExtractedResumeRawSchema } from '@/lib/resume/schemas';

describe('MockResumeExtractionProvider', () => {
  const provider = new MockResumeExtractionProvider();

  it('has name "mock"', () => {
    expect(provider.name).toBe('mock');
  });

  it('returns valid schema-conforming data', async () => {
    const result = await provider.extractResumeData({
      text: 'Sample CV text for testing',
      requestId: 'test-req-1',
    });

    expect(result.providerName).toBe('mock');
    expect(result.durationMs).toBeGreaterThan(0);

    const validation = ExtractedResumeRawSchema.safeParse(result.raw);
    expect(validation.success).toBe(true);
  });

  it('returns plausible field values', async () => {
    const result = await provider.extractResumeData({
      text: 'Sample CV text',
      requestId: 'test-req-2',
    });

    expect(result.raw.aktuelleRolle).toBeTruthy();
    expect(result.raw.skills).toBeDefined();
    expect(Array.isArray(result.raw.skills)).toBe(true);
    expect(result.raw.skills!.length).toBeGreaterThan(0);
    expect(result.raw.sprachen).toBeDefined();
    expect(result.raw.sprachen!.length).toBeGreaterThan(0);
    expect(result.raw.berufsstationen).toBeDefined();
    expect(result.raw.berufsstationen!.length).toBeGreaterThan(0);
  });

  it('adapts to English content', async () => {
    const result = await provider.extractResumeData({
      text: 'Work Experience: Senior Account Executive at SaaS Corp. Education: MBA',
      requestId: 'test-req-3',
    });

    expect(result.raw.sprachen![0].sprache).toBe('Englisch');
  });
});
