'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Building2, ArrowRight, CheckCircle } from 'lucide-react';

export default function OnboardingPage() {
  const { dbUser } = useAuth();
  const router = useRouter();

  if (!dbUser) return null;

  if (dbUser.onboardingCompleted) {
    const target = dbUser.role === 'admin' ? '/dashboard/admin'
      : dbUser.role === 'company' ? '/dashboard/company'
      : '/dashboard/candidate';
    router.push(target);
    return null;
  }

  const isCandidate = dbUser.role === 'candidate';
  const isCompany = dbUser.role === 'company';

  return (
    <div className="container py-16 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          {isCandidate ? <User className="h-8 w-8 text-primary" /> : <Building2 className="h-8 w-8 text-primary" />}
        </div>
        <h1 className="text-3xl font-bold mb-2">
          Willkommen bei SalesCareerHub!
        </h1>
        <p className="text-muted-foreground text-lg">
          {isCandidate
            ? 'Erstelle dein Kandidatenprofil, damit wir die besten Jobs für dich finden können.'
            : 'Erstelle dein Unternehmensprofil, um Stellenanzeigen zu veröffentlichen.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isCandidate ? 'Nächste Schritte' : 'Nächste Schritte'}
          </CardTitle>
          <CardDescription>
            {isCandidate
              ? 'Vervollständige dein Profil in wenigen Minuten.'
              : 'Richte dein Unternehmen in wenigen Minuten ein.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCandidate ? (
            <>
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Persönliche Daten</p>
                  <p className="text-sm text-muted-foreground">Name, Kontaktdaten, Standort</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Berufserfahrung</p>
                  <p className="text-sm text-muted-foreground">Aktuelle Rolle, Zielrolle, Skills</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Gehaltsvorstellung</p>
                  <p className="text-sm text-muted-foreground">Base Salary und OTE Erwartung</p>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => router.push('/dashboard/candidate/profil')}>
                Profil erstellen <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Unternehmensdaten</p>
                  <p className="text-sm text-muted-foreground">Firmenname, Branche, Standort</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Beschreibung & Benefits</p>
                  <p className="text-sm text-muted-foreground">Was macht euch als Arbeitgeber aus?</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Erste Stelle veröffentlichen</p>
                  <p className="text-sm text-muted-foreground">Erstelle deinen ersten Job – kostenlos</p>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => router.push('/dashboard/company/profil')}>
                Unternehmensprofil erstellen <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          <button onClick={() => {
            const target = isCandidate ? '/dashboard/candidate' : '/dashboard/company';
            router.push(target);
          }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            Später vervollständigen
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
