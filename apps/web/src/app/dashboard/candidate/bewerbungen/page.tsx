'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { APPLICATION_STATUS_LABELS } from '@salescareerhub/config';
import { formatRelativeDate } from '@salescareerhub/utils';
import { getIdToken } from '@salescareerhub/auth/client';
import { Briefcase, Building2, Clock, ArrowRight } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  interest_expressed: 'secondary', screening: 'warning', shortlisted: 'default',
  forwarded: 'default', interview_1: 'default', interview_2: 'default',
  offer: 'success', hired: 'success', rejected: 'destructive', withdrawn: 'outline',
};

export default function CandidateBewerbungenPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/applications', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setApplications(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Meine Bewerbungen</h1>
        <p className="text-muted-foreground">Übersicht deiner Interessenbekundungen und deren Status</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Noch keine Bewerbungen</h3>
            <p className="text-muted-foreground mb-4">Du hast noch kein Interesse an Jobs bekundet.</p>
            <Link href="/jobs"><Button>Jobs entdecken <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <Card key={app.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/jobs/${app.job?.slug}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                        {app.job?.title || 'Job'}
                      </Link>
                      <p className="text-sm text-muted-foreground">{app.job?.company?.name || 'Unternehmen'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{formatRelativeDate(app.createdAt)}
                    </span>
                    <Badge variant={STATUS_COLORS[app.status] as any || 'secondary'}>
                      {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS] || app.status}
                    </Badge>
                  </div>
                </div>
                {app.candidateMessage && (
                  <p className="text-xs text-muted-foreground mt-2 ml-13 pl-13">Nachricht: {app.candidateMessage}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
