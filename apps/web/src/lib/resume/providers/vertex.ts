import type { ResumeExtractionProvider, ExtractResumeInput, ExtractResumeResult } from './types';
import { ExtractedResumeRawSchema } from '../schemas';
import { RESUME_EXTRACTION_SYSTEM_PROMPT, buildUserPrompt } from '../prompts';
import { resumeLogger } from '../logger';
import { ResumeValidationError, ResumeProviderUnavailableError } from '../errors';
import { resumeConfig } from '../config';

export class VertexAIResumeExtractionProvider implements ResumeExtractionProvider {
  readonly name = 'vertex';

  private async getClient() {
    if (!resumeConfig.vertex.projectId) {
      throw new ResumeProviderUnavailableError('vertex');
    }

    const { VertexAI } = await import('@google-cloud/vertexai');
    const vertexAI = new VertexAI({
      project: resumeConfig.vertex.projectId,
      location: resumeConfig.vertex.location,
    });

    return vertexAI.getGenerativeModel({
      model: resumeConfig.vertex.model,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4000,
        responseMimeType: 'application/json',
      },
    });
  }

  async extractResumeData(input: ExtractResumeInput): Promise<ExtractResumeResult> {
    const start = Date.now();

    resumeLogger.info(input.requestId, 'vertex_extraction_start', {
      provider: this.name,
      rawTextLength: input.text.length,
    });

    try {
      const model = await this.getClient();

      const result = await model.generateContent({
        systemInstruction: { role: 'system', parts: [{ text: RESUME_EXTRACTION_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: buildUserPrompt(input.text) }] }],
      });

      const response = result.response;
      const content = response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new ResumeValidationError('Vertex AI hat keine Antwort geliefert.');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new ResumeValidationError('Vertex AI-Antwort ist kein valides JSON.');
      }

      const validated = ExtractedResumeRawSchema.safeParse(parsed);
      if (!validated.success) {
        resumeLogger.warn(input.requestId, 'vertex_validation_failed', {
          provider: this.name,
          errorCode: 'VALIDATION_FAILED',
        });
        throw new ResumeValidationError('Vertex AI-Antwort entspricht nicht dem erwarteten Schema.');
      }

      const durationMs = Date.now() - start;
      resumeLogger.info(input.requestId, 'vertex_extraction_complete', {
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

      resumeLogger.error(input.requestId, 'vertex_extraction_failed', {
        provider: this.name,
        durationMs,
        success: false,
        errorCode: error instanceof Error ? error.name : 'UNKNOWN',
      });

      throw new ResumeProviderUnavailableError('vertex');
    }
  }
}
