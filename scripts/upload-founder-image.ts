import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function uploadFounderImage() {
  try {
    const imagePath = path.join(__dirname, '../apps/web/public/images/Johannes1.jpg');
    
    // Check if the image file exists
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Image file not found at:', imagePath);
      console.log('Please place Johannes1.jpg in apps/web/public/images/');
      process.exit(1);
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Data = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    // Upload to database
    const mediaAsset = await prisma.mediaAsset.upsert({
      where: { key: 'founder-photo' },
      update: {
        fileName: 'Johannes1.jpg',
        mimeType: 'image/jpeg',
        fileSize: imageBuffer.length,
        data: base64Data,
        alt: 'Johannes Schartl – Gründer von SalesCareerHub',
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        key: 'founder-photo',
        fileName: 'Johannes1.jpg',
        mimeType: 'image/jpeg',
        fileSize: imageBuffer.length,
        data: base64Data,
        alt: 'Johannes Schartl – Gründer von SalesCareerHub',
      },
    });

    console.log('✅ Founder image uploaded successfully!');
    console.log('Asset ID:', mediaAsset.id);
    console.log('File size:', `${(mediaAsset.fileSize / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error uploading founder image:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

uploadFounderImage();
