'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getIdToken } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalyticsBars } from '@/components/ui/analytics-bars';
import { EmptyState } from '@/components/ui/empty-state';
import { APPLICATION_STATUS_LABELS } from '@/lib/config';
import { getPublicCompanyLabel } from '@/lib/utils';
import { Bell, Briefcase, FileText, Heart, Sparkles } from 'lucide-react';

type CandidateDashboardData = {
  stats: {
    applications: number;
    savedJobs: number;
    profileViews: number;
    notifications: number;
  };
  analytics: {
    recentApplications: number;
    recentSavedJobs: number;
    dailyApplications: Array<{ date: string; label: string; value: number }>;
    dailySavedJobs: Array<{ date: string; label: string; value: number }>;
  };
  applications: any[];
};

const INITIAL_DATA: CandidateDashboardData = {
  stats: { applications: 0, savedJobs: 0, profileViews: 0, notifications: 0 },
  analytics: { recentApplications: 0, recentSavedJobs: 0, dailyApplications: [], dailySavedJobs: [] },
  applications: [],
};

export default function CandidateDashboard() {
  const { dbUser } = useAuth();
  const [data, setData] = useState<CandidateDashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getIdToken();
        if (!token) return;

        const res = await fetch('/api/candidate/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const payload = await res.json();
          setData({
            stats: payload.stats || INITIAL_DATA.stats,
            analytics: payload.analytics || INITIAL_DATA.analytics,
            applications: payload.applications || [],
          });
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboardData();
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Willkommen zurück{dbUser?.displayName ? `, ${dbUser.displayName}` : ''}!</h1>
        <p className="text-muted-foreground">Hier ist dein Karriere-Dashboard.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-72 rounded-lg bg-muted animate-pulse" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Bewerbungen', value: data.stats.applications, icon: FileText, color: 'text-blue-600' },
              { label: 'Gespeicherte Jobs', value: data.stats.savedJobs, icon: Heart, color: 'text-red-500' },
              { label: 'Neue Bewerbungen (7T)', value: data.analytics.recentApplications, icon: Sparkles, color: 'text-green-600' },
              { label: 'Benachrichtigungen', value: data.stats.notifications, icon: Bell, color: 'text-yellow-600' },
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
                <CardTitle className="text-lg">Deine Aktivität der letzten 7 Tage</CardTitle>
                <CardDescription>Bewerbungen und gespeicherte Jobs pro Tag</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-lg font-semibold">{data.analytics.recentApplications}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Neue Bewerbungen</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Heart className="h-4 w-4 text-primary" />
                      <span className="text-lg font-semibold">{data.analytics.recentSavedJobs}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Neue Saves</p>
                  </div>
                </div>

                {data.analytics.dailyApplications.some((point) => point.value > 0) ? (
                  <AnalyticsBars points={data.analytics.dailyApplications} />
                ) : (
                  <EmptyState
                    title="Noch keine neue Aktivität"
                    description="Sobald du dich auf Jobs bewirbst oder Stellen speicherst, erscheint hier dein Tagesverlauf."
                    icon={Sparkles}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gespeicherte Jobs pro Tag</CardTitle>
                <CardDescription>Deine gemerkten Stellen der letzten 7 Tage</CardDescription>
              </CardHeader>
              <CardContent>
                {data.analytics.dailySavedJobs.some((point) => point.value > 0) ? (
                  <AnalyticsBars points={data.analytics.dailySavedJobs} barClassName="bg-red-500/80" />
                ) : (
                  <EmptyState
                    title="Noch keine gespeicherten Jobs"
                    description="Markiere interessante Stellen, damit du sie schneller wiederfindest und hier ihren Verlauf siehst."
                    icon={Heart}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aktuelle Bewerbungen</CardTitle>
              <CardDescription>Deine letzten Interessenbekundungen und deren Status</CardDescription>
            </CardHeader>
            <CardContent>
              {data.applications.length === 0 ? (
                <EmptyState
                  title="Du hast noch kein Interesse an Jobs bekundet"
                  description="Entdecke passende Sales-Rollen und starte deine ersten Bewerbungen direkt über das Job-Board."
                  icon={Briefcase}
                  action={
                    <Link href="/jobs">
                      <Button>Jobs entdecken</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {data.applications.map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{app.job?.title || 'Job'}</p>
                        <p className="text-sm text-muted-foreground">{getPublicCompanyLabel(app.job)}</p>
                      </div>
                      <Badge
                        variant={
                          app.status === 'rejected'
                            ? 'destructive'
                            : app.status === 'hired'
                              ? 'success'
                              : 'secondary'
                        }
                      >
                        {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS] || app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
