'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { REMOTE_TYPE_LABELS } from '@/lib/config';
import { formatSalaryRange, getPublicCompanyLabel } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Heart, Building2, MapPin, Trash2 } from 'lucide-react';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSavedJobs(); }, []);

  const fetchSavedJobs = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/saved-jobs', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setSavedJobs(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const removeSavedJob = async (jobId: string) => {
    try {
      const token = await getIdToken();
      await fetch('/api/saved-jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ jobId }),
      });
      setSavedJobs(savedJobs.filter((s: any) => s.jobId !== jobId));
    } catch {}
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gespeicherte Jobs</h1>
        <p className="text-muted-foreground">Jobs, die du dir gemerkt hast</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : savedJobs.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine gespeicherten Jobs</h3>
          <p className="text-muted-foreground mb-4">Speichere interessante Jobs, um sie später wiederzufinden.</p>
          <Link href="/jobs"><Button>Jobs entdecken</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {savedJobs.map((saved: any) => (
            <Card key={saved.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <Link href={`/jobs/${saved.job?.slug}`} className="flex items-center gap-3 min-w-0 flex-1 hover:text-primary transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium line-clamp-1">{saved.job?.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getPublicCompanyLabel(saved.job)}</span>
                        {saved.job?.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{saved.job.location}</span>}
                        {saved.job?.remoteType && <Badge variant="outline" className="text-xs">{REMOTE_TYPE_LABELS[saved.job.remoteType as keyof typeof REMOTE_TYPE_LABELS]}</Badge>}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    {saved.job?.oteMin && <span className="text-sm font-medium text-primary">{formatSalaryRange(saved.job.oteMin, saved.job.oteMax)}</span>}
                    <Button variant="ghost" size="sm" onClick={() => removeSavedJob(saved.jobId)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
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
