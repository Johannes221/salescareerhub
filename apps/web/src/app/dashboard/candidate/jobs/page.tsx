'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelectFilter, ActiveFilterChips } from '@/components/ui/multi-select-filter';
import { COMPANY_SIZES, COUNTRIES, JOB_ROLES, REMOTE_TYPE_LABELS, SALES_INDUSTRY_OPTIONS, SENIORITY_LABELS } from '@/lib/config';
import { formatSalaryRange, formatRelativeDate, getPublicCompanyLabel } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { getIdToken } from '@/lib/auth/client';
import {
  Search,
  MapPin,
  Briefcase,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';

const ROLE_OPTIONS = JOB_ROLES.map((r) => ({ value: r, label: r }));
const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c, label: c }));
const REMOTE_OPTIONS = Object.entries(REMOTE_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }));
const SENIORITY_OPTIONS = Object.entries(SENIORITY_LABELS).map(([k, v]) => ({ value: k, label: v }));
const INDUSTRY_OPTIONS = SALES_INDUSTRY_OPTIONS.map((industry) => ({ value: industry, label: industry }));
const COMPANY_TYPE_OPTIONS = [
  { value: 'startup', label: 'Startup' },
  { value: 'scaleup', label: 'Scale-up' },
  { value: 'mittelstand', label: 'Mittelstand' },
  { value: 'enterprise', label: 'Enterprise' },
];
const COMPANY_SIZE_OPTIONS = COMPANY_SIZES.map((size) => ({ value: size, label: size }));
const ROLE_OPTION_VALUES = new Set(ROLE_OPTIONS.map((option) => option.value));
const COUNTRY_OPTION_VALUES = new Set(COUNTRY_OPTIONS.map((option) => option.value));
const REMOTE_OPTION_VALUES = new Set(REMOTE_OPTIONS.map((option) => option.value));
const SENIORITY_OPTION_VALUES = new Set(SENIORITY_OPTIONS.map((option) => option.value));
const INDUSTRY_OPTION_VALUES = new Set(INDUSTRY_OPTIONS.map((option) => option.value));
const COMPANY_TYPE_OPTION_VALUES = new Set(COMPANY_TYPE_OPTIONS.map((option) => option.value));
const COMPANY_TYPE_PREFILL_MAP: Record<string, string[]> = {
  'Seed Startup': ['startup'],
  'Series A Startup': ['startup'],
  'Series B+ Scale-up': ['scaleup'],
  Mittelstand: ['mittelstand'],
  Enterprise: ['enterprise'],
  'VC-backed': ['startup', 'scaleup'],
  Bootstrapped: ['startup'],
};

const FILTER_LABEL_MAP: Record<string, Record<string, string>> = {
  roles: Object.fromEntries(JOB_ROLES.map((r) => [r, r])),
  countries: Object.fromEntries(COUNTRIES.map((c) => [c, c])),
  workModels: REMOTE_TYPE_LABELS as Record<string, string>,
  seniorityLevels: SENIORITY_LABELS as Record<string, string>,
  industries: Object.fromEntries(SALES_INDUSTRY_OPTIONS.map((industry) => [industry, industry])),
  companyTypes: Object.fromEntries(COMPANY_TYPE_OPTIONS.map((option) => [option.value, option.label])),
  companySizes: Object.fromEntries(COMPANY_SIZES.map((size) => [size, size])),
  locations: {},
};

const createEmptyFilters = () => ({
  roles: [] as string[],
  countries: [] as string[],
  workModels: [] as string[],
  seniorityLevels: [] as string[],
  industries: [] as string[],
  companyTypes: [] as string[],
  companySizes: [] as string[],
});

function uniqueNonEmptyStrings(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );
}

function pickAllowedValues(values: Array<string | null | undefined>, allowedValues: Set<string>) {
  return uniqueNonEmptyStrings(values).filter((value) => allowedValues.has(value));
}

function mapPreferredCompanyTypes(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  return pickAllowedValues(
    values.flatMap((value) => COMPANY_TYPE_PREFILL_MAP[String(value).trim()] ?? []),
    COMPANY_TYPE_OPTION_VALUES
  );
}

function getProfileFilterDefaults(profile: any) {
  const desiredJobRoles = Array.isArray(profile?.desiredJobRoles) ? profile.desiredJobRoles : [];
  const remotePreference = Array.isArray(profile?.remotePreference) ? profile.remotePreference : [];
  const desiredIndustries = Array.isArray(profile?.desiredIndustries) ? profile.desiredIndustries : [];

  return {
    roles: pickAllowedValues([...desiredJobRoles, profile?.targetRole], ROLE_OPTION_VALUES),
    countries: pickAllowedValues([profile?.country], COUNTRY_OPTION_VALUES),
    workModels: pickAllowedValues(remotePreference, REMOTE_OPTION_VALUES),
    seniorityLevels: pickAllowedValues([profile?.seniority], SENIORITY_OPTION_VALUES),
    industries: pickAllowedValues(desiredIndustries, INDUSTRY_OPTION_VALUES),
    companyTypes: mapPreferredCompanyTypes(profile?.preferredCompanyTypes),
    companySizes: [] as string[],
  };
}

