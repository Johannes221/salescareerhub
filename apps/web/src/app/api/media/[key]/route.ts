import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;

    // For now, only serve founder-photo from static file
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

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Save to local filesystem
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
        message: 'Image saved successfully',
        mediaAsset: {
          key,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
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
