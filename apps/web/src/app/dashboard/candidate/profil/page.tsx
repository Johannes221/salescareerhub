'use client';

import React, { useEffect, useState } from 'react';
import { CandidateProfileTabs } from '@/components/candidate-profile-tabs';
import { getIdToken } from '@/lib/auth/client';

export default function CandidateProfilePage() {
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
          <p className="text-muted-foreground mt-1">
            Verwalte deine persönlichen Daten und Karrierepräferenzen
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {missingCount === 0
              ? 'Dein Profil ist vollständig und bereit für bessere Matches.'
              : `Noch ${missingCount} ${missingCount === 1 ? 'Angabe' : 'Angaben'}, um bessere Matches zu erhalten.`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-sm font-semibold">{completionScore}%</p>
            <p className="text-xs text-muted-foreground">vollständig</p>
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-primary relative">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/60" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`${completionScore} ${100 - completionScore}`} className="text-primary" />
            </svg>
          </div>
        </div>
      </div>
      <CandidateProfileTabs profile={profile || {}} onProfileUpdated={setProfile} />
    </div>
  );
}