export default function CandidateJobsPage() {
  const { dbUser } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(createEmptyFilters);
  const [locationFilter, setLocationFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);
  const hasAppliedProfileDefaultsRef = useRef(false);
  const pageSize = 12;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (locationFilter) params.set('location', locationFilter);
      if (filters.roles.length) params.set('roleCategory', filters.roles.join(','));
      if (filters.countries.length) params.set('country', filters.countries.join(','));
      if (filters.workModels.length) params.set('remoteType', filters.workModels.join(','));
      if (filters.seniorityLevels.length) params.set('seniority', filters.seniorityLevels.join(','));
      if (filters.industries.length) params.set('industry', filters.industries.join(','));
      if (filters.companyTypes.length) params.set('companyType', filters.companyTypes.join(','));
      if (filters.companySizes.length) params.set('companySize', filters.companySizes.join(','));
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('sort', sort);
      const token = dbUser ? await getIdToken() : null;
      const res = await fetch(`/api/jobs?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      setJobs(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [dbUser, search, filters, locationFilter, page, sort]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    if (!dbUser) return;
    const loadSaved = async () => {
      try {
        const token = await getIdToken();
        const res = await fetch('/api/saved-jobs', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setSavedJobIds(new Set((data.data || []).map((s: any) => s.jobId)));
        }
      } catch {}
    };
    void loadSaved();
  }, [dbUser]);

  useEffect(() => {
    if (!dbUser || dbUser.role !== 'candidate' || hasAppliedProfileDefaultsRef.current) {
      return;
    }

    let cancelled = false;
    hasAppliedProfileDefaultsRef.current = true;

    const loadProfileDefaults = async () => {
      try {
        const token = await getIdToken();
        const res = await fetch('/api/candidate/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok || cancelled) {
          return;
        }

        const payload = await res.json();
        const profileDefaults = getProfileFilterDefaults(payload.data || {});

        setFilters((current) => {
          const hasManualSelection = Object.values(current).some((values) => values.length > 0);
          return hasManualSelection ? current : { ...current, ...profileDefaults };
        });
      } catch {}
    };

    void loadProfileDefaults();

    return () => {
      cancelled = true;
    };
  }, [dbUser]);

  const toggleSave = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = await getIdToken();
      if (savedJobIds.has(jobId)) {
        await fetch('/api/saved-jobs', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ jobId }),
        });
        setSavedJobIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
      } else {
        await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ jobId }),
        });
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch {}
  };

  const hasActiveFilters = Boolean(
    locationFilter ||
    filters.roles.length ||
    filters.countries.length ||
    filters.workModels.length ||
    filters.seniorityLevels.length ||
    filters.industries.length ||
    filters.companyTypes.length ||
    filters.companySizes.length
  );

  const clearAllFilters = () => {
    setFilters(createEmptyFilters());
    setLocationFilter('');
    setSearch('');
    setPage(1);
  };

  const removeFilter = (group: string, value: string) => {
    if (group === 'locations') {
      setLocationFilter('');
      setPage(1);
      return;
    }
    setFilters((prev) => ({
      ...prev,
      [group]: (prev as any)[group].filter((v: string) => v !== value),
    }));
    setPage(1);
  };

  const selectedJob = selectedJobId ? jobs.find((j) => j.id === selectedJobId) : null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground mt-1">Finde deine nächste Sales Position im DACH-Raum</p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Jobtitel, Region oder Stichwort..."
              className="pl-9 h-10 rounded-lg"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            className="lg:hidden flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-accent/50 transition-colors"
            onClick={() => setMobileFilters(!mobileFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-primary-foreground text-xs px-1">
                {filters.roles.length + filters.countries.length + filters.workModels.length + filters.seniorityLevels.length + filters.industries.length + filters.companyTypes.length + filters.companySizes.length + (locationFilter ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Desktop filter bar */}
        <div className="hidden lg:flex flex-wrap items-end gap-2">
          <MultiSelectFilter
            label="Rolle"
            options={ROLE_OPTIONS}
            selected={filters.roles}
            onChange={(v) => { setFilters((p) => ({ ...p, roles: v })); setPage(1); }}
            className="w-44"
            placeholder="Alle Rollen"
          />
          <MultiSelectFilter
            label="Land"
            options={COUNTRY_OPTIONS}
            selected={filters.countries}
            onChange={(v) => { setFilters((p) => ({ ...p, countries: v })); setPage(1); }}
            className="w-40"
            placeholder="Alle Länder"
          />
          <MultiSelectFilter
            label="Arbeitsmodell"
            options={REMOTE_OPTIONS}
            selected={filters.workModels}
            onChange={(v) => { setFilters((p) => ({ ...p, workModels: v })); setPage(1); }}
            className="w-40"
            placeholder="Alle Modelle"
          />
          <MultiSelectFilter
            label="Seniorität"
            options={SENIORITY_OPTIONS}
            selected={filters.seniorityLevels}
            onChange={(v) => { setFilters((p) => ({ ...p, seniorityLevels: v })); setPage(1); }}
            className="w-40"
            placeholder="Alle Level"
          />
          <MultiSelectFilter
            label="Unternehmen"
            options={COMPANY_TYPE_OPTIONS}
            selected={filters.companyTypes}
            onChange={(v) => { setFilters((p) => ({ ...p, companyTypes: v })); setPage(1); }}
            className="w-44"
            placeholder="Alle Typen"
          />
          <MultiSelectFilter
            label="Größe"
            options={COMPANY_SIZE_OPTIONS}
            selected={filters.companySizes}
            onChange={(v) => { setFilters((p) => ({ ...p, companySizes: v })); setPage(1); }}
            className="w-40"
            placeholder="Alle Größen"
          />
          <MultiSelectFilter
            label="Branche"
            options={INDUSTRY_OPTIONS}
            selected={filters.industries}
            onChange={(v) => { setFilters((p) => ({ ...p, industries: v })); setPage(1); }}
            className="w-44"
            placeholder="Alle Branchen"
          />
          <div className="flex w-40 flex-col gap-1.5">
            <span className="px-1 text-[11px] font-medium text-muted-foreground">Ort</span>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={locationFilter}
                onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
                placeholder="Ort oder Region"
                className="h-9 w-full pl-8"
              />
            </div>
          </div>
          <div className="ml-auto flex w-48 flex-col gap-1.5">
            <span className="px-1 text-[11px] font-medium text-muted-foreground">Sortierung</span>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm"
              >
                <option value="newest">Neueste zuerst</option>
                <option value="salary_high">Höchstes Gehalt</option>
                <option value="salary_low">Niedrigstes Gehalt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile filter sheet */}
        {mobileFilters && (
          <div className="lg:hidden space-y-3 p-4 rounded-xl border bg-background">
            <MultiSelectFilter label="Rolle" options={ROLE_OPTIONS} selected={filters.roles} placeholder="Alle Rollen" onChange={(v) => { setFilters((p) => ({ ...p, roles: v })); setPage(1); }} />
            <MultiSelectFilter label="Land" options={COUNTRY_OPTIONS} selected={filters.countries} placeholder="Alle Länder" onChange={(v) => { setFilters((p) => ({ ...p, countries: v })); setPage(1); }} />
            <MultiSelectFilter label="Arbeitsmodell" options={REMOTE_OPTIONS} selected={filters.workModels} placeholder="Alle Modelle" onChange={(v) => { setFilters((p) => ({ ...p, workModels: v })); setPage(1); }} />
            <MultiSelectFilter label="Seniorität" options={SENIORITY_OPTIONS} selected={filters.seniorityLevels} placeholder="Alle Level" onChange={(v) => { setFilters((p) => ({ ...p, seniorityLevels: v })); setPage(1); }} />
            <MultiSelectFilter label="Unternehmen" options={COMPANY_TYPE_OPTIONS} selected={filters.companyTypes} placeholder="Alle Typen" onChange={(v) => { setFilters((p) => ({ ...p, companyTypes: v })); setPage(1); }} />
            <MultiSelectFilter label="Größe" options={COMPANY_SIZE_OPTIONS} selected={filters.companySizes} placeholder="Alle Größen" onChange={(v) => { setFilters((p) => ({ ...p, companySizes: v })); setPage(1); }} />
            <MultiSelectFilter label="Branche" options={INDUSTRY_OPTIONS} selected={filters.industries} placeholder="Alle Branchen" onChange={(v) => { setFilters((p) => ({ ...p, industries: v })); setPage(1); }} />
            <div className="space-y-1.5">
              <span className="px-1 text-[11px] font-medium text-muted-foreground">Ort</span>
              <Input value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }} placeholder="Ort oder Region" />
            </div>
            <div className="space-y-1.5">
              <span className="px-1 text-[11px] font-medium text-muted-foreground">Sortierung</span>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm">
                  <option value="newest">Neueste zuerst</option>
                  <option value="salary_high">Höchstes Gehalt</option>
                  <option value="salary_low">Niedrigstes Gehalt</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <ActiveFilterChips
            filters={{ ...filters, locations: locationFilter ? [locationFilter] : [] }}
            labels={FILTER_LABEL_MAP}
            onRemove={removeFilter}
            onClearAll={clearAllFilters}
          />
        )}

        {/* Result count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Lädt...' : `${total} ${total === 1 ? 'Job' : 'Jobs'} gefunden`}
          </p>
        </div>
      </div>

      {/* Job results */}
      {loading ? (
        <div className="grid gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border bg-background p-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Jobs gefunden</h3>
          <p className="text-muted-foreground mb-1 max-w-md mx-auto">
            Für diese Kombination wurden aktuell keine Jobs gefunden. Entferne einzelne Filter oder erweitere deine Suchkriterien.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" className="mt-4" onClick={clearAllFilters}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Filter zurücksetzen
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Job list */}
          <div className="flex-1 min-w-0 grid gap-3">
            {jobs.map((job: any) => (
              <div
                key={job.id}
                className={`group rounded-xl border bg-background p-4 lg:p-5 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer ${selectedJobId === job.id ? 'border-primary/30 shadow-md ring-1 ring-primary/10' : ''}`}
                onClick={() => setSelectedJobId(job.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/jobs/${job.slug}`} className="font-semibold text-sm lg:text-base truncate group-hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                        {job.title}
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {getPublicCompanyLabel(job)}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{job.location}{job.country ? `, ${job.country}` : ''}
                        </span>
                      )}
                      {job.remoteType && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5">
                          {REMOTE_TYPE_LABELS[job.remoteType as keyof typeof REMOTE_TYPE_LABELS] || job.remoteType}
                        </span>
                      )}
                      {job.seniority && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 capitalize">
                          {SENIORITY_LABELS[job.seniority as keyof typeof SENIORITY_LABELS] || job.seniority}
                        </span>
                      )}
                      {job.roleCategory && (
                        <span className="inline-flex items-center rounded-full bg-primary/5 text-primary px-2 py-0.5 font-medium">
                          {job.roleCategory}
                        </span>
                      )}
                      {job.company?.employeeCount && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5">
                          {job.company.employeeCount}
                        </span>
                      )}
                      {job.industry && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5">
                          {job.industry}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {typeof job.matchScore === 'number' && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Match {job.matchScore}%
                      </span>
                    )}
                    {(job.oteMin || job.oteMax) && (
                      <p className="text-sm font-semibold text-primary whitespace-nowrap">
                        {formatSalaryRange(job.oteMin, job.oteMax)}
                      </p>
                    )}
                    {job.publishedAt && (
                      <p className="text-xs text-muted-foreground">{formatRelativeDate(job.publishedAt)}</p>
                    )}
                    {dbUser && (
                      <button
                        type="button"
                        onClick={(e) => toggleSave(job.id, e)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Heart className={`h-4 w-4 ${savedJobIds.has(job.id) ? 'fill-primary text-primary' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
                {job.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {job.matchReasons?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {job.matchReasons.slice(0, 2).map((reason: string) => (
                      <p key={reason} className="text-xs text-muted-foreground">
                        {reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop preview panel */}
          {selectedJob && (
            <div className="hidden xl:block w-[380px] shrink-0">
              <div className="sticky top-20 rounded-xl border bg-background p-6 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <h3 className="font-bold text-lg">{selectedJob.title}</h3>
                <p className="text-sm text-muted-foreground">{getPublicCompanyLabel(selectedJob)}</p>
                {typeof selectedJob.matchScore === 'number' && (
                  <div className="rounded-lg border bg-emerald-50/70 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Match</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">{selectedJob.matchScore}%</p>
                    {selectedJob.matchReasons?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedJob.matchReasons.slice(0, 3).map((reason: string) => (
                          <p key={reason} className="text-xs text-emerald-800/80">{reason}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  {selectedJob.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {selectedJob.location}{selectedJob.country ? `, ${selectedJob.country}` : ''}
                    </div>
                  )}
                  {(selectedJob.oteMin || selectedJob.oteMax) && (
                    <p className="font-semibold text-primary">OTE: {formatSalaryRange(selectedJob.oteMin, selectedJob.oteMax)}</p>
                  )}
                  {(selectedJob.salaryMin || selectedJob.salaryMax) && (
                    <p className="text-muted-foreground">Base: {formatSalaryRange(selectedJob.salaryMin, selectedJob.salaryMax)}</p>
                  )}
                </div>

                {selectedJob.descriptionAnonymized && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">{selectedJob.descriptionAnonymized}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/jobs/${selectedJob.slug}`} className="flex-1">
                    <Button className="w-full" size="sm">Job ansehen</Button>
                  </Link>
                  {dbUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => toggleSave(selectedJob.id, e as any)}
                    >
                      <Heart className={`h-4 w-4 ${savedJobIds.has(selectedJob.id) ? 'fill-primary text-primary' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
