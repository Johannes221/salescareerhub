import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';
import { deriveSeniorityFromYears } from '@/lib/utils';
import { deleteCandidateDocument, uploadCandidateDocument } from '@/lib/storage/candidate-documents';

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE_KB = 10 * 1024;

function getNameParts(displayName: string | null | undefined, email: string) {
  const fallback = email.split('@')[0] || 'Kandidat';
  const parts = (displayName || fallback).trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || 'Kandidat',
    lastName: parts.slice(1).join(' ') || 'Profil',
  };
}

function buildMockCvExtraction(fileName: string, displayName: string | null | undefined, email: string) {
  const lowerFileName = fileName.toLowerCase();
  const { firstName, lastName } = getNameParts(displayName, email);
  const currentRole = lowerFileName.includes('sdr')
    ? 'SDR'
    : lowerFileName.includes('bdr')
      ? 'BDR'
      : lowerFileName.includes('manager')
        ? 'Sales Manager'
        : lowerFileName.includes('enterprise')
          ? 'Enterprise AE'
          : 'Account Executive';
  const yearsOfExperience = lowerFileName.includes('junior')
    ? 1
    : lowerFileName.includes('lead')
      ? 10
      : lowerFileName.includes('senior')
        ? 7
        : 4;
  const desiredJobRoles = currentRole === 'SDR' || currentRole === 'BDR'
    ? ['Account Executive', 'Mid-Market AE']
    : [currentRole, 'Enterprise AE'];
  const salaryExpectationBase = currentRole === 'SDR' || currentRole === 'BDR' ? 45000 : 80000;
  const salaryExpectationOte = currentRole === 'SDR' || currentRole === 'BDR' ? 65000 : 140000;

  return {
    firstName,
    lastName,
    email,
    currentRole,
    targetRole: desiredJobRoles[0],
    desiredJobRoles,
    desiredIndustries: ['SaaS'],
    careerGoals: ['Mehr Verantwortung übernehmen'],
    preferredCompanyTypes: ['Series B+ Scale-up'],
    remotePreference: ['remote', 'hybrid'],
    yearsOfExperience,
    seniority: deriveSeniorityFromYears(yearsOfExperience),
    skills: ['SaaS Sales', 'B2B Sales', 'Pipeline Management', 'Negotiation', 'Closing'],
    languages: ['Deutsch', 'Englisch'],
    languageProficiencies: [
      { language: 'Deutsch', level: 'Muttersprachliches Niveau' },
      { language: 'Englisch', level: 'Verhandlungssicher' },
    ],
    country: 'Deutschland',
    location: '',
    salaryExpectationBase,
    salaryExpectationOte,
    salaryExpectationCurrency: 'EUR',
    onboardingSource: 'cv' as const,
  };
}

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);

    return prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true },
    });
  } catch {
    return null;
  }
}

async function ensureCandidateProfile(user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>) {
  if (user.candidateProfile) {
    return user.candidateProfile;
  }

  const { firstName, lastName } = getNameParts(user.displayName, user.email);

  return prisma.candidateProfile.create({
    data: {
      userId: user.id,
      firstName,
      lastName,
      email: user.email,
      remotePreference: [],
      desiredJobRoles: [],
      desiredIndustries: [],
      careerGoals: [],
      preferredCompanyTypes: [],
      languages: [],
      skills: [],
      onboardingStep: 0,
      onboardingSource: 'cv',
    },
  });
}

