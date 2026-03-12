'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CandidateOnboardingWizard } from '@/components/candidate-onboarding-wizard';
import { Button } from '@/components/ui/button';
import { getIdToken } from '@/lib/auth/client';
import { useAuth } from '@/lib/auth-context';
import { SENIORITY_LABELS } from '@/lib/config';
import { formatCurrency } from '@/lib/utils';
import {
  ChevronRight,
  FileText,
  Globe,
  Shield,
  Target,
  TrendingUp,
  Upload,
  User,
} from 'lucide-react';

type MetricsForm = {
  averageDealSize: string;
  largestDealClosed: string;
  averageSalesCycle: string;
  salesMotionExperience: string;
  industriesExperience: string;
  territorySize: string;
};

const INITIAL_METRICS: MetricsForm = {
  averageDealSize: '',
  largestDealClosed: '',
  averageSalesCycle: '',
  salesMotionExperience: '',
  industriesExperience: '',
  territorySize: '',
};

export default function CandidateProfilePage() {
  const { dbUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<MetricsForm>(INITIAL_METRICS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getIdToken();
        const res = await fetch('/api/candidate/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const payload = await res.json();
        const p = payload.profile || {};
        setProfile(p);
        setMetrics({
          averageDealSize: p.averageDealSize ? String(p.averageDealSize) : '',
          largestDealClosed: p.largestDealClosed ? String(p.largestDealClosed) : '',
          averageSalesCycle: p.averageSalesCycle ? String(p.averageSalesCycle) : '',
          salesMotionExperience: Array.isArray(p.salesMotionExperience)
            ? p.salesMotionExperience.join(', ')
            : p.salesMotionExperience || '',
          industriesExperience: Array.isArray(p.industriesExperience)
            ? p.industriesExperience.join(', ')
            : '',
          territorySize: p.territorySize || '',
        });
      } catch {} finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSaveMetrics = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const token = await getIdToken();
      const res = await fetch('/api/candidate/profile/metrics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          averageDealSize: metrics.averageDealSize,
          largestDealClosed: metrics.largestDealClosed,
          averageSalesCycle: metrics.averageSalesCycle,
          salesMotionExperience: metrics.salesMotionExperience,
          industriesExperience: metrics.industriesExperience
            .split(',')
            .map((v: string) => v.trim())
            .filter(Boolean),
          territorySize: metrics.territorySize,
        }),
      });
      if (!res.ok) {
        const p = await res.json().catch(() => null);
        setError(p?.error || 'Fehler beim Speichern');
        return;
      }
      setMessage('Sales Metrics gespeichert.');
      setActiveSection(null);
    } catch {
      setError('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const completionFields = [
    { filled: !!profile?.firstName, label: 'Vorname' },
    { filled: !!profile?.lastName, label: 'Nachname' },
    { filled: !!profile?.currentRole, label: 'Aktuelle Rolle' },
    { filled: !!profile?.targetRole || (profile?.desiredJobRoles?.length ?? 0) > 0, label: 'Zielrolle' },
    { filled: !!profile?.location, label: 'Standort' },
    { filled: !!profile?.seniority, label: 'Seniorität' },
    { filled: !!profile?.salaryExpectationOte, label: 'OTE Erwartung' },
    { filled: !!profile?.cvFileName, label: 'CV hochgeladen' },
    { filled: !!profile?.averageDealSize, label: 'Deal Size' },
    { filled: (profile?.skills?.length ?? 0) >= 3, label: 'Skills' },
  ];
  const completionScore = Math.round(
    (completionFields.filter((f) => f.filled).length / completionFields.length) * 100
  );

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

      {/* Onboarding wizard (reused for core profile editing) */}
      <CandidateOnboardingWizard entryPoint="profile" />

      {/* Profile sections */}
      <div className="space-y-4">
        {/* Personal Data */}
        <ProfileSection
          icon={User}
          title="Persönliche Daten"
          description="Name, Kontakt, Standort"
          items={[
            { label: 'Name', value: [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || '–' },
            { label: 'E-Mail', value: dbUser?.email || '–' },
            { label: 'Telefon', value: profile?.phone || '–' },
            { label: 'LinkedIn', value: profile?.linkedinUrl ? 'Hinterlegt' : '–' },
            { label: 'Standort', value: [profile?.location, profile?.country].filter(Boolean).join(', ') || '–' },
          ]}
        />

        {/* Career Goals */}
        <ProfileSection
          icon={Target}
          title="Karriereziele"
          description="Zielrollen, OTE, Standortpräferenzen"
          items={[
            { label: 'Zielrolle', value: profile?.targetRole || profile?.desiredJobRoles?.join(', ') || '–' },
            { label: 'Arbeitsmodell', value: profile?.remotePreference?.join(', ') || '–' },
            { label: 'Seniorität', value: profile?.seniority ? ((SENIORITY_LABELS as Record<string, string>)[profile.seniority] || profile.seniority) : '–' },
            { label: 'Base Erwartung', value: profile?.salaryExpectationBase ? formatCurrency(profile.salaryExpectationBase) : '–' },
            { label: 'OTE Erwartung', value: profile?.salaryExpectationOte ? formatCurrency(profile.salaryExpectationOte) : '–' },
            { label: 'Karriereziele', value: profile?.careerGoals?.join(', ') || '–' },
          ]}
        />

        {/* Sales Experience (collapsible metrics edit) */}
        <div className="rounded-xl border bg-background">
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'metrics' ? null : 'metrics')}
            className="flex w-full items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Sales Erfahrung</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Deal Size, Sales Cycle, Industries, Motion</p>
            </div>
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === 'metrics' ? 'rotate-90' : ''}`} />
          </button>
          {activeSection === 'metrics' && (
            <div className="border-t px-5 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricField label="Average Deal Size (€)" value={metrics.averageDealSize} onChange={(v) => setMetrics((p) => ({ ...p, averageDealSize: v }))} type="number" />
                <MetricField label="Largest Deal Closed (€)" value={metrics.largestDealClosed} onChange={(v) => setMetrics((p) => ({ ...p, largestDealClosed: v }))} type="number" />
                <MetricField label="Average Sales Cycle (Tage)" value={metrics.averageSalesCycle} onChange={(v) => setMetrics((p) => ({ ...p, averageSalesCycle: v }))} type="number" />
                <MetricField label="Territory Size" value={metrics.territorySize} onChange={(v) => setMetrics((p) => ({ ...p, territorySize: v }))} placeholder="z.B. DACH, Named Accounts" />
                <MetricField label="Sales Motion" value={metrics.salesMotionExperience} onChange={(v) => setMetrics((p) => ({ ...p, salesMotionExperience: v }))} placeholder="SMB, Mid-Market, Enterprise" className="sm:col-span-2" />
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Industries</label>
                  <textarea
                    value={metrics.industriesExperience}
                    onChange={(e) => setMetrics((p) => ({ ...p, industriesExperience: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="SaaS, FinTech, Cyber Security"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {message && <p className="text-sm text-green-700">{message}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setActiveSection(null)}>Abbrechen</Button>
                <Button size="sm" onClick={handleSaveMetrics} disabled={saving}>
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Documents */}
        <ProfileSection
          icon={FileText}
          title="Dokumente"
          description="Lebenslauf und Bewerbungsunterlagen"
          items={[{ label: 'CV', value: profile?.cvFileName || 'Noch nicht hochgeladen' }]}
          action={
            <Link href="/dashboard/candidate/dokumente">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Verwalten
              </Button>
            </Link>
          }
        />

        {/* Preferences */}
        <ProfileSection
          icon={Globe}
          title="Präferenzen"
          description="Branchen, Skills, Sprachen"
          items={[
            { label: 'Wunsch-Branchen', value: profile?.desiredIndustries?.join(', ') || '–' },
            { label: 'Skills', value: profile?.skills?.slice(0, 5).join(', ') || '–' },
            { label: 'Sprachen', value: profile?.languages?.join(', ') || '–' },
            { label: 'Erfahrung', value: profile?.yearsOfExperience != null ? `${profile.yearsOfExperience} Jahre` : '–' },
          ]}
        />

        {/* Settings link */}
        <Link href="/dashboard/candidate/einstellungen">
          <div className="rounded-xl border bg-background p-5 hover:bg-muted/30 transition-colors flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Datenschutz & Einstellungen</h3>
              <p className="text-xs text-muted-foreground mt-0.5">DSGVO, Datenexport, Konto löschen</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function ProfileSection({
  icon: Icon,
  title,
  description,
  items,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  items: { label: string; value: string }[];
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-medium mt-0.5 truncate">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={type === 'number' ? 0 : undefined}
        className="w-full h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
      />
    </div>
  );
}
