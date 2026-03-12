'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Briefcase, Shield } from 'lucide-react';

export default function CompanyDetailPage() {
  return (
    <div className="container py-12 max-w-3xl">
      <Link href="/unternehmen" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Zurück
      </Link>

      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mb-3 text-2xl font-bold">Unternehmensprofil nicht öffentlich verfügbar</h1>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Öffentliche Firmenprofile sind deaktiviert. Unternehmen bleiben im öffentlichen Feed anonymisiert,
            bis ein Recruiter eine Einführung freigibt.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/jobs">
              <Button>
                Anonymisierte Jobs ansehen
                <Briefcase className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/fuer-unternehmen">
              <Button variant="outline">Für Unternehmen</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