function getObjectPathFromUrl(fileUrl: string) {
  const googleStorageMatch = fileUrl.match(/https:\/\/storage\.googleapis\.com\/[^/]+\/(.+)/i);

  if (googleStorageMatch?.[1]) {
    return decodeURIComponent(googleStorageMatch[1]);
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user || user.role !== 'candidate') {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }

    const candidateProfile = await ensureCandidateProfile(user);
    const contentType = req.headers.get('content-type') || '';
    let fileName = '';
    let fileUrl = '';
    let fileType = '';
    let fileSizeKb = 0;
    let category = 'cv';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      category = typeof formData.get('category') === 'string' ? String(formData.get('category')) : 'cv';

      if (!(file instanceof File)) {
        return NextResponse.json({ success: false, error: 'Datei fehlt' }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE_KB * 1024) {
        return NextResponse.json({ success: false, error: 'Datei ist zu groß (max. 10 MB)' }, { status: 400 });
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ success: false, error: 'Dateityp nicht erlaubt' }, { status: 400 });
      }

      const uploaded = await uploadCandidateDocument({
        candidateId: candidateProfile.id,
        category,
        file,
      });

      fileName = uploaded.fileName;
      fileUrl = uploaded.fileUrl;
      fileType = uploaded.fileType;
      fileSizeKb = uploaded.fileSizeKb;
    } else {
      const body = await req.json();
      fileName = body.fileName;
      fileUrl = body.fileUrl;
      fileType = body.fileType;
      fileSizeKb = body.fileSizeKb || 0;
      category = body.category || 'cv';
    }

    if (!fileName || !fileUrl || !fileType) {
      return NextResponse.json({ success: false, error: 'Dateiinformationen fehlen' }, { status: 400 });
    }

    if (fileSizeKb && fileSizeKb > MAX_FILE_SIZE_KB) {
      return NextResponse.json({ success: false, error: 'Datei ist zu groß (max. 10 MB)' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ success: false, error: 'Dateityp nicht erlaubt' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        candidateId: candidateProfile.id,
        fileName,
        fileUrl,
        fileType,
        fileSizeKb: fileSizeKb || 0,
        category: category || 'cv',
      },
    });

    let extraction = null;

    if (category === 'cv') {
      // Try real AI extraction first, fall back to mock
      try {
        if (contentType.includes('multipart/form-data')) {
          const formDataRetry = await req.clone().formData().catch(() => null);
          const fileObj = formDataRetry?.get('file');
          if (fileObj instanceof File) {
            const { extractTextFromPdf } = await import('@/lib/resume/pdf-parser');
            const { normalizeExtractedResume } = await import('@/lib/resume/normalization');
            const { getResumeProvider } = await import('@/lib/resume/providers/factory');

            const arrayBuffer = await fileObj.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const rawText = await extractTextFromPdf(buffer);
            const provider = getResumeProvider();
            const result = await provider.extractResumeData({ text: rawText, requestId: `upload-${Date.now()}` });
            const { profile } = normalizeExtractedResume(result.raw);

            const v = (f: any) => f?.value;
            const { firstName: fn, lastName: ln } = getNameParts(user.displayName, user.email);
            extraction = {
              firstName: fn,
              lastName: ln,
              email: v(profile.email) || user.email,
              phone: v(profile.telefon) || '',
              linkedinUrl: v(profile.linkedinUrl) || '',
              location: v(profile.standort) || '',
              currentRole: v(profile.aktuelleRolle) || '',
              yearsOfExperience: v(profile.berufserfahrungJahre) ?? 0,
              skills: v(profile.skills) || [],
              berufsstationen: v(profile.berufsstationen) || [],
              sprachen: v(profile.sprachen) || [],
              seniority: v(profile.seniority) || deriveSeniorityFromYears(v(profile.berufserfahrungJahre)),
              salaryExpectationBase: v(profile.gehaltBaseJahr) || undefined,
              salaryExpectationOte: v(profile.gehaltOTEJahr) || undefined,
              noticePeriod: v(profile.kuendigungsfrist) || '',
              onboardingSource: 'cv' as const,
            };
          }
        }
      } catch (extractionError) {
        console.warn('Real CV extraction failed, using mock:', extractionError);
        extraction = buildMockCvExtraction(fileName, user.displayName, user.email);
      }

      if (!extraction) {
        extraction = buildMockCvExtraction(fileName, user.displayName, user.email);
      }

      await prisma.candidateProfile.update({
        where: { id: candidateProfile.id },
        data: {
          cvUrl: fileUrl,
          cvFileName: fileName,
          cvUploadDate: new Date(),
          onboardingStep: 1,
          onboardingSource: 'cv',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'document_uploaded',
        entity: 'Document',
        entityId: document.id,
        details: `Datei "${fileName}" (${category}) hochgeladen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung). Speicherdauer: Bis zur Löschung durch den Nutzer oder Kontolöschung.`,
      },
    });

    return NextResponse.json({ success: true, data: document, extraction }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Upload' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user?.candidateProfile) {
      return NextResponse.json({ success: true, data: [] });
    }

    const documents = await prisma.document.findMany({
      where: { candidateId: user.candidateProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user?.candidateProfile) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ success: false, error: 'Dokument-ID erforderlich' }, { status: 400 });
    }

    const doc = await prisma.document.findFirst({
      where: { id: documentId, candidateId: user.candidateProfile.id },
    });

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Dokument nicht gefunden' }, { status: 404 });
    }

    await prisma.document.delete({ where: { id: documentId } });

    const objectPath = getObjectPathFromUrl(doc.fileUrl);
    if (objectPath) {
      await deleteCandidateDocument(objectPath).catch(() => undefined);
    }

    if (doc.category === 'cv' && user.candidateProfile.cvUrl === doc.fileUrl) {
      await prisma.candidateProfile.update({
        where: { id: user.candidateProfile.id },
        data: {
          cvUrl: null,
          cvFileName: null,
          cvUploadDate: null,
        },
      });
    }

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
  } catch {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
