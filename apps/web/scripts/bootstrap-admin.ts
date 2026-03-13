import { PrismaClient } from '@prisma/client';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '../src/lib/auth/server';
import { getAdminEmails, normalizeEmail, sanitizeEnvValue } from '../src/lib/auth/shared';
import { ROLES } from '../src/lib/config';

const prisma = new PrismaClient();
const prismaAny = prisma as any;

function readRequiredEnv(key: string) {
  const value = sanitizeEnvValue(process.env[key]);

  if (!value) {
    throw new Error(`Fehlende Umgebungsvariable: ${key}`);
  }

  return value;
}

async function main() {
  const email = normalizeEmail(readRequiredEnv('ADMIN_BOOTSTRAP_EMAIL'));
  const password = readRequiredEnv('ADMIN_BOOTSTRAP_PASSWORD');
  const displayName = sanitizeEnvValue(process.env.ADMIN_BOOTSTRAP_DISPLAY_NAME) || 'Admin';

  if (!email) {
    throw new Error('ADMIN_BOOTSTRAP_EMAIL ist ungültig.');
  }

  if (password.length < 12) {
    throw new Error('ADMIN_BOOTSTRAP_PASSWORD muss mindestens 12 Zeichen lang sein.');
  }

  if (!getAdminEmails().includes(email)) {
    throw new Error('ADMIN_BOOTSTRAP_EMAIL muss in ADMIN_EMAILS enthalten sein.');
  }

  const existingDbUser = await prismaAny.user.findUnique({
    where: { email },
  });

  if (existingDbUser && existingDbUser.role !== ROLES.ADMIN) {
    throw new Error('Für diese E-Mail existiert bereits ein Nicht-Admin-Benutzer in der Datenbank.');
  }

  const auth = getAuth(getFirebaseAdminApp());
  let firebaseUser;

  try {
    firebaseUser = await auth.getUserByEmail(email);
  } catch (error: any) {
    if (error?.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  if (firebaseUser && firebaseUser.providerData.some((provider) => provider.providerId && provider.providerId !== 'password')) {
    throw new Error('Für diese E-Mail existiert bereits ein Firebase-Konto mit Social-Provider. Bitte verwende eine neue Admin-E-Mail.');
  }

  if (!firebaseUser) {
    firebaseUser = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
      disabled: false,
    });
  } else {
    firebaseUser = await auth.updateUser(firebaseUser.uid, {
      password,
      displayName,
      emailVerified: true,
      disabled: false,
    });
  }

  const user = existingDbUser
    ? await prismaAny.user.update({
        where: { id: existingDbUser.id },
        data: {
          firebaseUid: firebaseUser.uid,
          email,
          role: ROLES.ADMIN,
          authProvider: 'email',
          displayName,
          isActive: true,
          onboardingCompleted: true,
        },
      })
    : await prismaAny.user.create({
        data: {
          firebaseUid: firebaseUser.uid,
          email,
          role: ROLES.ADMIN,
          authProvider: 'email',
          displayName,
          isActive: true,
          onboardingCompleted: true,
        },
      });

  await prismaAny.adminUser.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'admin_bootstrapped',
      entity: 'User',
      entityId: user.id,
      details: JSON.stringify({ email }),
    },
  });

  console.log(`ADMIN BOOTSTRAP READY: ${email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
