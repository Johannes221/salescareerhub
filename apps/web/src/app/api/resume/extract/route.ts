import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { extractTextFromPdf, validatePdfMagicBytes } from '@/lib/resume/pdf-parser';
import { normalizeExtractedResume } from '@/lib/resume/normalization';
import { getResumeProvider } from '@/lib/resume/providers/factory';
import { resumeConfig } from '@/lib/resume/config';
import { resumeLogger } from '@/lib/resume/logger';
import { checkRateLimit } from '@/lib/resume/rate-limiter';
import {
  ResumeError,
  InvalidFileTypeError,
  FileTooLargeError,
  RateLimitExceededError,
} from '@/lib/resume/errors';
import type { ResumeExtractResponse } from '@/lib/resume/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse<ResumeExtractResponse>> {
  const requestId = randomUUID();
  const start = Date.now();

  try {
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = checkRateLimit(
      `resume:${clientIp}`,
      resumeConfig.rateLimit.windowMs,
      resumeConfig.rateLimit.maxRequests,
    );
    if (!rateLimitResult.allowed) {
      throw new RateLimitExceededError();
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, requestId, error: { code: 'NO_FILE', message: 'Keine Datei hochgeladen.' } },
        { status: 400 },
      );
    }

    // File size check
    if (file.size > resumeConfig.upload.maxSizeBytes) {
      throw new FileTooLargeError(resumeConfig.upload.maxSizeMB);
    }

    // MIME type check
    if (file.type !== 'application/pdf') {
      throw new InvalidFileTypeError();
    }

    resumeLogger.info(requestId, 'upload_received', {
      fileSizeBytes: file.size,
    });

    // Read file into buffer (memory only, no disk storage)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Magic bytes validation
    if (!validatePdfMagicBytes(buffer)) {
      throw new InvalidFileTypeError('Die Datei ist kein gültiges PDF (ungültige Dateistruktur).');
    }

    // Extract text from PDF
    resumeLogger.info(requestId, 'pdf_parsing_start');
    const rawText = await extractTextFromPdf(buffer);
    resumeLogger.info(requestId, 'pdf_parsing_complete', { rawTextLength: rawText.length });

    // AI extraction
    const provider = getResumeProvider();
    resumeLogger.info(requestId, 'ai_extraction_start', { provider: provider.name });

    const extractionResult = await provider.extractResumeData({
      text: rawText,
      requestId,
    });

    // Normalize
    resumeLogger.info(requestId, 'normalization_start');
    const { profile, warnings } = normalizeExtractedResume(extractionResult.raw);

    const processingMs = Date.now() - start;

    resumeLogger.info(requestId, 'request_complete', {
      provider: provider.name,
      durationMs: processingMs,
      success: true,
      rawTextLength: rawText.length,
    });

    return NextResponse.json({
      success: true,
      requestId,
      extracted: profile,
      meta: {
        provider: extractionResult.providerName,
        processingMs,
        rawTextLength: rawText.length,
        warnings,
      },
    });
  } catch (error) {
    const processingMs = Date.now() - start;

    if (error instanceof ResumeError) {
      resumeLogger.warn(requestId, 'request_failed', {
        durationMs: processingMs,
        errorCode: (error as ResumeError).code,
        success: false,
      });

      return NextResponse.json(
        { success: false as const, requestId, error: { code: (error as ResumeError).code, message: (error as ResumeError).message } },
        { status: (error as ResumeError).statusCode },
      );
    }

    resumeLogger.error(requestId, 'request_error', {
      durationMs: processingMs,
      errorCode: 'INTERNAL_ERROR',
      success: false,
    });

    return NextResponse.json(
      {
        success: false,
        requestId,
        error: { code: 'INTERNAL_ERROR', message: 'Ein unerwarteter Fehler ist aufgetreten.' },
      },
      { status: 500 },
    );
  }
}
