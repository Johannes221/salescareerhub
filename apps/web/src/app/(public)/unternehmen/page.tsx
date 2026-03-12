'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Building2, Shield, Users } from 'lucide-react';

export default function UnternehmenPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mb-3 text-3xl font-bold">Keine öffentliche Unternehmensdatenbank</h1>
        <p className="text-muted-foreground">
          SalesCareerHub ist kein Marketplace. Unternehmen werden im öffentlichen Bereich bewusst anonymisiert,
          bis ein Recruiter einen passenden Fit bestätigt und eine Einführung freigibt.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Für Kandidaten</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Entdecke anonymisierte B2B SaaS Sales Rollen und bewirb dich mit deinem strukturierten Sales-Profil.
            </p>
            <Link href="/jobs">
              <Button>
                Zu den Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Für Unternehmen</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Wenn du eine Rolle besetzen willst, läuft der Prozess direkt über das Recruiter-Team und nicht über ein öffentliches Firmenprofil.
            </p>
            <Link href="/fuer-unternehmen">
              <Button variant="outline">
                Recruiting-Prozess ansehen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
