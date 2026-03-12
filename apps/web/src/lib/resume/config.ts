export type AIProviderType = 'mock' | 'openai' | 'vertex';

export interface ResumeConfig {
  aiProvider: AIProviderType;
  openai: {
    apiKey: string | undefined;
    model: string;
  };
  vertex: {
    projectId: string | undefined;
    location: string;
    model: string;
    credentials: string | undefined;
  };
  upload: {
    maxSizeMB: number;
    maxSizeBytes: number;
  };
  enableTempFileStorage: boolean;
  enableOCR: boolean;
  logLevel: string;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

function resolveProvider(): AIProviderType {
  const env = process.env.AI_PROVIDER?.toLowerCase();
  if (env === 'openai' && process.env.OPENAI_API_KEY) return 'openai';
  if (env === 'vertex' && process.env.VERTEX_PROJECT_ID) return 'vertex';
  if (env === 'openai' && !process.env.OPENAI_API_KEY) {
    console.warn('[resume-config] AI_PROVIDER=openai but OPENAI_API_KEY missing. Falling back to mock.');
  }
  if (env === 'vertex' && !process.env.VERTEX_PROJECT_ID) {
    console.warn('[resume-config] AI_PROVIDER=vertex but VERTEX_PROJECT_ID missing. Falling back to mock.');
  }
  return 'mock';
}

const maxSizeMB = parseInt(process.env.MAX_UPLOAD_MB || '10', 10);

export const resumeConfig: ResumeConfig = {
  aiProvider: resolveProvider(),
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4.1-nano',
  },
  vertex: {
    projectId: process.env.VERTEX_PROJECT_ID,
    location: process.env.VERTEX_LOCATION || 'europe-west1',
    model: process.env.VERTEX_MODEL || 'gemini-1.5-flash',
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  upload: {
    maxSizeMB,
    maxSizeBytes: maxSizeMB * 1024 * 1024,
  },
  enableTempFileStorage: process.env.ENABLE_TEMP_FILE_STORAGE === 'true',
  enableOCR: process.env.ENABLE_OCR === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimit: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
};
