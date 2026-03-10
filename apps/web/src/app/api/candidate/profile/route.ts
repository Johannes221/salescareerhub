import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';
import { verifyIdToken } from '@salescareerhub/auth/server';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    return prisma.user.findUnique({ where: { firebaseUid: decoded.uid }, include: { candidateProfile: true } });
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    return NextResponse.json({ success: true, data: user.candidateProfile });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'candidate') {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const body = await req.json();
    const {
      firstName, lastName, email, phone, linkedinUrl, location, country,
      remotePreference, yearsOfExperience, currentRole, targetRole, seniority,
      languages, salaryExpectationBase, salaryExpectationOte, noticePeriod,
      shortBio, skills, visibleToRecruiters, openToWork,
    } = body;

    const data = {
      firstName, lastName, email, phone, linkedinUrl, location, country,
      remotePreference, yearsOfExperience, currentRole, targetRole, seniority,
      languages: languages || [], salaryExpectationBase, salaryExpectationOte,
      noticePeriod, shortBio, skills: skills || [],
      visibleToRecruiters: visibleToRecruiters ?? false,
      openToWork: openToWork ?? true,
    };

    let profile;
    if (user.candidateProfile) {
      profile = await prisma.candidateProfile.update({
        where: { id: user.candidateProfile.id },
        data,
      });
    } else {
      profile = await prisma.candidateProfile.create({
        data: { ...data, userId: user.id },
      });
      await prisma.user.update({ where: { id: user.id }, data: { onboardingCompleted: true } });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id, action: 'profile_updated', entity: 'CandidateProfile',
        entityId: profile.id, details: 'Kandidatenprofil aktualisiert',
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
