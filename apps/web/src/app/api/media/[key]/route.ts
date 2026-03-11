import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;

    if (key === 'founder-photo') {
      const founderPhoto = getFounderPhotoFilePath();

      if (founderPhoto) {
        const imageBuffer = fs.readFileSync(founderPhoto.filePath);

        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': MIME_BY_EXTENSION[founderPhoto.extension],
            'Cache-Control': 'public, max-age=31536000, immutable',
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
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (key === 'founder-photo') {
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

      return NextResponse.json({
        success: true,
        message: 'Image saved successfully',
        mediaAsset: {
          key,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          url: '/api/media/founder-photo',
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
