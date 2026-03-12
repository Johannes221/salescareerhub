import { getStorage } from 'firebase-admin/storage';
import { sanitizeEnvValue } from '@/lib/auth/shared';
import { getFirebaseAdminApp } from '@/lib/auth/server';

const storageBucket = sanitizeEnvValue(process.env.FIREBASE_STORAGE_BUCKET)
  || sanitizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

function getBucket() {
  if (!storageBucket) {
    throw new Error('Firebase Storage ist nicht vollständig konfiguriert: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  }

  return getStorage(getFirebaseAdminApp()).bucket(storageBucket);
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/-+/g, '-');
}

function buildPublicUrl(bucketName: string, objectPath: string) {
  return `https://storage.googleapis.com/${bucketName}/${objectPath.split('/').map((part) => encodeURIComponent(part)).join('/')}`;
}

export async function uploadCandidateDocument(params: {
  candidateId: string;
  category: string;
  file: File;
}) {
  const { candidateId, category, file } = params;
  const bucket = getBucket();
  const safeFileName = sanitizeFileName(file.name || 'document.pdf');
  const objectPath = `candidate-documents/${candidateId}/${Date.now()}-${safeFileName}`;
  const fileRef = bucket.file(objectPath);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fileRef.save(buffer, {
    resumable: false,
    metadata: {
      contentType: file.type || 'application/octet-stream',
      metadata: {
        candidateId,
        category,
        originalFileName: file.name,
      },
    },
  });

  let fileUrl = buildPublicUrl(bucket.name, objectPath);

  try {
    await fileRef.makePublic();
  } catch {
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    });
    fileUrl = signedUrl;
  }

  return {
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
    fileUrl,
    objectPath,
  };
}

export async function deleteCandidateDocument(objectPath: string) {
  if (!objectPath) {
    return;
  }

  await getBucket().file(objectPath).delete({ ignoreNotFound: true });
}
