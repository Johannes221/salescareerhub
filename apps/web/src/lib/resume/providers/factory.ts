import type { ResumeExtractionProvider } from './types';
import { MockResumeExtractionProvider } from './mock';
import { OpenAIResumeExtractionProvider } from './openai';
import { VertexAIResumeExtractionProvider } from './vertex';
import { resumeConfig } from '../config';
import type { AIProviderType } from '../config';

let cachedProvider: ResumeExtractionProvider | null = null;

export function getResumeProvider(): ResumeExtractionProvider {
  if (cachedProvider) return cachedProvider;

  const providerType = resumeConfig.aiProvider;

  switch (providerType) {
    case 'openai':
      try {
        cachedProvider = new OpenAIResumeExtractionProvider();
      } catch {
        console.warn('[resume-provider] OpenAI provider init failed, falling back to mock.');
        cachedProvider = new MockResumeExtractionProvider();
      }
      break;
    case 'vertex':
      cachedProvider = new VertexAIResumeExtractionProvider();
      break;
    case 'mock':
    default:
      cachedProvider = new MockResumeExtractionProvider();
      break;
  }

  return cachedProvider;
}

export function getProviderStatus(): { provider: AIProviderType; active: boolean; name: string } {
  const provider = getResumeProvider();
  return {
    provider: resumeConfig.aiProvider,
    active: true,
    name: provider.name,
  };
}

export function resetProviderCache(): void {
  cachedProvider = null;
}
