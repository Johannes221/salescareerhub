'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getIdToken } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { APPLICATION_STATUS_LABELS, RECRUITING_CALL_TYPE_LABELS, RECRUITING_CALL_TYPES } from '@/lib/config';
import { getCandidateApplicationStageVariant } from '@/lib/utils';
import {
  Bell,
  Briefcase,
  Calendar,
  ExternalLink,
  FileText,
  Heart,
  LineChart,
  Sparkles,
  Upload,
  User,
} from 'lucide-react';

type CandidateDashboardData = {
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

const INITIAL_DATA: CandidateDashboardData = {
  stats: { applications: 0, savedJobs: 0, profileViews: 0, notifications: 0, scheduledCalls: 0, documents: 0 },
  analytics: { recentApplications: 0, recentSavedJobs: 0, dailyApplications: [], dailySavedJobs: [] },
  applications: [],
  recruitingCalls: [],
  notifications: [],
  profile: null,
  stageCounts: { Applied: 0, Screening: 0, 'Intro Sent': 0, Rejected: 0, Hired: 0 },
};

export default function CandidateDashboard() {
  const { dbUser } = useAuth();
  const [data, setData] = useState<CandidateDashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    callType: 'intro_call',
    scheduledTime: '',
    notes: '',
  });
  const [bookingState, setBookingState] = useState({ loading: false, error: '', success: '' });

  const loadDashboard = async () => {
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
          recruitingCalls: payload.recruitingCalls || [],
          notifications: payload.notifications || [],
          profile: payload.profile || null,
          stageCounts: payload.stageCounts || INITIAL_DATA.stageCounts,
        });
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const nextCall = useMemo(
    () => data.recruitingCalls.find((call) => new Date(call.scheduledTime).getTime() > Date.now()) || null,
    [data.recruitingCalls],
  );

  const handleBookCall = async () => {
    setBookingState({ loading: true, error: '', success: '' });
    try {
      const token = await getIdToken();
      const res = await fetch('/api/recruiting-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(booking),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setBookingState({
          loading: false,
          error: payload?.error || 'Recruiting Call konnte nicht gebucht werden',
          success: '',
        });
        return;
      }

      setBooking({ callType: 'intro_call', scheduledTime: '', notes: '' });
      setBookingState({ loading: false, error: '', success: 'Recruiting Call erfolgreich gebucht.' });
      await loadDashboard();
    } catch {
      setBookingState({ loading: false, error: 'Recruiting Call konnte nicht gebucht werden', success: '' });
    }
  };

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
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              { label: 'Bewerbungen', value: data.stats.applications, icon: FileText, color: 'text-blue-600' },
              { label: 'Gespeicherte Jobs', value: data.stats.savedJobs, icon: Heart, color: 'text-red-500' },
              { label: 'Neue Bewerbungen (7T)', value: data.analytics.recentApplications, icon: Sparkles, color: 'text-green-600' },
              { label: 'Benachrichtigungen', value: data.stats.notifications, icon: Bell, color: 'text-yellow-600' },
              { label: 'Recruiting Calls', value: data.stats.scheduledCalls, icon: Calendar, color: 'text-indigo-600' },
              { label: 'Dokumente', value: data.stats.documents, icon: Upload, color: 'text-purple-600' },
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

          <div className="mb-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Overview</CardTitle>
                <CardDescription>Persönliche Daten, CV und Sales Metrics auf einen Blick</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/20 p-4">
                  <div>
                    <p className="text-lg font-semibold">
                      {data.profile?.firstName} {data.profile?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.profile?.currentRole || 'Rolle ergänzen'}
                      {data.profile?.location ? ` · ${data.profile.location}` : ''}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {data.profile?.seniority || 'Profil offen'}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Zielrolle</p>
                    <p className="mt-1 font-medium">{data.profile?.targetRole || 'Noch nicht hinterlegt'}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">CV</p>
                    <p className="mt-1 font-medium">{data.profile?.cvFileName || 'Noch kein CV hochgeladen'}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Average Deal Size</p>
                    <p className="mt-1 font-medium">{data.profile?.averageDealSize ? `${data.profile.averageDealSize.toLocaleString('de-DE')} €` : 'Nicht hinterlegt'}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Sales Motion</p>
                    <p className="mt-1 font-medium">{data.profile?.salesMotionExperience || 'Nicht hinterlegt'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href="/dashboard/candidate/profil">
                    <Button variant="outline">
                      <User className="mr-2 h-4 w-4" />
                      Personal Information bearbeiten
                    </Button>
                  </Link>
                  <Link href="/dashboard/candidate/dokumente">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      CV hochladen
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Status</CardTitle>
                <CardDescription>Alle Bewerbungen nach aktuellem Prozessschritt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(data.stageCounts).map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-lg font-semibold">{count}</span>
                  </div>
                ))}
                {nextCall && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="text-sm font-medium">Nächster Recruiting Call</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {nextCall.label} · {new Date(nextCall.scheduledTime).toLocaleString('de-DE')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applications</CardTitle>
                <CardDescription>Alle beworbenen Jobs mit aktuellem Status</CardDescription>
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
                      <div key={app.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{app.job?.title || 'Job'}</p>
                            <p className="text-sm text-muted-foreground">
                              {app.job?.industry || 'Sales Rolle'}{app.job?.location ? ` · ${app.job.location}` : ''}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={getCandidateApplicationStageVariant(app.status) as any}>
                              {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS] || app.status}
                            </Badge>
                            <Link href={`/jobs/${app.job?.slug || ''}`} className="text-xs text-primary hover:underline">
                              Job öffnen
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Schedule Recruiting Call</CardTitle>
                  <CardDescription>Buche Intro Call, Career Advice oder Interview Preparation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Call Type</label>
                    <select
                      value={booking.callType}
                      onChange={(e) => setBooking((current) => ({ ...current, callType: e.target.value }))}
                      className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      {RECRUITING_CALL_TYPES.map((callType: (typeof RECRUITING_CALL_TYPES)[number]) => (
                        <option key={callType} value={callType}>
                          {RECRUITING_CALL_TYPE_LABELS[callType]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wunschtermin</label>
                    <input
                      type="datetime-local"
                      value={booking.scheduledTime}
                      onChange={(e) => setBooking((current) => ({ ...current, scheduledTime: e.target.value }))}
                      className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notizen</label>
                    <textarea
                      value={booking.notes}
                      onChange={(e) => setBooking((current) => ({ ...current, notes: e.target.value }))}
                      rows={3}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="Wobei brauchst du Unterstützung?"
                    />
                  </div>

                  {bookingState.error && <p className="text-sm text-destructive">{bookingState.error}</p>}
                  {bookingState.success && <p className="text-sm text-green-700">{bookingState.success}</p>}

                  <Button className="w-full" onClick={handleBookCall} disabled={bookingState.loading || !booking.scheduledTime}>
                    {bookingState.loading ? 'Wird gebucht...' : 'Recruiting Call buchen'}
                    <Calendar className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recruiting Calls</CardTitle>
                  <CardDescription>Alle geplanten Calls inklusive Kalender-Link</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recruitingCalls.length === 0 ? (
                    <EmptyState
                      title="Noch keine Calls geplant"
                      description="Buche deinen ersten Recruiting Call direkt im Dashboard."
                      icon={Calendar}
                    />
                  ) : (
                    <div className="space-y-3">
                      {data.recruitingCalls.map((call: any) => (
                        <div key={call.id} className="rounded-lg border p-3">
                          <p className="font-medium">{call.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(call.scheduledTime).toLocaleString('de-DE')}
                          </p>
                          {call.calendarUrl && (
                            <button
                              type="button"
                              onClick={() => window.open(call.calendarUrl, '_blank', 'noopener,noreferrer')}
                              className="mt-2 inline-flex items-center text-xs font-medium text-primary hover:underline"
                            >
                              Zum Kalender hinzufügen
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>Statusänderungen und neue Recruiting Updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.notifications.length === 0 ? (
                    <EmptyState
                      title="Noch keine Benachrichtigungen"
                      description="Sobald sich ein Status ändert oder ein Call geplant ist, erscheint hier ein Update."
                      icon={Bell}
                    />
                  ) : (
                    <div className="space-y-3">
                      {data.notifications.map((notification: any) => (
                        <div key={notification.id} className="rounded-lg border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                            {!notification.isRead && <Badge variant="warning">Neu</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Momentum</CardTitle>
                <CardDescription>Dein letzter Aktivitätssnapshot</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <LineChart className="h-4 w-4 text-primary" />
                    <span className="text-lg font-semibold">{data.analytics.recentApplications}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Neue Bewerbungen in 7 Tagen</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-lg font-semibold">{data.analytics.recentSavedJobs}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Neue gemerkte Jobs</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sales Metrics</CardTitle>
                <CardDescription>Wichtigste Leistungsdaten für dein Profil</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Largest Deal Closed</p>
                  <p className="mt-1 font-medium">{data.profile?.largestDealClosed ? `${data.profile.largestDealClosed.toLocaleString('de-DE')} €` : 'Nicht hinterlegt'}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Average Sales Cycle</p>
                  <p className="mt-1 font-medium">{data.profile?.averageSalesCycle ? `${data.profile.averageSalesCycle} Tage` : 'Nicht hinterlegt'}</p>
                </div>
                <div className="rounded-lg border p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Industries</p>
                  <p className="mt-1 font-medium">
                    {data.profile?.industriesExperience?.length ? data.profile.industriesExperience.join(', ') : 'Nicht hinterlegt'}
                  </p>
                </div>
                <Link href="/dashboard/candidate/profil" className="sm:col-span-2">
                  <Button variant="outline" className="w-full">
                    Sales Metrics aktualisieren
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
