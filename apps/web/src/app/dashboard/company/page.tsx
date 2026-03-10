'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getIdToken } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalyticsBars } from '@/components/ui/analytics-bars';
import { EmptyState } from '@/components/ui/empty-state';
import { JOB_STATUS_LABELS } from '@/lib/config';
import { BarChart3, Briefcase, Building2, Eye, FileText, Plus, Settings, TrendingUp, Users } from 'lucide-react';

type CompanyDashboardData = {
  stats: {
    totalJobs: number;
    liveJobs: number;
    totalApplications: number;
    profileViews: number;
    jobViews: number;
  };
  analytics: {
    recentJobViews: number;
    recentProfileViews: number;
    recentApplications: number;
    dailyJobViews: Array<{ date: string; label: string; value: number }>;
    dailyApplications: Array<{ date: string; label: string; value: number }>;
  };
  jobs: any[];
};

const INITIAL_DATA: CompanyDashboardData = {
  stats: { totalJobs: 0, liveJobs: 0, totalApplications: 0, profileViews: 0, jobViews: 0 },
  analytics: {
    recentJobViews: 0,
    recentProfileViews: 0,
    recentApplications: 0,
    dailyJobViews: [],
    dailyApplications: [],
  },
  jobs: [],
};

export default function CompanyDashboard() {
  const [data, setData] = useState<CompanyDashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getIdToken();
        if (!token) return;

        const res = await fetch('/api/company/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const payload = await res.json();
          setData({
            stats: payload.stats || INITIAL_DATA.stats,
            analytics: payload.analytics || INITIAL_DATA.analytics,
            jobs: payload.jobs || [],
          });
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboardData();
  }, []);

  const sidebarItems = [
    { href: '/dashboard/company', label: 'Übersicht', icon: BarChart3, active: true },
    { href: '/dashboard/company/jobs', label: 'Jobs verwalten', icon: Briefcase },
    { href: '/dashboard/company/jobs/neu', label: 'Job erstellen', icon: Plus },
    { href: '/dashboard/company/bewerbungen', label: 'Bewerbungen', icon: FileText },
    { href: '/dashboard/company/profil', label: 'Unternehmensprofil', icon: Building2 },
    { href: '/dashboard/company/einstellungen', label: 'Einstellungen', icon: Settings },
  ];

  return (
    <div className="container py-8">
      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Unternehmens-Dashboard</h1>
              <p className="text-muted-foreground">Verwalte deine Jobs und Bewerbungen</p>
            </div>
            <Link href="/dashboard/company/jobs/neu">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Job erstellen
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
              <div className="h-80 rounded-lg bg-muted animate-pulse" />
            </div>
          ) : (
            <>
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {[
                  { label: 'Gesamt Jobs', value: data.stats.totalJobs, icon: Briefcase, color: 'text-blue-600' },
                  { label: 'Live Jobs', value: data.stats.liveJobs, icon: Eye, color: 'text-green-600' },
                  { label: 'Bewerbungen', value: data.stats.totalApplications, icon: Users, color: 'text-purple-600' },
                  { label: 'Profil-Aufrufe', value: data.stats.profileViews, icon: Building2, color: 'text-yellow-600' },
                  { label: 'Job-Aufrufe', value: data.stats.jobViews, icon: TrendingUp, color: 'text-indigo-600' },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="pt-6">
                      <div className="mb-2 flex items-center justify-between">
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        <span className="text-2xl font-bold">{stat.value}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mb-8 grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance der letzten 7 Tage</CardTitle>
                    <CardDescription>Echte Aufrufe und eingehende Bewerbungen pro Tag</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Job-Aufrufe', value: data.analytics.recentJobViews, icon: Eye },
                        { label: 'Profil-Aufrufe', value: data.analytics.recentProfileViews, icon: Building2 },
                        { label: 'Neue Bewerbungen', value: data.analytics.recentApplications, icon: FileText },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg border bg-muted/20 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <item.icon className="h-4 w-4 text-primary" />
                            <span className="text-lg font-semibold">{item.value}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    {data.analytics.dailyJobViews.some((point) => point.value > 0) ? (
                      <AnalyticsBars points={data.analytics.dailyJobViews} />
                    ) : (
                      <EmptyState
                        title="Noch keine Aufrufdaten"
                        description="Sobald Kandidaten deine Jobs oder dein Unternehmensprofil ansehen, erscheint hier der Tagesverlauf."
                        icon={BarChart3}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bewerbungstrend</CardTitle>
                    <CardDescription>Neue Bewerbungen pro Tag in den letzten 7 Tagen</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.analytics.dailyApplications.some((point) => point.value > 0) ? (
                      <AnalyticsBars points={data.analytics.dailyApplications} barClassName="bg-green-600/80" />
                    ) : (
                      <EmptyState
                        title="Noch keine Bewerbungen im Zeitraum"
                        description="Sobald Bewerbungen auf deine Jobs eingehen, siehst du hier die Entwicklung pro Tag."
                        icon={Users}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deine Jobs</CardTitle>
                  <CardDescription>Übersicht deiner Stellenanzeigen</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.jobs.length === 0 ? (
                    <EmptyState
                      title="Du hast noch keine Jobs erstellt"
                      description="Veröffentliche deine erste Stelle, um Bewerbungen und Analytics in deinem Dashboard zu sehen."
                      icon={Briefcase}
                      action={
                        <Link href="/dashboard/company/jobs/neu">
                          <Button>Ersten Job erstellen</Button>
                        </Link>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {data.jobs.map((job: any) => (
                        <div key={job.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.roleCategory} · {job.location || 'Remote'} · {job.viewCount || 0} Aufrufe
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{job._count?.applications || 0} Bewerbungen</span>
                            <Badge
                              variant={
                                job.status === 'live'
                                  ? 'success'
                                  : job.status === 'pending_review'
                                    ? 'warning'
                                    : 'secondary'
                              }
                            >
                              {JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS] || job.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
