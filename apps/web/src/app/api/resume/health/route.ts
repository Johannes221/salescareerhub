import { NextResponse } from 'next/server';
import { getProviderStatus } from '@/lib/resume/providers/factory';
import { resumeConfig } from '@/lib/resume/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getProviderStatus();

  return NextResponse.json({
    status: 'ok',
    provider: {
      configured: resumeConfig.aiProvider,
      active: status.name,
      isMock: status.name === 'mock',
    },
    config: {
      maxUploadMB: resumeConfig.upload.maxSizeMB,
      ocrEnabled: resumeConfig.enableOCR,
      tempStorageEnabled: resumeConfig.enableTempFileStorage,
    },
  });
}
