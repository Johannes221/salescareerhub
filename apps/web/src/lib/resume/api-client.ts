import type { NormalizedCandidateProfile, ResumeExtractMeta } from './schemas';

export interface ResumeExtractSuccessResult {
  success: true;
  requestId: string;
  extracted: NormalizedCandidateProfile;
  meta: ResumeExtractMeta;
}

export interface ResumeExtractErrorResult {
  success: false;
  requestId: string;
  error: { code: string; message: string };
}

export type ResumeExtractResult = ResumeExtractSuccessResult | ResumeExtractErrorResult;

export async function extractResumeFromFile(file: File): Promise<ResumeExtractResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/resume/extract', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data as ResumeExtractResult;
}

export async function extractResumeDemo(): Promise<ResumeExtractResult> {
  const response = await fetch('/api/resume/demo', {
    method: 'POST',
  });

  const data = await response.json();
  return data as ResumeExtractResult;
}

export interface ResumeHealthStatus {
  status: string;
  provider: {
    configured: string;
    active: string;
    isMock: boolean;
  };
  config: {
    maxUploadMB: number;
    ocrEnabled: boolean;
    tempStorageEnabled: boolean;
  };
}

export async function getResumeHealth(): Promise<ResumeHealthStatus> {
  const response = await fetch('/api/resume/health');
  return response.json();
}
