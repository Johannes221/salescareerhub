'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JOB_STATUS_LABELS } from '@salescareerhub/config';
import { Briefcase, Users, Building2, Plus, Settings, FileText, Eye, BarChart3 } from 'lucide-react';

export default function CompanyDashboard() {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState({ totalJobs: 0, liveJobs: 0, totalApplications: 0, profileViews: 0 });
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/company/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || stats);
        setJobs(data.jobs || []);
      }
    } catch {} finally { setLoading(false); }
  };

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
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <item.icon className="h-4 w-4" />{item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Unternehmens-Dashboard</h1>
              <p className="text-muted-foreground">Verwalte deine Jobs und Bewerbungen</p>
            </div>
            <Link href="/dashboard/company/jobs/neu">
              <Button><Plus className="mr-2 h-4 w-4" />Job erstellen</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Gesamt Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-blue-600' },
              { label: 'Live Jobs', value: stats.liveJobs, icon: Eye, color: 'text-green-600' },
              { label: 'Bewerbungen', value: stats.totalApplications, icon: Users, color: 'text-purple-600' },
              { label: 'Profil-Aufrufe', value: stats.profileViews, icon: BarChart3, color: 'text-yellow-600' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deine Jobs</CardTitle>
              <CardDescription>Übersicht deiner Stellenanzeigen</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Du hast noch keine Jobs erstellt.</p>
                  <Link href="/dashboard/company/jobs/neu"><Button>Ersten Job erstellen</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.roleCategory} · {job.location || 'Remote'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{job._count?.applications || 0} Bewerbungen</span>
                        <Badge variant={job.status === 'live' ? 'success' : job.status === 'pending_review' ? 'warning' : 'secondary'}>
                          {JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS] || job.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
