import OpenAI from 'openai';
import type { ResumeExtractionProvider, ExtractResumeInput, ExtractResumeResult } from './types';
import { ExtractedResumeRawSchema } from '../schemas';
import { RESUME_EXTRACTION_SYSTEM_PROMPT, buildUserPrompt } from '../prompts';
import { resumeLogger } from '../logger';
import { ResumeValidationError, ResumeProviderUnavailableError } from '../errors';
import { resumeConfig } from '../config';

export class OpenAIResumeExtractionProvider implements ResumeExtractionProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor() {
    if (!resumeConfig.openai.apiKey) {
      throw new ResumeProviderUnavailableError('openai');
    }
    this.client = new OpenAI({ apiKey: resumeConfig.openai.apiKey });
  }

  async extractResumeData(input: ExtractResumeInput): Promise<ExtractResumeResult> {
    const start = Date.now();

    resumeLogger.info(input.requestId, 'openai_extraction_start', {
      provider: this.name,
      rawTextLength: input.text.length,
    });

    try {
      const response = await this.client.chat.completions.create({
        model: resumeConfig.openai.model,
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: RESUME_EXTRACTION_SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(input.text) },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new ResumeValidationError('OpenAI hat keine Antwort geliefert.');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new ResumeValidationError('OpenAI-Antwort ist kein valides JSON.');
      }

      const validated = ExtractedResumeRawSchema.safeParse(parsed);
      if (!validated.success) {
        resumeLogger.warn(input.requestId, 'openai_validation_failed', {
          provider: this.name,
          errorCode: 'VALIDATION_FAILED',
        });
        throw new ResumeValidationError('OpenAI-Antwort entspricht nicht dem erwarteten Schema.');
      }

      const durationMs = Date.now() - start;
      resumeLogger.info(input.requestId, 'openai_extraction_complete', {
        provider: this.name,
        durationMs,
        success: true,
      });

      return {
        raw: validated.data,
        providerName: this.name,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - start;
      if (error instanceof ResumeValidationError) throw error;

      resumeLogger.error(input.requestId, 'openai_extraction_failed', {
        provider: this.name,
        durationMs,
        success: false,
        errorCode: error instanceof Error ? error.name : 'UNKNOWN',
      });

      throw new ResumeProviderUnavailableError('openai');
    }
  }
}
