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
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

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
  const selectedApplication = filtered.find((app: any) => app.id === selectedApplicationId) || filtered[0] || null;

  useEffect(() => {
    if (!filtered.length) {
      setSelectedApplicationId(null);
      return;
    }
    if (!selectedApplicationId || !filtered.some((app: any) => app.id === selectedApplicationId)) {
      setSelectedApplicationId(filtered[0].id);
    }
  }, [filtered, selectedApplicationId]);

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
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => setSelectedApplicationId(app.id)}
                              className={`w-full rounded-lg border bg-background p-3 text-left hover:shadow-sm hover:border-primary/20 transition-all ${
                                selectedApplication?.id === app.id ? 'border-primary/30 ring-1 ring-primary/10' : ''
                              }`}
                            >
                              <p className="font-medium text-sm truncate">{app.job?.title || 'Job'}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{getPublicCompanyLabel(app.job)}</p>
                              {typeof app.fitScore === 'number' && (
                                <p className="mt-1.5 text-xs font-semibold text-emerald-700">Match {app.fitScore}%</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                <Clock className="h-3 w-3" />{formatRelativeDate(app.createdAt)}
                              </p>
                            </button>
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
                    <div
                      key={app.id}
                      className={`group cursor-pointer transition-colors ${selectedApplication?.id === app.id ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                      onClick={() => setSelectedApplicationId(app.id)}
                    >
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
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {typeof app.fitScore === 'number' && (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                Match {app.fitScore}%
                              </span>
                            )}
                            {app.nextStep && (
                              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                Nächster Schritt: {app.nextStep}
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

          {selectedApplication && (
            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-xl border bg-background p-5 space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{selectedApplication.job?.title || 'Job'}</h3>
                      <StatusBadge status={selectedApplication.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getPublicCompanyLabel(selectedApplication.job)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-3">
                      {selectedApplication.overview}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-xl border bg-emerald-50/70 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Match</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {typeof selectedApplication.fitScore === 'number' ? `${selectedApplication.fitScore}%` : 'n/a'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <DetailCard
                    label="Aktueller Schritt"
                    value={selectedApplication.currentStepLabel || APPLICATION_STATUS_LABELS[selectedApplication.status as keyof typeof APPLICATION_STATUS_LABELS] || selectedApplication.status}
                    helper={`Beworben ${formatRelativeDate(selectedApplication.createdAt)}`}
                  />
                  <DetailCard
                    label="Nächster Schritt"
                    value={selectedApplication.nextStep || 'Wird geprüft'}
                    helper={selectedApplication.nextStepDate ? new Date(selectedApplication.nextStepDate).toLocaleString('de-DE') : 'Noch ohne Termin'}
                  />
                </div>

                {selectedApplication.matchReasons?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Warum du passt</p>
                    <div className="space-y-2">
                      {selectedApplication.matchReasons.map((reason: string) => (
                        <div key={reason} className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Timeline</p>
                    <Link href={`/jobs/${selectedApplication.job?.slug || ''}`} className="text-xs font-medium text-primary hover:underline">
                      Job ansehen
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {(selectedApplication.timeline || []).map((step: any, index: number) => (
                      <div key={`${step.key}-${index}`} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={`mt-1 h-2.5 w-2.5 rounded-full ${
                              step.status === 'completed'
                                ? 'bg-primary'
                                : step.status === 'current'
                                  ? 'bg-emerald-500'
                                  : 'bg-muted-foreground/30'
                            }`}
                          />
                          {index < (selectedApplication.timeline || []).length - 1 && (
                            <span className="mt-2 h-full w-px bg-border" />
                          )}
                        </div>
                        <div className="pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">{step.label}</p>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                              {step.status === 'completed' ? 'Erledigt' : step.status === 'current' ? 'Aktuell' : 'Danach'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                          {step.date && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(step.date).toLocaleString('de-DE')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border bg-background p-5 space-y-3">
                  <p className="text-sm font-medium">Dokumente & Infos</p>
                  {(selectedApplication.resources || []).map((resource: any) => (
                    <div key={resource.title} className="rounded-lg border bg-muted/20 px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{resource.title}</p>
                        <span className={`text-[11px] font-medium ${resource.ready ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {resource.ready ? 'Bereit' : 'Offen'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{resource.detail}</p>
                    </div>
                  ))}
                  {selectedApplication.candidateMessage && (
                    <div className="rounded-lg border bg-muted/20 px-3 py-3">
                      <p className="text-sm font-medium">Deine Nachricht</p>
                      <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
                        {selectedApplication.candidateMessage}
                      </p>
                    </div>
                  )}
                </div>

                {selectedApplication.calendarAction && (
                  <div className="rounded-xl border bg-background p-5 space-y-3">
                    <div>
                      <p className="text-sm font-medium">{selectedApplication.calendarAction.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedApplication.calendarAction.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {selectedApplication.calendarAction.slots.map((slot: any) => (
                        <a
                          key={slot.startsAt}
                          href={slot.link}
                          className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:border-primary/30 hover:bg-muted/20 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            {slot.label}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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

function DetailCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}
