'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { CandidateProfileTabs } from '@/components/candidate-profile-tabs';
import { ProfileAvatarUploader } from '@/components/profile-avatar-uploader';
import { Button } from '@/components/ui/button';
import { getIdToken } from '@/lib/auth/client';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, BadgeCheck, CircleAlert, PencilLine, Sparkles } from 'lucide-react';

export default function CandidateProfilePage() {
  const { dbUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getIdToken();
        const res = await fetch('/api/candidate/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const payload = await res.json();
        setProfile(payload.data || null);
      } catch {} finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const completionFields = [
    { filled: !!profile?.firstName, label: 'Vorname' },
    { filled: !!profile?.lastName, label: 'Nachname' },
    { filled: !!profile?.email, label: 'E-Mail' },
    { filled: !!profile?.currentRole, label: 'Aktuelle Rolle' },
    { filled: !!profile?.targetRole || (profile?.desiredJobRoles?.length ?? 0) > 0, label: 'Zielrolle' },
    { filled: !!profile?.location, label: 'Standort' },
    { filled: !!profile?.seniority, label: 'Seniorität' },
    { filled: !!profile?.salaryExpectationOte, label: 'OTE Erwartung' },
    { filled: !!profile?.cvFileName, label: 'CV hochgeladen' },
    { filled: (profile?.skills?.length ?? 0) >= 5, label: 'Skills' },
    { filled: (profile?.languages?.length ?? 0) >= 1, label: 'Sprachen' },
    { filled: (profile?.desiredIndustries?.length ?? 0) >= 1, label: 'Branchen' },
  ];
  const completionScore = Math.round(
    (completionFields.filter((f) => f.filled).length / completionFields.length) * 100
  );
  const missingFields = completionFields.filter((field) => !field.filled);
  const missingCount = missingFields.length;
  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || dbUser?.displayName || 'Profilbild';

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted/60 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[30px] border border-border/70 bg-gradient-to-br from-background via-background to-primary/[0.04] shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start md:p-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Profil & Karrierepräferenzen
            </div>
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Verwalte deine wichtigsten Angaben, Karriereziele und Sales-Präferenzen in einer klaren Übersicht.
                Fehlende Kernangaben kannst du direkt ergänzen, damit Matches und Recruiter-Shortlists präziser werden.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/70 bg-background/90 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Profilstatus</p>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                  {missingCount === 0 ? <BadgeCheck className="h-4 w-4 text-emerald-600" /> : <CircleAlert className="h-4 w-4 text-amber-500" />}
                  <span>{missingCount === 0 ? 'Profil vollständig' : `${missingCount} Kernangaben fehlen`}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {missingCount === 0
                    ? 'Dein Profil ist vollständig und bereit für Bewerbungen und bessere Matches.'
                    : `Aktuell sind ${completionScore}% deiner Kernangaben hinterlegt.`}
                </p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/90 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nächster Schritt</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {missingCount === 0 ? 'Profil aktuell halten' : 'Fehlende Angaben ergänzen'}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {missingCount === 0
                    ? 'Du kannst jederzeit Details aktualisieren oder ein Profilbild ergänzen.'
                    : missingFields.slice(0, 3).map((field) => field.label).join(' · ')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/onboarding?mode=edit">
                <Button className="rounded-2xl">
                  {missingCount === 0 ? 'Profil bearbeiten' : 'Profil vervollständigen'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/candidate/jobs">
                <Button variant="outline" className="rounded-2xl">
                  Passende Jobs ansehen
                </Button>
              </Link>
            </div>
            {missingCount > 0 ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4">
                <div className="flex items-start gap-3">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-amber-900">Lass uns dein Profil vervollständigen</p>
                    <p className="mt-1 text-xs leading-5 text-amber-900/80">
                      Ergänze zuerst die wichtigsten Angaben, damit dein Profil in Matches und Bewerbungen vollständig wirkt.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {missingFields.slice(0, 4).map((field) => (
                        <span
                          key={field.label}
                          className="inline-flex items-center rounded-full border border-amber-200 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-amber-900"
                        >
                          {field.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="rounded-[28px] border border-border/70 bg-background/95 p-5 shadow-sm">
            <div className="rounded-3xl border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Profilbild</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Optional, aber hilfreich für eine persönlichere Profilansicht.
                  </p>
                </div>
                <div className="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl bg-primary/10 px-3 text-sm font-semibold text-primary">
                  {completionScore}%
                </div>
              </div>
              <div className="mt-4">
                <ProfileAvatarUploader
                  imageUrl={dbUser?.avatarUrl}
                  name={displayName}
                  compact
                  onChange={() => {
                    void refreshUser();
                  }}
                />
              </div>
            </div>
            <div className="mt-4 rounded-3xl border border-border/70 bg-background p-4">
              <div className="flex items-start gap-3">
                <PencilLine className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Schnellzugriff</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Nutze die Bereiche unten, um gezielt persönliche Daten, Dokumente oder Präferenzen zu aktualisieren.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  Persönliche Daten
                </span>
                <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  Karriereziele
                </span>
                <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  Dokumente
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CandidateProfileTabs profile={profile || {}} onProfileUpdated={setProfile} />
    </div>
  );
}
