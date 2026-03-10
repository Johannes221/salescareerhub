'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JOB_STATUS_LABELS } from '@/lib/config';
import { formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Briefcase, Plus, Eye, Users, MapPin } from 'lucide-react';

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/company/jobs', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setJobs(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jobs verwalten</h1>
          <p className="text-muted-foreground">Übersicht deiner Stellenanzeigen</p>
        </div>
        <Link href="/dashboard/company/jobs/neu">
          <Button><Plus className="mr-2 h-4 w-4" />Job erstellen</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : jobs.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Noch keine Jobs erstellt</h3>
          <p className="text-muted-foreground mb-4">Erstelle deine erste Stellenanzeige.</p>
          <Link href="/dashboard/company/jobs/neu"><Button>Ersten Job erstellen</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <Card key={job.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="font-medium">{job.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{job.roleCategory}</span>
                      {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
                      <span>{formatRelativeDate(job.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />{job.viewCount || 0}
                      <Users className="h-4 w-4 ml-2" />{job._count?.applications || 0}
                    </div>
                    <Badge variant={job.status === 'live' ? 'success' : job.status === 'pending_review' ? 'warning' : job.status === 'draft' ? 'outline' : 'secondary'}>
                      {JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS] || job.status}
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
