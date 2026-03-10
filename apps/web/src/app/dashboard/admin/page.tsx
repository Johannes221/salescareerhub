'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getIdToken } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsBars } from '@/components/ui/analytics-bars';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Activity,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Cog,
  FileText,
  Heart,
  Mail,
  Shield,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

type DashboardStats = {
  totalUsers: number;
  totalJobs: number;
  pendingJobs: number;
  totalCompanies: number;
  totalCandidates: number;
  totalApplications: number;
  pendingReviews: number;
  totalLeads: number;
  analytics: {
    recentJobViews: number;
    recentCompanyViews: number;
    recentSavedJobs: number;
    recentApplications: number;
    dailyActivity: Array<{ date: string; label: string; value: number }>;
  };
};

const INITIAL_STATS: DashboardStats = {
  totalUsers: 0,
  totalJobs: 0,
  pendingJobs: 0,
  totalCompanies: 0,
  totalCandidates: 0,
  totalApplications: 0,
  pendingReviews: 0,
  totalLeads: 0,
  analytics: {
    recentJobViews: 0,
    recentCompanyViews: 0,
    recentSavedJobs: 0,
    recentApplications: 0,
    dailyActivity: [],
  },
};

export default function AdminDashboard() {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getIdToken();
        if (!token) return;

        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data.data || INITIAL_STATS);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  const sidebarItems = [
    { href: '/dashboard/admin', label: 'Dashboard', icon: BarChart3, active: true },
    { href: '/dashboard/admin/users', label: 'Nutzer', icon: Users },
    { href: '/dashboard/admin/companies', label: 'Unternehmen', icon: Building2 },
    { href: '/dashboard/admin/candidates', label: 'Kandidaten', icon: Users },
    { href: '/dashboard/admin/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/admin/applications', label: 'Bewerbungen', icon: FileText },
    { href: '/dashboard/admin/reviews', label: 'Reviews', icon: Star },
    { href: '/dashboard/admin/salary', label: 'Salary Data', icon: TrendingUp },
    { href: '/dashboard/admin/rankings', label: 'Rankings', icon: BarChart3 },
    { href: '/dashboard/admin/content', label: 'Content', icon: BookOpen },
    { href: '/dashboard/admin/leads', label: 'Leads', icon: Mail },
    { href: '/dashboard/admin/logs', label: 'Logs', icon: Activity },
    { href: '/dashboard/admin/settings', label: 'Einstellungen', icon: Cog },
  ];

  if (dbUser?.role !== 'admin') {
    return (
      <div className="container py-16 text-center">
        <Shield className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Zugriff verweigert</h1>
        <p className="text-muted-foreground">Du hast keinen Zugriff auf den Admin-Bereich.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="mb-4 flex items-center gap-2 px-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Admin</span>
          </div>
          <nav className="space-y-0.5">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  item.active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Plattform-Übersicht und Verwaltung</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
              <div className="h-72 rounded-lg bg-muted animate-pulse" />
            </div>
          ) : (
            <>
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: 'Nutzer', value: stats.totalUsers, icon: Users, color: 'text-blue-600' },
                  { label: 'Unternehmen', value: stats.totalCompanies, icon: Building2, color: 'text-green-600' },
                  { label: 'Kandidaten', value: stats.totalCandidates, icon: Users, color: 'text-purple-600' },
                  { label: 'Jobs (gesamt)', value: stats.totalJobs, icon: Briefcase, color: 'text-yellow-600' },
                  { label: 'Jobs (pending)', value: stats.pendingJobs, icon: Briefcase, color: 'text-orange-600' },
                  { label: 'Bewerbungen', value: stats.totalApplications, icon: FileText, color: 'text-indigo-600' },
                  { label: 'Pending Reviews', value: stats.pendingReviews, icon: Star, color: 'text-red-600' },
                  { label: 'Leads', value: stats.totalLeads, icon: Mail, color: 'text-teal-600' },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="pb-4 pt-4">
                      <div className="mb-1 flex items-center justify-between">
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-xl font-bold">{stat.value}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mb-4 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analytics der letzten 7 Tage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        { label: 'Job-Aufrufe', value: stats.analytics.recentJobViews, icon: Briefcase },
                        { label: 'Company Views', value: stats.analytics.recentCompanyViews, icon: Building2 },
                        { label: 'Job Saves', value: stats.analytics.recentSavedJobs, icon: Heart },
                        { label: 'Neue Bewerbungen', value: stats.analytics.recentApplications, icon: FileText },
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

                    {stats.analytics.dailyActivity.some((point) => point.value > 0) ? (
                      <AnalyticsBars points={stats.analytics.dailyActivity} />
                    ) : (
                      <EmptyState
                        title="Noch keine Aktivität im Zeitraum"
                        description="Sobald Job-Aufrufe, Company-Views, Saves oder Bewerbungen eingehen, erscheinen sie hier als Tagesverlauf."
                        icon={Activity}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Agency-Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Kandidaten screenen, weiterleiten und Bewerbungsprozesse steuern.
                    </p>
                    <Link href="/dashboard/admin/applications">
                      <Button className="w-full" size="sm">
                        Kandidaten-Pipeline öffnen
                      </Button>
                    </Link>
                    <p className="text-center text-xs text-muted-foreground">
                      Bewerbungen prüfen · Kandidaten weiterleiten · Fit-Score vergeben
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Schnellzugriff</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    <Link href="/dashboard/admin/jobs">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Jobs verwalten
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/applications">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Bewerbungen
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/companies">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Building2 className="mr-2 h-4 w-4" />
                        Unternehmen
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/candidates">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        Kandidaten
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/reviews">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Star className="mr-2 h-4 w-4" />
                        Reviews prüfen
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/leads">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Mail className="mr-2 h-4 w-4" />
                        Leads ansehen
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Moderation im Fokus</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <p className="text-sm font-medium">Offene Job-Freigaben</p>
                      <p className="mt-1 text-2xl font-bold">{stats.pendingJobs}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <p className="text-sm font-medium">Reviews in Prüfung</p>
                      <p className="mt-1 text-2xl font-bold">{stats.pendingReviews}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <p className="text-sm font-medium">Neue Leads</p>
                      <p className="mt-1 text-2xl font-bold">{stats.totalLeads}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
