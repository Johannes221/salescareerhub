import type { ExtractedResumeRaw } from '../schemas';

export interface ExtractResumeInput {
  text: string;
  requestId: string;
}

export interface ExtractResumeResult {
  raw: ExtractedResumeRaw;
  providerName: string;
  durationMs: number;
}

export interface ResumeExtractionProvider {
  readonly name: string;
  extractResumeData(input: ExtractResumeInput): Promise<ExtractResumeResult>;
}
