'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APPLICATION_STATUS_LABELS } from '@salescareerhub/config';
import { Briefcase, FileText, Bell, Eye, Heart } from 'lucide-react';

export default function CandidateDashboard() {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState({ applications: 0, savedJobs: 0, profileViews: 0, notifications: 0 });
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/candidate/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || stats);
        setApplications(data.applications || []);
      }
    } catch {} finally { setLoading(false); }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Willkommen zurück{dbUser?.displayName ? `, ${dbUser.displayName}` : ''}!</h1>
        <p className="text-muted-foreground">Hier ist dein Karriere-Dashboard.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Bewerbungen', value: stats.applications, icon: FileText, color: 'text-blue-600' },
          { label: 'Gespeicherte Jobs', value: stats.savedJobs, icon: Heart, color: 'text-red-500' },
          { label: 'Profil-Aufrufe', value: stats.profileViews, icon: Eye, color: 'text-green-600' },
          { label: 'Benachrichtigungen', value: stats.notifications, icon: Bell, color: 'text-yellow-600' },
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
          <CardTitle className="text-lg">Aktuelle Bewerbungen</CardTitle>
          <CardDescription>Deine letzten Interessenbekundungen und deren Status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Du hast noch kein Interesse an Jobs bekundet.</p>
              <Link href="/jobs"><Button>Jobs entdecken</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{app.job?.title || 'Job'}</p>
                    <p className="text-sm text-muted-foreground">{app.job?.company?.name || 'Unternehmen'}</p>
                  </div>
                  <Badge variant={app.status === 'rejected' ? 'destructive' : app.status === 'hired' ? 'success' : 'secondary'}>
                    {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS] || app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
