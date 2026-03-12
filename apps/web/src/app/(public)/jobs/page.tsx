'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JOB_ROLES, COUNTRIES, REMOTE_TYPE_LABELS, SENIORITY_LABELS } from '@/lib/config';
import { formatSalaryRange, getPublicCompanyLabel } from '@/lib/utils';
import { Search, MapPin, Briefcase, Building2, Filter, X, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ roleCategory: '', country: '', remoteType: '', seniority: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('newest');
  const [appliedSearch, setAppliedSearch] = useState('');
  const pageSize = 12;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (appliedSearch) params.set('search', appliedSearch);
      if (filters.roleCategory) params.set('roleCategory', filters.roleCategory);
      if (filters.country) params.set('country', filters.country);
      if (filters.remoteType) params.set('remoteType', filters.remoteType);
      if (filters.seniority) params.set('seniority', filters.seniority);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('sort', sort);
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, filters, page, sort]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setAppliedSearch(search);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
        <h1 className="text-3xl font-bold mb-2">Software Sales Jobs</h1>
        <p className="text-muted-foreground">Spezialisierte Positionen im DACH-Raum – von SDR bis VP Sales</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Jobtitel, Region oder Stichwort..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Suchen</Button>
        <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </form>

      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/50 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Rolle</label>
            <select
              value={filters.roleCategory}
              onChange={(e) => setFilters({ ...filters, roleCategory: e.target.value })}
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Alle Rollen</option>
              {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Land</label>
            <select
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Alle Länder</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Remote</label>
            <select
              value={filters.remoteType}
              onChange={(e) => setFilters({ ...filters, remoteType: e.target.value })}
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Alle</option>
              {Object.entries(REMOTE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Seniority</label>
            <select
              value={filters.seniority}
              onChange={(e) => setFilters({ ...filters, seniority: e.target.value })}
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Alle</option>
              {Object.entries(SENIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="col-span-full">
            <Button variant="ghost" size="sm" onClick={() => setFilters({ roleCategory: '', country: '', remoteType: '', seniority: '' })}>
              <X className="h-4 w-4 mr-1" /> Filter zurücksetzen
            </Button>
          </div>
        </div>
      )}

      {/* Sort + Result Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{total} {total === 1 ? 'Job' : 'Jobs'} gefunden</p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="newest">Neueste zuerst</option>
            <option value="oldest">Älteste zuerst</option>
            <option value="salary_high">Gehalt (höchstes zuerst)</option>
            <option value="salary_low">Gehalt (niedrigstes zuerst)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Jobs gefunden</h3>
          <p className="text-muted-foreground mb-4">Versuche andere Suchbegriffe oder Filter.</p>
          <Button variant="outline" onClick={() => { setSearch(''); setFilters({ roleCategory: '', country: '', remoteType: '', seniority: '' }); }}>
            Alle Jobs anzeigen
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {jobs.map((job: any) => (
            <Link key={job.id} href={`/jobs/${job.slug}`}>
              <Card className="h-full rounded-2xl border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{job.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{getPublicCompanyLabel(job)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge variant="outline">{job.roleCategory}</Badge>
                    {job.remoteType && <Badge variant="outline">{REMOTE_TYPE_LABELS[job.remoteType as keyof typeof REMOTE_TYPE_LABELS] || job.remoteType}</Badge>}
                    {job.seniority && <Badge variant="outline">{SENIORITY_LABELS[job.seniority as keyof typeof SENIORITY_LABELS] || job.seniority}</Badge>}
                  </div>

                  <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
                    {job.country && <span>{job.country}</span>}
                  </div>

                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="rounded-xl bg-muted/50 px-3 py-2">Base: {formatSalaryRange(job.salaryMin, job.salaryMax)}</span>
                    )}
                    {(job.oteMin || job.oteMax) && (
                      <span className="rounded-xl bg-primary/5 px-3 py-2 font-medium text-primary">OTE: {formatSalaryRange(job.oteMin, job.oteMax)}</span>
                    )}
                  </div>

                  {job.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {job.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {job.companyStage ? <Badge variant="secondary">{job.companyStage}</Badge> : null}
                    {job.industry ? <Badge variant="secondary">{job.industry}</Badge> : null}
                    {job.salesMotion ? <Badge variant="secondary">{job.salesMotion}</Badge> : null}
                    {job.averageDealSize ? <Badge variant="outline">Deal Size: {formatSalaryRange(job.averageDealSize, job.averageDealSize)}</Badge> : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Zurück
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Seite {page} von {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Weiter <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
