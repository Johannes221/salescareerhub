'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JOB_STATUS_LABELS, SOURCE_TYPE_LABELS, APPROVAL_STATUS } from '@/lib/config';
import { formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Briefcase, CheckCircle, XCircle, Star, Shield, Eye, Building2 } from 'lucide-react';

export default function AdminJobsPage() {
  const { dbUser } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const params = filter ? `?status=${filter}` : '';
      const res = await fetch(`/api/admin/jobs${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setJobs(data.data || []); }
    } catch {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateJob = async (jobId: string, updates: Record<string, any>) => {
    try {
      const token = await getIdToken();
      await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ jobId, ...updates }),
      });
      await fetchJobs();
    } catch {}
  };

  if (dbUser?.role !== 'admin') return null;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jobs verwalten</h1>
          <p className="text-muted-foreground">Jobs freischalten, ablehnen, featured setzen</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${!filter ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>Alle</button>
        <button onClick={() => setFilter('pending')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${filter === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>Ausstehend</button>
        <button onClick={() => setFilter('approved')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${filter === 'approved' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>Genehmigt</button>
        <button onClick={() => setFilter('rejected')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${filter === 'rejected' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>Abgelehnt</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : jobs.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Keine Jobs gefunden</h3>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <Card key={job.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-medium">{job.title}</h3>
                      {job.isFeatured && <Badge>Featured</Badge>}
                      {job.isAgencyManaged && <Badge variant="secondary">Agentur</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.company?.name}</span>
                      <span>{job.roleCategory}</span>
                      <span>{SOURCE_TYPE_LABELS[job.sourceType as keyof typeof SOURCE_TYPE_LABELS] || job.sourceType}</span>
                      <span>{formatRelativeDate(job.createdAt)}</span>
                      <span>{job._count?.applications || 0} Bewerbungen</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Badge variant={job.approvalStatus === 'approved' ? 'success' : job.approvalStatus === 'pending' ? 'warning' : 'destructive'}>
                      {job.approvalStatus === 'approved' ? 'Genehmigt' : job.approvalStatus === 'pending' ? 'Ausstehend' : 'Abgelehnt'}
                    </Badge>
                    {job.approvalStatus === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateJob(job.id, { approvalStatus: 'approved', status: 'live' })}>
                          <CheckCircle className="h-3 w-3 mr-1" />Freischalten
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateJob(job.id, { approvalStatus: 'rejected' })}>
                          <XCircle className="h-3 w-3 mr-1" />Ablehnen
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => updateJob(job.id, { isFeatured: !job.isFeatured })}>
                      <Star className={`h-3 w-3 ${job.isFeatured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
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
