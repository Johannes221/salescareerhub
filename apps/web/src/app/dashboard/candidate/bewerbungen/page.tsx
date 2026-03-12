'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { APPLICATION_STATUS_LABELS } from '@/lib/config';
import { formatRelativeDate, getPublicCompanyLabel } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  LayoutList,
  MessageSquare,
  X,
} from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'interest_expressed', label: 'Beworben', color: 'bg-blue-500' },
  { key: 'screening', label: 'Screening', color: 'bg-amber-500' },
  { key: 'shortlisted', label: 'Shortlist', color: 'bg-violet-500' },
  { key: 'forwarded', label: 'Intro', color: 'bg-indigo-500' },
  { key: 'interview_1', label: 'Interview 1', color: 'bg-cyan-500' },
  { key: 'interview_2', label: 'Interview 2', color: 'bg-teal-500' },
  { key: 'offer', label: 'Angebot', color: 'bg-emerald-500' },
  { key: 'hired', label: 'Hired', color: 'bg-green-500' },
  { key: 'rejected', label: 'Absage', color: 'bg-red-500' },
  { key: 'withdrawn', label: 'Zurückgez.', color: 'bg-gray-400' },
] as const;

const STATUS_FILTER_OPTIONS = [
  { value: 'active', label: 'Aktive Prozesse' },
  { value: 'all', label: 'Alle' },
  { value: 'interview', label: 'Mit Interview' },
  { value: 'pending', label: 'Feedback ausstehend' },
  { value: 'closed', label: 'Abgeschlossen' },
];

function getStageIndex(status: string): number {
  return PIPELINE_STAGES.findIndex((s) => s.key === status);
}

export default function CandidateBewerbungenPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'list' | 'pipeline'>('list');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/applications', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setApplications(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const filtered = applications.filter((app: any) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return !['rejected', 'withdrawn', 'hired'].includes(app.status);
    if (statusFilter === 'interview') return ['interview_1', 'interview_2'].includes(app.status);
    if (statusFilter === 'pending') return ['screening', 'shortlisted', 'forwarded'].includes(app.status);
    if (statusFilter === 'closed') return ['rejected', 'withdrawn', 'hired'].includes(app.status);
    return true;
  });

  const activeCount = applications.filter((a: any) => !['rejected', 'withdrawn', 'hired'].includes(a.status)).length;
  const interviewCount = applications.filter((a: any) => ['interview_1', 'interview_2'].includes(a.status)).length;
  const offerCount = applications.filter((a: any) => a.status === 'offer').length;
  const rejectedCount = applications.filter((a: any) => a.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bewerbungen</h1>
        <p className="text-muted-foreground mt-1">Verfolge den Status deiner Bewerbungsprozesse</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/60 animate-pulse" />)}
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/60 animate-pulse" />)}
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border bg-background p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Noch keine Bewerbungen</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Du hast noch kein Interesse an Jobs bekundet. Stöbere durch unsere Jobs und starte deinen ersten Bewerbungsprozess.
          </p>
          <Link href="/dashboard/candidate/jobs">
            <Button className="gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs entdecken
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Aktive Prozesse" value={activeCount} accent="text-blue-600" />
            <SummaryCard label="Interviews" value={interviewCount} accent="text-cyan-600" />
            <SummaryCard label="Angebote" value={offerCount} accent="text-emerald-600" />
            <SummaryCard label="Absagen" value={rejectedCount} accent="text-red-500" />
          </div>

          {/* Filter + View toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`rounded-lg p-2 transition-colors ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('pipeline')}
                className={`rounded-lg p-2 transition-colors ${view === 'pipeline' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Pipeline view */}
          {view === 'pipeline' ? (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3 min-w-max">
                {PIPELINE_STAGES.filter((s) => !['withdrawn'].includes(s.key)).map((stage) => {
                  const stageApps = filtered.filter((a: any) => a.status === stage.key);
                  return (
                    <div key={stage.key} className="w-64 shrink-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                        <span className="text-sm font-medium">{stage.label}</span>
                        <span className="text-xs text-muted-foreground">({stageApps.length})</span>
                      </div>
                      <div className="space-y-2">
                        {stageApps.length === 0 ? (
                          <div className="rounded-lg border border-dashed p-4 text-center">
                            <p className="text-xs text-muted-foreground">Keine Bewerbungen</p>
                          </div>
                        ) : (
                          stageApps.map((app: any) => (
                            <Link key={app.id} href={`/jobs/${app.job?.slug || ''}`}>
                              <div className="rounded-lg border bg-background p-3 hover:shadow-sm hover:border-primary/20 transition-all">
                                <p className="font-medium text-sm truncate">{app.job?.title || 'Job'}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{getPublicCompanyLabel(app.job)}</p>
                                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{formatRelativeDate(app.createdAt)}
                                </p>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* List view */
            <div className="rounded-xl border bg-background overflow-hidden divide-y">
              {filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">Keine Bewerbungen mit diesem Filter.</p>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Alle anzeigen
                  </button>
                </div>
              ) : (
                filtered.map((app: any) => {
                  const stageIdx = getStageIndex(app.status);
                  const stage = PIPELINE_STAGES[stageIdx];
                  return (
                    <div key={app.id} className="group hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4 p-4">
                        {/* Stage indicator */}
                        <div className="hidden sm:flex flex-col items-center gap-1 w-16 shrink-0">
                          <span className={`h-3 w-3 rounded-full ${stage?.color || 'bg-gray-300'}`} />
                          <span className="text-[10px] text-muted-foreground text-center leading-tight">
                            {stage?.label || app.status}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Link
                              href={`/jobs/${app.job?.slug || ''}`}
                              className="font-medium text-sm truncate hover:text-primary transition-colors"
                            >
                              {app.job?.title || 'Job'}
                            </Link>
                            <StatusBadge status={app.status} />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {getPublicCompanyLabel(app.job)}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Beworben {formatRelativeDate(app.createdAt)}
                            </span>
                            {app.candidateMessage && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                Nachricht gesendet
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pipeline progress mini */}
                        <div className="hidden md:flex items-center gap-0.5 shrink-0">
                          {PIPELINE_STAGES.slice(0, 8).map((s, i) => (
                            <div
                              key={s.key}
                              className={`h-1.5 w-4 rounded-full transition-colors ${
                                i <= stageIdx ? stage?.color || 'bg-gray-300' : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>

                        <Link
                          href={`/jobs/${app.job?.slug || ''}`}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
