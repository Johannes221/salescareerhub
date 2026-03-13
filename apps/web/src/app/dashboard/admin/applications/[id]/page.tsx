'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS, type ApplicationStatus } from '@/lib/config';
import { formatRelativeDate, formatDate, formatCurrency } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Send,
  Shield,
  Star,
  TrendingUp,
  User,
  Users,
  XCircle,
} from 'lucide-react';

const PIPELINE_STAGES: ApplicationStatus[] = [
  'interest_expressed',
  'screening',
  'recruiter_call',
  'briefing',
  'hiring_team',
  'contract_negotiation',
  'signed',
];

const STAGE_ACTIONS: Record<string, { label: string; description: string; callType?: string; duration?: string }> = {
  screening: {
    label: 'Screening starten',
    description: 'Profil prüfen, Match-Score bewerten, Unterlagen sichten.',
  },
  recruiter_call: {
    label: 'Recruiter Call vereinbaren',
    description: 'Erstes Gespräch mit dem Kandidaten zur Einschätzung.',
    callType: 'Telefon / Video',
    duration: '30 Min',
  },
  briefing: {
    label: 'Briefing-Call vereinbaren',
    description: '15-Min Call: Rolle, Team, Deal-Umfeld und Gesprächsstrategie.',
    callType: 'Telefon',
    duration: '15 Min',
  },
  hiring_team: {
    label: 'Hiring Team Call aufsetzen',
    description: 'Call zwischen Kandidat und Hiring Team des Unternehmens.',
    callType: 'Video',
    duration: '45 Min',
  },
  contract_negotiation: {
    label: 'Vertragsverhandlung starten',
    description: 'Compensation, Startdatum und Offer-Details abstimmen.',
  },
  signed: {
    label: 'Unterschrift bestätigen',
    description: 'Vertrag unterschrieben, Start vorbereiten.',
  },
};

function generateMockCalendarSlots() {
  const slots = [];
  const now = new Date();
  const blockedSlots = [2, 5, 8, 11, 14];

  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);

    if (day.getDay() === 0 || day.getDay() === 6) continue;

    const hours = [9, 10, 11, 14, 15, 16];
    for (const hour of hours) {
      const start = new Date(day);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(45);
      const slotIndex: number = slots.length;
      slots.push({
        id: `slot-${slotIndex}`,
        start: start.toISOString(),
        end: end.toISOString(),
        label: `${start.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })} ${hour}:00`,
        blocked: blockedSlots.includes(slotIndex),
      });
    }
  }
  return slots;
}

