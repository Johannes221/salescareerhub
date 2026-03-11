import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;

    const mediaAsset = await prisma.mediaAsset.findUnique({
      where: {
        key,
        isActive: true,
      },
    });

    if (!mediaAsset) {
      return NextResponse.json(
        { error: 'Media asset not found' },
        { status: 404 }
      );
    }

    // Convert base64 data back to binary
    const base64Data = mediaAsset.data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mediaAsset.mimeType,
        'Content-Length': mediaAsset.fileSize.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
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
    const alt = formData.get('alt') as string | undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upsert the media asset
    const mediaAsset = await prisma.mediaAsset.upsert({
      where: { key },
      update: {
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        data: base64Data,
        alt,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        key,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        data: base64Data,
        alt,
      },
    });

    return NextResponse.json({
      success: true,
      mediaAsset: {
        id: mediaAsset.id,
        key: mediaAsset.key,
        fileName: mediaAsset.fileName,
        mimeType: mediaAsset.mimeType,
        fileSize: mediaAsset.fileSize,
        alt: mediaAsset.alt,
      },
    });
  } catch (error) {
    console.error('Error uploading media asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
