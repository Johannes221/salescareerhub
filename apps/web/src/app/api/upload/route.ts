import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';

/**
 * File Upload API
 * 
 * DSGVO-Hinweis: Hochgeladene Dateien (CV, Dokumente) werden gemäß Art. 6 Abs. 1 lit. a/b DSGVO
 * verarbeitet. Nutzer können ihre Dateien jederzeit über die Einstellungen oder den GDPR-Löschendpoint
 * löschen lassen.
 * 
 * TODO: Integration mit Firebase Storage für die eigentliche Dateispeicherung.
 * Aktuell wird nur der Metadaten-Record in der DB erstellt.
 * Für die Firebase Storage Integration:
 * 1. Firebase Storage im Projekt aktivieren
 * 2. Storage Rules konfigurieren (nur authentifizierte User)
 * 3. Datei per Client-SDK hochladen
 * 4. Download-URL an diese API senden
 */

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true },
    });

    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });

    const body = await req.json();
    const { fileName, fileUrl, fileType, fileSizeKb, category } = body;

    if (!fileName || !fileUrl || !fileType) {
      return NextResponse.json({ success: false, error: 'Dateiinformationen fehlen' }, { status: 400 });
    }

    // File size validation (max 10MB)
    if (fileSizeKb && fileSizeKb > 10 * 1024) {
      return NextResponse.json({ success: false, error: 'Datei ist zu groß (max. 10 MB)' }, { status: 400 });
    }

    // File type validation
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ success: false, error: 'Dateityp nicht erlaubt' }, { status: 400 });
    }

    if (!user.candidateProfile) {
      return NextResponse.json({ success: false, error: 'Kandidatenprofil erforderlich' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        candidateId: user.candidateProfile.id,
        fileName,
        fileUrl,
        fileType,
        fileSizeKb: fileSizeKb || 0,
        category: category || 'cv',
      },
    });

    // If category is 'cv', also update the candidateProfile.cvUrl
    if (category === 'cv') {
      await prisma.candidateProfile.update({
        where: { id: user.candidateProfile.id },
        data: { cvUrl: fileUrl },
      });
    }

    // DSGVO Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'document_uploaded',
        entity: 'Document',
        entityId: document.id,
        details: `Datei "${fileName}" (${category}) hochgeladen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung). Speicherdauer: Bis zur Löschung durch den Nutzer oder Kontolöschung.`,
      },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Upload' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true },
    });

    if (!user?.candidateProfile) {
      return NextResponse.json({ success: true, data: [] });
    }

    const documents = await prisma.document.findMany({
      where: { candidateId: user.candidateProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true },
    });

    if (!user?.candidateProfile) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { documentId } = await req.json();
    if (!documentId) return NextResponse.json({ success: false, error: 'Dokument-ID erforderlich' }, { status: 400 });

    const doc = await prisma.document.findFirst({
      where: { id: documentId, candidateId: user.candidateProfile.id },
    });
    if (!doc) return NextResponse.json({ success: false, error: 'Dokument nicht gefunden' }, { status: 404 });

    await prisma.document.delete({ where: { id: documentId } });

    // TODO: Delete file from Firebase Storage

    // DSGVO Audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'document_deleted',
        entity: 'Document',
        entityId: documentId,
        details: `Datei "${doc.fileName}" gelöscht (Art. 17 DSGVO - Recht auf Löschung).`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
