import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthUser, isAdminUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FOUNDER_PHOTO_URL_SETTING_KEY = 'founder_photo_url';
const FOUNDER_PHOTO_BASENAME = 'Johannes1';
const FOUNDER_PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
const MIME_BY_EXTENSION: Record<(typeof FOUNDER_PHOTO_EXTENSIONS)[number], string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};
const EXTENSION_BY_MIME: Record<string, (typeof FOUNDER_PHOTO_EXTENSIONS)[number]> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function getFounderPhotoFilePath() {
  const imagesDir = path.join(process.cwd(), 'public', 'images');

  for (const extension of FOUNDER_PHOTO_EXTENSIONS) {
    const filePath = path.join(imagesDir, `${FOUNDER_PHOTO_BASENAME}.${extension}`);
    if (fs.existsSync(filePath)) {
      return { filePath, extension };
    }
  }

  return null;
}

async function getFounderPhotoUrlSetting() {
  try {
    const setting = await prisma.adminSetting.findUnique({
      where: { key: FOUNDER_PHOTO_URL_SETTING_KEY },
    });

    return setting?.value?.trim() || null;
  } catch {
    return null;
  }
}

async function requireAdminUser(request: NextRequest) {
  const user = await getAuthUser(request);

  if (!user || !isAdminUser(user)) {
    return null;
  }

  return { id: user.id };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;

    if (key === 'founder-photo') {
      const configuredUrl = await getFounderPhotoUrlSetting();

      if (configuredUrl && /^https?:\/\//i.test(configuredUrl)) {
        return NextResponse.redirect(configuredUrl, 307);
      }

      if (configuredUrl && configuredUrl.startsWith('/')) {
        return NextResponse.redirect(new URL(configuredUrl, request.url), 307);
      }

      const founderPhoto = getFounderPhotoFilePath();

      if (founderPhoto) {
        const imageBuffer = fs.readFileSync(founderPhoto.filePath);

        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': MIME_BY_EXTENSION[founderPhoto.extension],
            'Cache-Control': 'no-store, max-age=0',
            'Content-Disposition': 'inline',
          },
        });
      }
    }

    return NextResponse.json(
      { error: 'Media asset not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching media asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    const adminUser = await requireAdminUser(request);

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    if (key === 'founder-photo') {
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const body = await request.json();
        const imageUrl = typeof body?.url === 'string' ? body.url.trim() : '';

        if (!imageUrl || !(/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('/'))) {
          return NextResponse.json(
            { error: 'Invalid image URL' },
            { status: 400 }
          );
        }

        await prisma.adminSetting.upsert({
          where: { key: FOUNDER_PHOTO_URL_SETTING_KEY },
          update: { value: imageUrl },
          create: { key: FOUNDER_PHOTO_URL_SETTING_KEY, value: imageUrl },
        });

        return NextResponse.json({
          success: true,
          message: 'Image URL saved successfully',
          mediaAsset: {
            key,
            url: '/api/media/founder-photo',
            sourceUrl: imageUrl,
          },
        });
      }

      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      const fileExtension = EXTENSION_BY_MIME[file.type];

      if (!fileExtension) {
        return NextResponse.json(
          { error: 'Invalid file type' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const imagesDir = path.join(process.cwd(), 'public', 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      for (const extension of FOUNDER_PHOTO_EXTENSIONS) {
        const existingFilePath = path.join(imagesDir, `${FOUNDER_PHOTO_BASENAME}.${extension}`);
        if (fs.existsSync(existingFilePath)) {
          fs.unlinkSync(existingFilePath);
        }
      }

      const filePath = path.join(imagesDir, `${FOUNDER_PHOTO_BASENAME}.${fileExtension}`);
      fs.writeFileSync(filePath, buffer);

      await prisma.adminSetting.deleteMany({
        where: { key: FOUNDER_PHOTO_URL_SETTING_KEY },
      });

      return NextResponse.json({
        success: true,
        message: 'Image saved successfully',
        mediaAsset: {
          key,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          url: '/api/media/founder-photo',
          updatedByUserId: adminUser.id,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid key' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error uploading media asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
