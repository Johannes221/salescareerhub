'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Building2, User } from 'lucide-react';
import { CandidateOnboardingWizard } from '@/components/candidate-onboarding-wizard';

export default function OnboardingPage() {
  const { dbUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!dbUser?.onboardingCompleted) {
      return;
    }

    const target = dbUser.role === 'admin'
      ? '/dashboard/admin'
      : dbUser.role === 'company'
        ? '/dashboard/company'
        : '/dashboard/candidate';

    router.push(target);
  }, [dbUser, router]);

  if (!dbUser) return null;

  if (dbUser.role === 'candidate' && !dbUser.onboardingCompleted) {
    return <CandidateOnboardingWizard entryPoint="onboarding" />;
  }

  const isCandidate = dbUser.role === 'candidate';

  return (
    <div className="mx-auto max-w-2xl py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {isCandidate ? <User className="h-8 w-8 text-primary" /> : <Building2 className="h-8 w-8 text-primary" />}
        </div>
        <h1 className="mb-2 text-3xl font-bold">Willkommen bei SalesCareerHub!</h1>
        <p className="text-lg text-muted-foreground">
          Richte dein Unternehmensprofil ein, um Stellenanzeigen zu veröffentlichen.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-1">Nächste Schritte</h3>
        <p className="text-sm text-muted-foreground mb-4">Richte dein Unternehmen in wenigen Minuten ein.</p>
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</div>
            <div>
              <p className="font-medium">Unternehmensdaten</p>
              <p className="text-sm text-muted-foreground">Firmenname, Branche, Standort</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</div>
            <div>
              <p className="font-medium">Beschreibung & Benefits</p>
              <p className="text-sm text-muted-foreground">Was macht euch als Arbeitgeber aus?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</div>
            <div>
              <p className="font-medium">Erste Stelle veröffentlichen</p>
              <p className="text-sm text-muted-foreground">Erstelle deinen ersten Job – kostenlos</p>
            </div>
          </div>
          <button
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
            onClick={() => router.push('/dashboard/company/profil')}
          >
            Unternehmensprofil erstellen <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
