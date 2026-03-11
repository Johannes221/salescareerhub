import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;

    // Try to get from database first
    try {
      const mediaAsset = await prisma.mediaAsset.findUnique({
        where: {
          key,
          isActive: true,
        },
      });

      if (mediaAsset) {
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
      }
    } catch (dbError) {
      console.log('Database not available, falling back to static file');
    }

    // Fallback to static file
    if (key === 'founder-photo') {
      const staticImagePath = path.join(process.cwd(), 'public', 'images', 'Johannes1.jpg');
      
      if (fs.existsSync(staticImagePath)) {
        const imageBuffer = fs.readFileSync(staticImagePath);
        
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': 'image/jpeg',
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
    const alt = formData.get('alt') as string | undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Try to save to database first
    try {
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
    } catch (dbError) {
      console.log('Database not available, saving to local filesystem');
      
      // Fallback: Save to local filesystem
      if (key === 'founder-photo') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Ensure the images directory exists
        const imagesDir = path.join(process.cwd(), 'public', 'images');
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        // Save the file
        const filePath = path.join(imagesDir, 'Johannes1.jpg');
        fs.writeFileSync(filePath, buffer);
        
        return NextResponse.json({
          success: true,
          message: 'Image saved to local filesystem (database unavailable)',
          mediaAsset: {
            key,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            alt,
          },
        });
      }
    }

    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error uploading media asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