export default function AdminApplicationDetailPage() {
  const { dbUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [schedulingFor, setSchedulingFor] = useState<string>('');
  const [calendarSlots] = useState(generateMockCalendarSlots);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchApplication = useCallback(async () => {
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApp(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const updateApplication = async (updates: Record<string, any>) => {
    setSaving(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await fetchApplication();
        setSuccessMessage('Gespeichert');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const advanceToStage = async (newStatus: string) => {
    await updateApplication({ status: newStatus, ...editData });
    setEditData({});
  };

  const scheduleCall = async (callType: string) => {
    if (!selectedSlot) return;
    const slot = calendarSlots.find((s: { id: string; start: string; end: string; label: string; blocked: boolean }) => s.id === selectedSlot);
    if (!slot) return;

    setSaving(true);
    try {
      const token = await getIdToken();
      await fetch('/api/recruiting-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          candidateId: app.candidate.id,
          scheduledTime: slot.start,
          callType,
          notes: `Termin für ${APPLICATION_STATUS_LABELS[schedulingFor as ApplicationStatus] || schedulingFor}`,
        }),
      });

      await prismaNotifyCandidate(callType, slot);
      setShowCalendar(false);
      setSelectedSlot(null);
      await fetchApplication();
      setSuccessMessage('Termin geplant & Einladung gesendet');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const prismaNotifyCandidate = async (callType: string, slot: any) => {
    const token = await getIdToken();
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        userId: app.candidate.userId,
        type: 'call_scheduled',
        title: `Termin: ${callType}`,
        message: `Ein ${callType} wurde für ${new Date(slot.start).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} um ${new Date(slot.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr geplant.`,
        link: '/dashboard/candidate/bewerbungen',
      }),
    });
  };

  if (dbUser?.role !== 'admin') {
    return (
      <div className="container py-16 text-center">
        <Shield className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Zugriff verweigert</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-48 bg-muted animate-pulse rounded-xl" />
            <div className="h-48 bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container py-16 text-center">
        <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Bewerbung nicht gefunden</h1>
        <Link href="/dashboard/admin/applications">
          <Button variant="outline">Zurück zur Pipeline</Button>
        </Link>
      </div>
    );
  }

  const currentStageIndex = PIPELINE_STAGES.indexOf(app.status as ApplicationStatus);
  const nextStage = currentStageIndex >= 0 && currentStageIndex < PIPELINE_STAGES.length - 1
    ? PIPELINE_STAGES[currentStageIndex + 1]
    : null;
  const nextAction = nextStage ? STAGE_ACTIONS[nextStage] : null;
  const isCallStage = ['recruiter_call', 'briefing', 'hiring_team'].includes(nextStage || '');

  return (
    <div className="container py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin/applications')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Pipeline
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {app.candidate?.firstName} {app.candidate?.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Bewerbung für {app.job?.title} · {app.job?.company?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {successMessage && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              {successMessage}
            </span>
          )}
          <Badge variant={app.recommendedByAdmin ? 'default' : 'outline'}>
            {app.recommendedByAdmin ? 'Empfohlen' : 'Nicht empfohlen'}
          </Badge>
        </div>
      </div>

      {/* Pipeline Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage, index) => {
              const isCurrent = stage === app.status;
              const isPast = index < currentStageIndex;
              const isRejected = app.status === 'rejected' || app.status === 'withdrawn';

              return (
                <React.Fragment key={stage}>
                  <button
                    onClick={() => !isRejected && advanceToStage(stage)}
                    disabled={saving || isRejected}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all whitespace-nowrap ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isPast
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {isPast && <CheckCircle className="h-3 w-3" />}
                    {isCurrent && <Clock className="h-3 w-3" />}
                    {APPLICATION_STATUS_LABELS[stage]}
                  </button>
                  {index < PIPELINE_STAGES.length - 1 && (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </React.Fragment>
              );
            })}
            {(app.status === 'rejected' || app.status === 'withdrawn') && (
              <>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-800">
                  <XCircle className="h-3 w-3" />
                  {APPLICATION_STATUS_LABELS[app.status as ApplicationStatus]}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Match Score & Reasons */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Kandidaten-Match</CardTitle>
                <div className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-lg ${
                  app.matchScore >= 75 ? 'bg-green-100 text-green-800' :
                  app.matchScore >= 50 ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <TrendingUp className="h-5 w-5" />
                  {app.matchScore}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {app.matchReasons?.length > 0 && (
                <div className="space-y-2">
                  {app.matchReasons.map((reason: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border bg-muted/20 p-3">
                      <CheckCircle className={`mt-0.5 h-4 w-4 shrink-0 ${
                        app.matchScore >= 75 ? 'text-green-600' : 'text-amber-600'
                      }`} />
                      <p className="text-sm">{reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Candidate Profile Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Kandidaten-Profil</CardTitle>
                <Link href={`/dashboard/admin/candidates/${app.candidate?.id}`}>
                  <Button variant="outline" size="sm">
                    <User className="mr-1 h-3 w-3" />
                    Vollständiges Profil
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{app.candidate?.firstName} {app.candidate?.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${app.candidate?.email}`} className="text-sm text-primary hover:underline">
                      {app.candidate?.email}
                    </a>
                  </div>
                  {app.candidate?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{app.candidate.phone}</span>
                    </div>
                  )}
                  {app.candidate?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{app.candidate.location}{app.candidate.country ? `, ${app.candidate.country}` : ''}</span>
                    </div>
                  )}
                  {(app.linkedinUrl || app.candidate?.linkedinUrl) && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <a href={app.linkedinUrl || app.candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        LinkedIn-Profil
                        <ExternalLink className="ml-1 inline h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Aktuelle Rolle</p>
                    <p className="text-sm font-medium">{app.currentRoleSnapshot || app.candidate?.currentRole || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Seniority</p>
                    <p className="text-sm font-medium">{app.candidate?.seniority || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Erfahrung</p>
                    <p className="text-sm font-medium">{app.yearsOfSalesExperience ?? app.candidate?.yearsOfExperience ?? '-'} Jahre</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Skills</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(app.candidate?.skills || []).slice(0, 8).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Metrics */}
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Deal Size</p>
                  <p className="text-sm font-semibold">{app.averageDealSize ? formatCurrency(app.averageDealSize) : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Sales Cycle</p>
                  <p className="text-sm font-semibold">{app.averageSalesCycle ? `${app.averageSalesCycle} Tage` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Größter Deal</p>
                  <p className="text-sm font-semibold">{app.largestDealClosed ? formatCurrency(app.largestDealClosed) : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quota Attainment</p>
                  <p className="text-sm font-semibold">{app.quotaAttainment ? `${app.quotaAttainment}%` : '-'}</p>
                </div>
              </div>

              {/* Candidate Message */}
              {app.candidateMessage && (
                <div className="mt-4 rounded-lg border bg-blue-50 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">Nachricht des Kandidaten</span>
                  </div>
                  <p className="text-sm text-blue-900">{app.candidateMessage}</p>
                </div>
              )}

              {/* Documents */}
              {app.candidate?.documents?.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Dokumente</p>
                  <div className="flex flex-wrap gap-2">
                    {app.candidate.documents.map((doc: any) => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        {doc.fileName}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Stelle</CardTitle>
                <Link href={`/dashboard/admin/jobs`}>
                  <Button variant="outline" size="sm">
                    <Briefcase className="mr-1 h-3 w-3" />
                    Zur Stelle
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Titel</p>
                  <p className="font-medium">{app.job?.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unternehmen</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{app.job?.company?.name}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ansprechpartner</p>
                  <p className="text-sm">{app.job?.company?.contactPerson || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unternehmen E-Mail</p>
                  <p className="text-sm">{app.job?.company?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">OTE Range</p>
                  <p className="text-sm">
                    {app.job?.oteMin && app.job?.oteMax
                      ? `${formatCurrency(app.job.oteMin)} – ${formatCurrency(app.job.oteMax)}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Standort / Remote</p>
                  <p className="text-sm">{app.job?.location || '-'} · {app.job?.remoteType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          {app.auditLogs?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktivitäten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {app.auditLogs.slice(0, 10).map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p>{log.action.replace(/_/g, ' ')}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground">{log.details}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeDate(log.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Actions & Controls */}
        <div className="space-y-6">
          {/* Next Action Card */}
          {nextAction && app.status !== 'rejected' && app.status !== 'withdrawn' && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Send className="h-4 w-4 text-primary" />
                  Nächster Schritt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium">{nextAction.label}</p>
                <p className="text-xs text-muted-foreground">{nextAction.description}</p>
                {nextAction.callType && (
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">{nextAction.callType}</Badge>
                    <Badge variant="outline">{nextAction.duration}</Badge>
                  </div>
                )}
                {isCallStage ? (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => {
                        setSchedulingFor(nextStage!);
                        setShowCalendar(true);
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Termin wählen & Einladung senden
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => advanceToStage(nextStage!)}
                      disabled={saving}
                    >
                      Direkt weiterschalten
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => advanceToStage(nextStage!)}
                    disabled={saving}
                  >
                    {nextAction.label}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Calendar Modal */}
          {showCalendar && (
            <Card className="border-2 border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Termin wählen
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowCalendar(false)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {APPLICATION_STATUS_LABELS[schedulingFor as ApplicationStatus]} · Wähle einen freien Slot
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {calendarSlots.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={slot.blocked}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                        slot.blocked
                          ? 'bg-red-50 text-red-400 line-through cursor-not-allowed'
                          : selectedSlot === slot.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{slot.label}</span>
                        {slot.blocked && <span className="text-[10px]">Belegt</span>}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedSlot && (
                  <div className="mt-3 space-y-2">
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => {
                        scheduleCall(schedulingFor);
                        advanceToStage(schedulingFor);
                      }}
                      disabled={saving}
                    >
                      <Send className="mr-2 h-3 w-3" />
                      Einladung senden & weiterschalten
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scheduled Calls */}
          {app.candidate?.recruitingCalls?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="h-4 w-4" />
                  Geplante Termine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {app.candidate.recruitingCalls.map((call: any) => (
                  <div key={call.id} className="rounded-md border bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{call.callType}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(call.scheduledTime)}
                      </span>
                    </div>
                    {call.notes && <p className="mt-1 text-xs text-muted-foreground">{call.notes}</p>}
                    {call.meetingLink && (
                      <a href={call.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
                        Meeting-Link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Admin Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Admin-Steuerung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Status ändern</label>
                <select
                  value={editData.status || app.status}
                  onChange={(e) => setEditData((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                >
                  {APPLICATION_STATUS.map((s) => (
                    <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Fit-Score (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={editData.fitScore ?? app.fitScore ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditData((prev) => ({ ...prev, fitScore: parseInt(e.target.value) || null }))
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={editData.recommendedByAdmin ?? app.recommendedByAdmin}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, recommendedByAdmin: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <Star className="h-3 w-3 text-yellow-500" />
                  Als empfohlen markieren
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Interne Notizen</label>
                <textarea
                  value={editData.internalNotes ?? app.internalNotes ?? ''}
                  onChange={(e) => setEditData((prev) => ({ ...prev, internalNotes: e.target.value }))}
                  rows={3}
                  placeholder="Nur für dich sichtbar..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Notizen für Kandidat</label>
                <textarea
                  value={editData.adminNotes ?? app.adminNotes ?? ''}
                  onChange={(e) => setEditData((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  rows={2}
                  placeholder="Wird bei Weiterleitung sichtbar..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={() => updateApplication(editData)}
                  disabled={saving}
                >
                  {saving ? 'Wird gespeichert...' : 'Speichern'}
                  <Save className="ml-2 h-3 w-3" />
                </Button>
                {app.status !== 'rejected' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => advanceToStage('rejected')}
                    disabled={saving}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Zeitverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Beworben:</span>
                  <span>{formatDate(app.createdAt)}</span>
                </div>
                {app.forwardedAt && (
                  <div className="flex items-center gap-2 text-xs">
                    <Send className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Weitergeleitet:</span>
                    <span>{formatDate(app.forwardedAt)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Letzte Änderung:</span>
                  <span>{formatDate(app.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
