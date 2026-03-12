'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getIdToken } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { APPLICATION_STATUS_LABELS } from '@/lib/config';
import { formatSalaryRange, formatRelativeDate, getPublicCompanyLabel } from '@/lib/utils';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';

type DashboardData = {
  stats: {
    applications: number;
    savedJobs: number;
    profileViews: number;
    notifications: number;
    scheduledCalls: number;
    documents: number;
  };
  analytics: {
    recentApplications: number;
    recentSavedJobs: number;
    dailyApplications: Array<{ date: string; label: string; value: number }>;
    dailySavedJobs: Array<{ date: string; label: string; value: number }>;
  };
  applications: any[];
  recruitingCalls: any[];
  notifications: any[];
  profile: any;
  stageCounts: Record<string, number>;
};

const INITIAL: DashboardData = {
  stats: { applications: 0, savedJobs: 0, profileViews: 0, notifications: 0, scheduledCalls: 0, documents: 0 },
  analytics: { recentApplications: 0, recentSavedJobs: 0, dailyApplications: [], dailySavedJobs: [] },
  applications: [],
  recruitingCalls: [],
  notifications: [],
  profile: null,
  stageCounts: {},
};

function getProfileCompletion(profile: any): { score: number; missing: string[] } {
  if (!profile) return { score: 0, missing: ['Profil anlegen'] };
  const fields: [string, string][] = [
    ['firstName', 'Vorname'],
    ['lastName', 'Nachname'],
    ['currentRole', 'Aktuelle Rolle'],
    ['targetRole', 'Zielrolle'],
    ['location', 'Standort'],
    ['seniority', 'Seniorität'],
    ['salaryExpectationOte', 'OTE Erwartung'],
    ['cvFileName', 'CV hochladen'],
  ];
  const filled = fields.filter(([key]) => {
    const val = profile[key];
    return val !== null && val !== undefined && val !== '' && val !== 0;
  });
  const missing = fields.filter(([key]) => {
    const val = profile[key];
    return val === null || val === undefined || val === '' || val === 0;
  }).map(([, label]) => label);
  return { score: Math.round((filled.length / fields.length) * 100), missing };
}

