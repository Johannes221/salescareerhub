'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APPLICATION_STATUS_LABELS } from '@/lib/config';
import { formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Users, Briefcase, Star, ExternalLink } from 'lucide-react';

export default function CompanyBewerbungenPage() {
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
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Empfohlene Kandidaten</h1>
        <p className="text-muted-foreground">Kandidaten, die von unserem Team für deine Stellen empfohlen wurden</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : applications.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Noch keine empfohlenen Kandidaten</h3>
          <p className="text-muted-foreground">Sobald wir passende Kandidaten für deine Stellen finden, erscheinen sie hier.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <Card key={app.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{app.candidate?.firstName} {app.candidate?.lastName}</p>
                        {app.recommendedByAdmin && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {app.candidate?.currentRole || 'Kandidat'} · {app.candidate?.seniority || ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm">{app.job?.title}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeDate(app.forwardedAt || app.createdAt)}</p>
                    </div>
                    <Badge variant={app.status === 'hired' ? 'success' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS] || app.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
