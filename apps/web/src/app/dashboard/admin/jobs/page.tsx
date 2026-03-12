'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { JOB_ROLES, SENIORITY_LEVELS, SENIORITY_LABELS, EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_LABELS, REMOTE_TYPES, REMOTE_TYPE_LABELS, COUNTRIES, SOURCE_TYPE_LABELS } from '@/lib/config';
import { formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Briefcase, CheckCircle, XCircle, Star, Building2, Sparkles, Plus } from 'lucide-react';

export default function AdminJobsPage() {
  const { dbUser } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    companyId: '',
    title: '',
    roleCategory: 'Account Executive',
    seniority: 'mid',
    employmentType: 'fulltime',
    remoteType: 'hybrid',
    location: '',
    country: 'Deutschland',
    description: '',
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const params = filter ? `?status=${filter}` : '';
      const res = await fetch(`/api/admin/jobs${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setJobs(data.data || []); }
    } catch {} finally { setLoading(false); }
  }, [filter]);

  const fetchCompanies = useCallback(async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/companies', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.data || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    void fetchJobs();
    void fetchCompanies();
  }, [fetchJobs, fetchCompanies]);

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

  const createJob = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(createForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setCreateError(data?.error || 'Job konnte nicht erstellt werden');
        return;
      }

      setCreateForm({
        companyId: '',
        title: '',
        roleCategory: 'Account Executive',
        seniority: 'mid',
        employmentType: 'fulltime',
        remoteType: 'hybrid',
        location: '',
        country: 'Deutschland',
        description: '',
      });
      await fetchJobs();
    } catch {
      setCreateError('Job konnte nicht erstellt werden');
    } finally {
      setCreating(false);
    }
  };

  if (dbUser?.role !== 'admin') return null;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jobs verwalten</h1>
          <p className="text-muted-foreground">Jobs erstellen, anonymisieren, freischalten und publishen</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Neuen Job anlegen und anonymisieren</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              value={createForm.companyId}
              onChange={(e) => setCreateForm((current) => ({ ...current, companyId: e.target.value }))}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Unternehmen wählen</option>
              {companies.map((company: any) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
            <Input value={createForm.title} onChange={(e) => setCreateForm((current) => ({ ...current, title: e.target.value }))} placeholder="Jobtitel" />
            <select
              value={createForm.roleCategory}
              onChange={(e) => setCreateForm((current) => ({ ...current, roleCategory: e.target.value }))}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              {JOB_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select
              value={createForm.seniority}
              onChange={(e) => setCreateForm((current) => ({ ...current, seniority: e.target.value }))}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              {SENIORITY_LEVELS.map((level) => <option key={level} value={level}>{SENIORITY_LABELS[level]}</option>)}
            </select>
            <select
              value={createForm.employmentType}
              onChange={(e) => setCreateForm((current) => ({ ...current, employmentType: e.target.value }))}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              {EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{EMPLOYMENT_TYPE_LABELS[type]}</option>)}
            </select>
            <select
              value={createForm.remoteType}
              onChange={(e) => setCreateForm((current) => ({ ...current, remoteType: e.target.value }))}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              {REMOTE_TYPES.map((type) => <option key={type} value={type}>{REMOTE_TYPE_LABELS[type]}</option>)}
            </select>
            <Input value={createForm.location} onChange={(e) => setCreateForm((current) => ({ ...current, location: e.target.value }))} placeholder="Standort" />
            <select
              value={createForm.country}
              onChange={(e) => setCreateForm((current) => ({ ...current, country: e.target.value }))}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm((current) => ({ ...current, description: e.target.value }))}
              rows={4}
              placeholder="Beschreibung für die Anonymisierung..."
              className="md:col-span-2 xl:col-span-4 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          {createError && <p className="mt-3 text-sm text-destructive">{createError}</p>}
          <div className="mt-4 flex justify-end">
            <Button onClick={createJob} disabled={creating || !createForm.companyId || !createForm.title || !createForm.description}>
              {creating ? 'Wird erstellt...' : 'Anonymisieren & speichern'}
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

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
