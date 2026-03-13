'use client';

import React, { useEffect, useState } from 'react';
import { CandidateProfileTabs } from '@/components/candidate-profile-tabs';
import { ProfileAvatarUploader } from '@/components/profile-avatar-uploader';
import { getIdToken } from '@/lib/auth/client';
import { useAuth } from '@/lib/auth-context';
import { BadgeCheck, CircleAlert, Sparkles } from 'lucide-react';

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
  const missingCount = completionFields.filter((field) => !field.filled).length;
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
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_0.6fr] md:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Profil & Karrierepräferenzen
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Verwalte deine persönlichen Daten, Sales-Erfahrung und Präferenzen in einer klaren Übersicht.
                Je vollständiger dein Profil ist, desto präziser werden Matches und Recruiter-Shortlists.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-border/70 bg-background/90 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                  {missingCount === 0 ? <BadgeCheck className="h-4 w-4 text-emerald-600" /> : <CircleAlert className="h-4 w-4 text-amber-500" />}
                  <span>{missingCount === 0 ? 'Profil vollständig' : `${missingCount} Angaben fehlen noch`}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/90 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Matching</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {completionScore >= 80 ? 'Sehr gute Grundlage' : completionScore >= 60 ? 'Gut aufgestellt' : 'Noch ausbaufähig'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-border/70 bg-background/90 p-5">
            <div className="mb-5 rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-semibold">Profilbild</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Optional, aber hilfreich für eine persönlichere Profilansicht.
              </p>
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Profil-Fortschritt</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {missingCount === 0
                    ? 'Alles ausgefüllt. Dein Profil ist bereit für bessere Matches.'
                    : `Noch ${missingCount} ${missingCount === 1 ? 'Angabe' : 'Angaben'} bis zum vollständigen Profil.`}
                </p>
              </div>
              <div className="relative h-14 w-14 shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/50" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${completionScore} ${100 - completionScore}`} className="text-primary" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{completionScore}%</div>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completionScore}%` }} />
            </div>
            <div className="mt-4 space-y-2">
              {completionFields.filter((field) => !field.filled).slice(0, 3).map((field) => (
                <div key={field.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CircleAlert className="h-3.5 w-3.5 text-amber-500" />
                  <span>{field.label} ergänzen</span>
                </div>
              ))}
              {missingCount === 0 && (
                <div className="flex items-center gap-2 text-xs text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  <span>Alle Kernangaben sind vorhanden.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CandidateProfileTabs profile={profile || {}} onProfileUpdated={setProfile} />
    </div>
  );
}