export default function CandidateDashboard() {
  const { dbUser } = useAuth();
  const [data, setData] = useState<DashboardData>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const [dashRes, jobsRes] = await Promise.all([
          fetch('/api/candidate/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/jobs?pageSize=5&sort=newest'),
        ]);
        if (dashRes.ok) {
          const p = await dashRes.json();
          setData({
            stats: p.stats || INITIAL.stats,
            analytics: p.analytics || INITIAL.analytics,
            applications: p.applications || [],
            recruitingCalls: p.recruitingCalls || [],
            notifications: p.notifications || [],
            profile: p.profile || null,
            stageCounts: p.stageCounts || {},
          });
        }
        if (jobsRes.ok) {
          const j = await jobsRes.json();
          setJobs((j.data || []).slice(0, 5));
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const { score: profileScore, missing: profileMissing } = getProfileCompletion(data.profile);
  const activeApps = data.applications.filter(
    (a: any) => !['rejected', 'withdrawn', 'hired'].includes(a.status)
  );
  const firstName = data.profile?.firstName || dbUser?.displayName?.split(' ')[0] || '';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-2xl bg-muted/60 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted/60 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-primary/3 border p-6 lg:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {firstName ? `Hallo ${firstName}` : 'Willkommen zurück'}
          </h1>
          <p className="mt-1.5 text-muted-foreground max-w-xl">
            {profileScore < 100
              ? `Dein Profil ist zu ${profileScore}% vollständig. Vervollständige es für bessere Job-Matches.`
              : activeApps.length > 0
                ? `Du hast ${activeApps.length} aktive Bewerbung${activeApps.length > 1 ? 'en' : ''} – hier sind deine nächsten Schritte.`
                : 'Entdecke passende Jobs und starte deine Karriere im Software Sales.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {profileScore < 100 && (
              <Link href="/dashboard/candidate/profil">
                <Button size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Profil vervollständigen
                </Button>
              </Link>
            )}
            <Link href="/dashboard/candidate/jobs">
              <Button variant={profileScore < 100 ? 'outline' : 'default'} size="sm" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Jobs ansehen
              </Button>
            </Link>
            {activeApps.length > 0 && (
              <Link href="/dashboard/candidate/bewerbungen">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Bewerbungsstatus prüfen
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Summary chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          <SummaryChip icon={Briefcase} label="Bewerbungen" value={data.stats.applications} />
          <SummaryChip icon={Sparkles} label="Neu (7 Tage)" value={data.analytics.recentApplications} />
          <SummaryChip icon={Target} label="Gespeichert" value={data.stats.savedJobs} />
          {data.stats.scheduledCalls > 0 && (
            <SummaryChip icon={Clock} label="Geplante Calls" value={data.stats.scheduledCalls} />
          )}
        </div>
      </section>

      {/* ── Profile completion nudge ── */}
      {profileScore < 100 && profileMissing.length > 0 && (
        <section className="rounded-xl border bg-amber-50/50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <Zap className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                Vervollständige dein Profil für bessere Matches
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Noch offen: {profileMissing.slice(0, 3).join(', ')}
                {profileMissing.length > 3 && ` und ${profileMissing.length - 3} weitere`}
              </p>
            </div>
            <Link href="/dashboard/candidate/profil">
              <Button variant="outline" size="sm" className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100">
                Ergänzen
              </Button>
            </Link>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-amber-200 overflow-hidden">
            <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${profileScore}%` }} />
          </div>
        </section>
      )}

      {/* ── Job Matches ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Passende Jobs für dich</h2>
            <p className="text-sm text-muted-foreground">Basierend auf deinem Profil und deinen Präferenzen</p>
          </div>
          <Link href="/dashboard/candidate/jobs" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            Alle Jobs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-xl border bg-background p-8 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-medium mb-1">Noch keine Jobs verfügbar</p>
            <p className="text-sm text-muted-foreground mb-4">
              Sobald neue Stellen veröffentlicht werden, findest du sie hier.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {jobs.map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.slug}`}>
                <div className="group rounded-xl border bg-background p-4 lg:p-5 hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm lg:text-base truncate group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {getPublicCompanyLabel(job)}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}{job.country ? `, ${job.country}` : ''}
                          </span>
                        )}
                        {job.remoteType && (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                            {job.remoteType === 'remote' ? 'Remote' : job.remoteType === 'hybrid' ? 'Hybrid' : 'Vor Ort'}
                          </span>
                        )}
                        {job.seniority && (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                            {job.seniority}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {(job.oteMin || job.oteMax) && (
                        <p className="text-sm font-semibold text-primary">
                          {formatSalaryRange(job.oteMin, job.oteMax)}
                        </p>
                      )}
                      {job.publishedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeDate(job.publishedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  {job.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.tags.slice(0, 4).map((tag: string) => (
                        <span key={tag} className="inline-flex items-center rounded-full bg-primary/5 text-primary px-2 py-0.5 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Application Pipeline ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Deine Bewerbungen</h2>
            <p className="text-sm text-muted-foreground">
              {activeApps.length > 0
                ? `${activeApps.length} aktive${activeApps.length > 1 ? ' Prozesse' : 'r Prozess'}`
                : 'Übersicht deiner Bewerbungen'}
            </p>
          </div>
          {data.applications.length > 0 && (
            <Link href="/dashboard/candidate/bewerbungen" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              Alle anzeigen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {data.applications.length === 0 ? (
          <div className="rounded-xl border bg-background p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-medium mb-1">Noch keine Bewerbungen</p>
            <p className="text-sm text-muted-foreground mb-4">
              Starte deine ersten Bewerbungen über den Job-Bereich.
            </p>
            <Link href="/dashboard/candidate/jobs">
              <Button size="sm" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Jobs entdecken
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border bg-background overflow-hidden divide-y">
            {data.applications.slice(0, 5).map((app: any) => (
              <div key={app.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{app.job?.title || 'Job'}</p>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getPublicCompanyLabel(app.job)}
                    {app.createdAt && ` · ${formatRelativeDate(app.createdAt)}`}
                  </p>
                </div>
                <Link
                  href={`/jobs/${app.job?.slug || ''}`}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
            {data.applications.length > 5 && (
              <Link
                href="/dashboard/candidate/bewerbungen"
                className="flex items-center justify-center gap-1 py-3 text-sm font-medium text-primary hover:bg-muted/30 transition-colors"
              >
                Alle {data.applications.length} Bewerbungen anzeigen
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ── Insights Teaser ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Markt & Karriere Insights</h2>
            <p className="text-sm text-muted-foreground">Gehälter, Trends und Tipps für Sales Professionals</p>
          </div>
          <Link href="/dashboard/candidate/insights" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            Alle Insights <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InsightTeaser
            icon={TrendingUp}
            title="Gehaltsreport 2025"
            description="Aktuelle Base & OTE Benchmarks für SDR bis VP Sales im DACH-Raum"
            href="/dashboard/candidate/insights"
          />
          <InsightTeaser
            icon={Target}
            title="Sales Hiring Trends"
            description="Welche Rollen und Segmente wachsen – und wo die Nachfrage sinkt"
            href="/dashboard/candidate/insights"
          />
          <InsightTeaser
            icon={CheckCircle2}
            title="Interview Vorbereitung"
            description="Die häufigsten Sales Interview Fragen und wie du dich optimal vorbereitest"
            href="/dashboard/candidate/insights"
            className="hidden lg:block"
          />
        </div>
      </section>
    </div>
  );
}

function SummaryChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-background/80 border px-3 py-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function InsightTeaser({
  icon: Icon,
  title,
  description,
  href,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      <div className="group rounded-xl border bg-background p-5 h-full hover:shadow-md hover:border-primary/20 transition-all">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 mb-3">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
