'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  REMOTE_TYPE_LABELS,
  SENIORITY_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  APPLICATION_STATUS_LABELS,
} from '@/lib/config';
import { formatSalaryRange, formatRelativeDate, getPublicCompanyLabel } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { validateFile } from '@/lib/gdpr';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Heart,
  MapPin,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

function normalizeText(value?: string | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStringArray(value?: string | string[] | null) {
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function splitIntoBullets(value?: string | null) {
  const normalized = normalizeText(value)
    .replace(/\r/g, '\n')
    .replace(/[•●▪◦]/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s+\n/g, '\n');

  if (!normalized) {
    return [];
  }

  const lines = normalized
    .split(/\n+/)
    .flatMap((line) => {
      const trimmed = line.replace(/^[-–—*]\s*/, '').trim();
      if (!trimmed) {
        return [];
      }

      if (trimmed.includes(';')) {
        return trimmed
          .split(/\s*;\s*/)
          .map((segment) => segment.trim())
          .filter(Boolean);
      }

      return [trimmed];
    })
    .filter(Boolean);

  if (lines.length > 1) {
    return Array.from(new Set(lines));
  }

  return Array.from(
    new Set(
      normalized
        .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9])/)
        .map((segment) => segment.replace(/^[-–—*]\s*/, '').trim())
        .filter(Boolean),
    ),
  );
}

function buildRequirementBuckets(requirements?: string | null) {
  const required: string[] = [];
  const niceToHave: string[] = [];
  const niceToHavePattern = /(nice[\s-]?to[\s-]?have|wünschenswert|bonus|plus|optional|von vorteil|preferred|idealerweise)/i;

  splitIntoBullets(requirements).forEach((item) => {
    if (niceToHavePattern.test(item)) {
      niceToHave.push(item);
      return;
    }

    required.push(item);
  });

  return { required, niceToHave };
}

function formatSingleValue(value?: number | null, currency = 'EUR') {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Nicht hinterlegt';
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumberValue(value?: number | null, suffix = '') {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Nicht hinterlegt';
  }

  return `${new Intl.NumberFormat('de-DE').format(value)}${suffix}`;
}

function formatQuotaSummary(quotaHistory?: { target?: number | null; attainment?: number | null } | null) {
  if (!quotaHistory || (quotaHistory.target == null && quotaHistory.attainment == null)) {
    return 'Nicht hinterlegt';
  }

  const parts: string[] = [];

  if (typeof quotaHistory.target === 'number') {
    parts.push(`Target ${new Intl.NumberFormat('de-DE').format(quotaHistory.target)}`);
  }

  if (typeof quotaHistory.attainment === 'number') {
    parts.push(`Attainment ${new Intl.NumberFormat('de-DE').format(quotaHistory.attainment)}%`);
  }

  return parts.join(' · ') || 'Nicht hinterlegt';
}

function ReadonlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function BulletSection({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function JobDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const router = useRouter();
  const { dbUser } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interestStatus, setInterestStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [candidateMessage, setCandidateMessage] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchJob = useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      const token = await getIdToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/jobs/${slug}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setJob(data.data);
        setInterestStatus(data.interestStatus || null);
        setSaved(data.saved || false);
      } else {
        setJob(null);
      }
    } catch {
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      void fetchJob();
    }
  }, [slug, fetchJob]);

  useEffect(() => {
    if (!showApplyModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowApplyModal(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showApplyModal]);

  const descriptionBullets = useMemo(() => splitIntoBullets(job?.description), [job?.description]);
  const benefitsBullets = useMemo(() => splitIntoBullets(job?.benefits), [job?.benefits]);
  const requirementBuckets = useMemo(() => buildRequirementBuckets(job?.requirements), [job?.requirements]);
  const profile = dbUser?.candidateProfile;
  const industriesExperience = useMemo(
    () => normalizeStringArray(profile?.industriesExperience),
    [profile?.industriesExperience],
  );
  const salesMotionExperience = useMemo(
    () => normalizeStringArray(profile?.salesMotionExperience),
    [profile?.salesMotionExperience],
  );

  const profileSnapshot = useMemo(() => {
    const quotaHistory = profile?.quotaHistory && typeof profile.quotaHistory === 'object'
      ? profile.quotaHistory
      : null;

    return {
      firstName: normalizeText(profile?.firstName),
      lastName: normalizeText(profile?.lastName),
      linkedinUrl: normalizeText(profile?.linkedinUrl),
      currentRole: normalizeText(profile?.currentRole),
      yearsOfSalesExperience: profile?.yearsOfExperience?.toString() || '',
      averageDealSize: profile?.averageDealSize?.toString() || '',
      averageSalesCycle: profile?.averageSalesCycle?.toString() || '',
      quotaTarget: typeof quotaHistory?.target === 'number' ? String(quotaHistory.target) : '',
      quotaAttainment: typeof quotaHistory?.attainment === 'number' ? String(quotaHistory.attainment) : '',
      largestDealClosed: profile?.largestDealClosed?.toString() || '',
      territoryType: normalizeText(profile?.territorySize),
      industriesExperience,
      salesMotionExperience,
      cvFileName: normalizeText(profile?.cvFileName),
      cvUrl: normalizeText(profile?.cvUrl),
      location: normalizeText(profile?.location),
      quotaHistory,
    };
  }, [profile, industriesExperience, salesMotionExperience]);

  const profileIssues = useMemo(() => {
    const issues: string[] = [];

    if (!profileSnapshot.linkedinUrl) {
      issues.push('LinkedIn-Profil fehlt im Kandidatenprofil.');
    }

    return issues;
  }, [profileSnapshot.linkedinUrl]);

  const isCandidate = dbUser?.role === 'candidate';
  const canSubmitApplication = isCandidate && profileIssues.length === 0;

  const handleApplyClick = () => {
    if (!dbUser) {
      router.push('/login');
      return;
    }

    if (dbUser.role !== 'candidate') {
      return;
    }

    setSubmitError('');
    setFieldErrors({});
    setShowApplyModal(true);
  };

  const handleExpressInterest = async () => {
    if (!dbUser) {
      router.push('/login');
      return;
    }

    if (dbUser.role !== 'candidate' || !job) {
      return;
    }

    const nextErrors: Record<string, string> = {};

    if (!profileSnapshot.linkedinUrl) {
      nextErrors.linkedinUrl = 'LinkedIn ist im Profil erforderlich';
    }

    if (cvFile) {
      const validation = validateFile(cvFile, 'CV');
      if (!validation.valid) {
        nextErrors.cv = validation.error || 'Ungültiger CV';
      }
    }

    if (coverLetterFile) {
      const validation = validateFile(coverLetterFile, 'COVER_LETTER');
      if (!validation.valid) {
        nextErrors.coverLetter = validation.error || 'Ungültiges Anschreiben';
      }
    }

    for (const file of additionalDocuments) {
      const validation = validateFile(file, 'OTHER');
      if (!validation.valid) {
        nextErrors.additionalDocuments = validation.error || `Ungültiges Dokument: ${file.name}`;
        break;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const token = await getIdToken();
      const formData = new FormData();
      formData.append('jobId', job.id);
      formData.append('linkedinUrl', profileSnapshot.linkedinUrl);
      formData.append('yearsOfSalesExperience', profileSnapshot.yearsOfSalesExperience);
      formData.append('currentRole', profileSnapshot.currentRole);
      formData.append('averageDealSize', profileSnapshot.averageDealSize);
      formData.append('averageSalesCycle', profileSnapshot.averageSalesCycle);
      formData.append('quotaTarget', profileSnapshot.quotaTarget);
      formData.append('quotaAttainment', profileSnapshot.quotaAttainment);
      formData.append('largestDealClosed', profileSnapshot.largestDealClosed);
      formData.append('territoryType', profileSnapshot.territoryType);
      formData.append('candidateMessage', candidateMessage.trim());

      profileSnapshot.industriesExperience.forEach((value) => formData.append('industriesExperience', value));
      profileSnapshot.salesMotionExperience.forEach((value) => formData.append('salesMotionExperience', value));

      if (cvFile) {
        formData.append('cv', cvFile);
      }

      if (coverLetterFile) {
        formData.append('coverLetter', coverLetterFile);
      }

      additionalDocuments.forEach((file) => formData.append('additionalDocuments', file));

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSubmitError(data?.error || 'Bewerbung konnte nicht gesendet werden');
        return;
      }

      setInterestStatus('interest_expressed');
      setCandidateMessage('');
      setCvFile(null);
      setCoverLetterFile(null);
      setAdditionalDocuments([]);
      setFieldErrors({});
      setShowApplyModal(false);
    } catch {
      setSubmitError('Bewerbung konnte nicht gesendet werden');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveJob = async () => {
    if (!dbUser) {
      router.push('/login');
      return;
    }

    if (!job) {
      return;
    }

    try {
      await fetch('/api/saved-jobs', {
        method: saved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });
      setSaved(!saved);
    } catch {}
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mb-6 h-64 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[720px] animate-pulse rounded-3xl bg-muted" />
          <div className="h-[420px] animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Briefcase className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Job nicht gefunden</h1>
        <p className="mb-4 text-muted-foreground">Diese Stelle existiert nicht oder wurde entfernt.</p>
        <Link href="/jobs"><Button>Alle Jobs anzeigen</Button></Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/jobs" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Zurück zu Jobs
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[28px] border-border/70 shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-5 flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-primary/10">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{job.title}</h1>
                        <p className="mt-2 text-lg font-medium text-primary">{getPublicCompanyLabel(job)}</p>
                        {job.anonymizedCompanyProfile ? (
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                            {job.anonymizedCompanyProfile}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-2">
                      <Badge variant="outline">{job.roleCategory}</Badge>
                      {job.seniority ? (
                        <Badge variant="outline">
                          {SENIORITY_LABELS[job.seniority as keyof typeof SENIORITY_LABELS] || job.seniority}
                        </Badge>
                      ) : null}
                      {job.remoteType ? (
                        <Badge variant="outline">
                          {REMOTE_TYPE_LABELS[job.remoteType as keyof typeof REMOTE_TYPE_LABELS] || job.remoteType}
                        </Badge>
                      ) : null}
                      {job.employmentType ? (
                        <Badge variant="outline">
                          {EMPLOYMENT_TYPE_LABELS[job.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS] || job.employmentType}
                        </Badge>
                      ) : null}
                      {job.industry ? <Badge variant="secondary">{job.industry}</Badge> : null}
                      {job.companyStage ? <Badge variant="secondary">{job.companyStage}</Badge> : null}
                    </div>

                    <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                      {job.location ? (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {job.location}{job.country ? `, ${job.country}` : ''}
                        </span>
                      ) : null}
                      {job.publishedAt ? (
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatRelativeDate(job.publishedAt)}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {job.viewCount} Aufrufe
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {job.interestCount} Interessenten
                      </span>
                    </div>
                  </div>

                  {(job.salaryMin || job.salaryMax || job.oteMin || job.oteMax) ? (
                    <div className="grid w-full gap-3 rounded-3xl border border-border/70 bg-muted/30 p-4 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
                      {(job.salaryMin || job.salaryMax) ? (
                        <div className="rounded-2xl bg-background p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Base</p>
                          <p className="mt-2 text-xl font-semibold">
                            {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}
                          </p>
                        </div>
                      ) : null}
                      {(job.oteMin || job.oteMax) ? (
                        <div className="rounded-2xl bg-primary/5 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">OTE</p>
                          <p className="mt-2 text-xl font-semibold text-primary">
                            {formatSalaryRange(job.oteMin, job.oteMax, job.currency)}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ReadonlyField label="Sales Motion" value={job.salesMotion || 'Nicht hinterlegt'} />
              <ReadonlyField
                label="Deal Size"
                value={typeof job.averageDealSize === 'number' ? formatSingleValue(job.averageDealSize, job.currency) : 'Nicht hinterlegt'}
              />
              <ReadonlyField
                label="Sales Cycle"
                value={typeof job.salesCycleLength === 'number' ? `${job.salesCycleLength} Tage` : 'Nicht hinterlegt'}
              />
              <ReadonlyField label="Quota" value={job.quota || 'Nicht hinterlegt'} />
            </div>

            <BulletSection
              title="Rollenüberblick"
              items={descriptionBullets}
              emptyLabel="Für diese Rolle liegt aktuell keine ausführliche Beschreibung vor."
            />

            <div className="grid gap-6 xl:grid-cols-2">
              <BulletSection
                title="Erforderlich"
                items={requirementBuckets.required}
                emptyLabel="Für diese Stelle wurden noch keine Pflichtanforderungen hinterlegt."
              />
              <BulletSection
                title="Nice to have"
                items={requirementBuckets.niceToHave}
                emptyLabel="Es wurden keine zusätzlichen Nice-to-have-Kriterien hinterlegt."
              />
            </div>

            <BulletSection
              title="Benefits"
              items={benefitsBullets}
              emptyLabel="Für diese Stelle wurden noch keine Benefits veröffentlicht."
            />
          </div>

          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card className="rounded-[28px] border-border/70 shadow-sm">
              <CardContent className="p-6">
                {typeof job.matchScore === 'number' && isCandidate ? (
                  <div className="mb-5 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Profil-Match</p>
                    <p className="mt-2 text-4xl font-bold text-emerald-700">{job.matchScore}%</p>
                    {job.matchReasons?.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {job.matchReasons.slice(0, 3).map((reason: string) => (
                          <p key={reason} className="text-sm leading-5 text-emerald-900/80">{reason}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {interestStatus ? (
                  <div className="text-center">
                    <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-600" />
                    <h3 className="font-semibold">Bewerbung gesendet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Status: {APPLICATION_STATUS_LABELS[interestStatus as keyof typeof APPLICATION_STATUS_LABELS] || interestStatus}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      Wir prüfen dein Profil und melden uns bei dir mit den nächsten Schritten.
                    </p>
                    <Link
                      href="/dashboard/candidate/bewerbungen"
                      className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
                    >
                      Zur Timeline
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Bewerbung in 1 Schritt
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold">Bewirb dich auf diese Stelle</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Dein Profil wird automatisch übernommen. Du ergänzt nur Nachricht und optionale Dokumente.
                      </p>
                    </div>

                    {isCandidate ? (
                      <>
                        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                          <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Profil wird vorbefüllt</p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                LinkedIn, Sales-Erfahrung, aktuelle Rolle und vorhandene Dokumente kommen direkt aus deinem Profil.
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button className="h-12 w-full rounded-2xl" onClick={handleApplyClick}>
                          Bewerbung senden
                          <Send className="ml-2 h-4 w-4" />
                        </Button>

                        <Link href="/dashboard/onboarding?mode=edit">
                          <Button variant="outline" className="w-full rounded-2xl">Profil ansehen / bearbeiten</Button>
                        </Link>
                      </>
                    ) : !dbUser ? (
                      <div className="space-y-3">
                        <Link href="/login"><Button className="h-12 w-full rounded-2xl">Anmelden & bewerben</Button></Link>
                        <p className="text-center text-xs text-muted-foreground">
                          Noch kein Konto? <Link href="/registrieren" className="text-primary hover:underline">Registrieren</Link>
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>Nur Kandidaten können sich auf Jobs bewerben.</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleSaveJob}>
              <Heart className={`mr-2 h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
              {saved ? 'Gespeichert' : 'Job speichern'}
            </Button>
          </div>
        </div>
      </div>

      {showApplyModal ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-6xl rounded-[32px] border border-border/70 bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Bewerbung</p>
                <h2 className="mt-1 text-2xl font-semibold">{job.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{getPublicCompanyLabel(job)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowApplyModal(false)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-6">
                <Card className="rounded-3xl border-border/70 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Dein Profil für diese Bewerbung</CardTitle>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Diese Daten werden automatisch verwendet. Änderungen machst du direkt in deinem Profil.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profileIssues.length > 0 ? (
                      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4" />
                          <div className="space-y-1">
                            {profileIssues.map((issue) => (
                              <p key={issue}>{issue}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      <ReadonlyField
                        label="Name"
                        value={`${profileSnapshot.firstName || '—'} ${profileSnapshot.lastName || ''}`.trim() || 'Nicht hinterlegt'}
                      />
                      <ReadonlyField
                        label="LinkedIn"
                        value={profileSnapshot.linkedinUrl ? (
                          <a
                            href={profileSnapshot.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-primary hover:underline"
                          >
                            {profileSnapshot.linkedinUrl}
                          </a>
                        ) : 'Nicht hinterlegt'}
                      />
                      <ReadonlyField label="Aktuelle Rolle" value={profileSnapshot.currentRole || 'Nicht hinterlegt'} />
                      <ReadonlyField
                        label="Sales-Erfahrung"
                        value={profileSnapshot.yearsOfSalesExperience ? `${profileSnapshot.yearsOfSalesExperience} Jahre` : 'Nicht hinterlegt'}
                      />
                      <ReadonlyField label="Standort" value={profileSnapshot.location || 'Nicht hinterlegt'} />
                      <ReadonlyField label="Territory" value={profileSnapshot.territoryType || 'Nicht hinterlegt'} />
                      <ReadonlyField
                        label="Average Deal Size"
                        value={profileSnapshot.averageDealSize ? formatSingleValue(Number(profileSnapshot.averageDealSize), job.currency) : 'Nicht hinterlegt'}
                      />
                      <ReadonlyField
                        label="Average Sales Cycle"
                        value={profileSnapshot.averageSalesCycle ? `${profileSnapshot.averageSalesCycle} Tage` : 'Nicht hinterlegt'}
                      />
                      <ReadonlyField label="Quota" value={formatQuotaSummary(profileSnapshot.quotaHistory)} />
                      <ReadonlyField
                        label="Largest Deal Closed"
                        value={profileSnapshot.largestDealClosed ? formatSingleValue(Number(profileSnapshot.largestDealClosed), job.currency) : 'Nicht hinterlegt'}
                      />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Branchen-Erfahrung</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {profileSnapshot.industriesExperience.length > 0 ? profileSnapshot.industriesExperience.map((entry) => (
                            <Badge key={entry} variant="secondary">{entry}</Badge>
                          )) : <span className="text-sm text-muted-foreground">Nicht hinterlegt</span>}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sales Motion</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {profileSnapshot.salesMotionExperience.length > 0 ? profileSnapshot.salesMotionExperience.map((entry) => (
                            <Badge key={entry} variant="secondary">{entry}</Badge>
                          )) : <span className="text-sm text-muted-foreground">Nicht hinterlegt</span>}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="mt-0.5 h-5 w-5 text-primary" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">Vorhandener Lebenslauf</p>
                          <p className="mt-1 break-all text-sm text-muted-foreground">
                            {profileSnapshot.cvFileName || 'Noch kein CV im Profil hinterlegt'}
                          </p>
                          {profileSnapshot.cvUrl ? (
                            <a
                              href={profileSnapshot.cvUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex text-sm font-medium text-primary hover:underline"
                            >
                              Vorhandenen CV öffnen
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <Link href="/dashboard/onboarding?mode=edit">
                      <Button variant="outline" className="rounded-2xl">Profil bearbeiten</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/70 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Nachricht & Dokumente</CardTitle>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Ergänze optional Hinweise für das Recruiting-Team und füge weitere Unterlagen an.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {submitError ? (
                      <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {submitError}
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bemerkungen / Motivation</label>
                      <textarea
                        value={candidateMessage}
                        onChange={(event) => setCandidateMessage(event.target.value)}
                        placeholder="Warum passt die Rolle gut zu dir? Gibt es Kontext, den wir im Erstgespräch kennen sollten?"
                        rows={5}
                        className="w-full rounded-2xl border bg-background px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-dashed border-border/80 p-4">
                        <label className="text-sm font-medium">CV aktualisieren</label>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(event) => setCvFile(event.target.files?.[0] || null)}
                          className="mt-3 block w-full text-sm"
                        />
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Paperclip className="h-3.5 w-3.5" />
                          {cvFile ? cvFile.name : profileSnapshot.cvFileName || 'Optional, PDF bis 10 MB'}
                        </div>
                        {fieldErrors.cv ? <p className="mt-2 text-xs text-destructive">{fieldErrors.cv}</p> : null}
                      </div>

                      <div className="rounded-2xl border border-dashed border-border/80 p-4">
                        <label className="text-sm font-medium">Anschreiben</label>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(event) => setCoverLetterFile(event.target.files?.[0] || null)}
                          className="mt-3 block w-full text-sm"
                        />
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Paperclip className="h-3.5 w-3.5" />
                          {coverLetterFile ? coverLetterFile.name : 'Optional, PDF bis 5 MB'}
                        </div>
                        {fieldErrors.coverLetter ? <p className="mt-2 text-xs text-destructive">{fieldErrors.coverLetter}</p> : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-dashed border-border/80 p-4">
                      <label className="text-sm font-medium">Weitere Dokumente</label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                        multiple
                        onChange={(event) => setAdditionalDocuments(Array.from(event.target.files || []))}
                        className="mt-3 block w-full text-sm"
                      />
                      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                        {additionalDocuments.length > 0 ? additionalDocuments.map((file) => (
                          <div key={`${file.name}-${file.size}`} className="flex items-center gap-2">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span>{file.name}</span>
                          </div>
                        )) : (
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span>Optional, z. B. Zeugnisse oder Referenzen</span>
                          </div>
                        )}
                      </div>
                      {fieldErrors.additionalDocuments ? <p className="mt-2 text-xs text-destructive">{fieldErrors.additionalDocuments}</p> : null}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="rounded-3xl border-border/70 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Abgleich mit der Rolle</CardTitle>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Die wichtigsten Anforderungen der Stelle im direkten Überblick zu deinem bestehenden Profil.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Dein Profil auf einen Blick</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <ReadonlyField label="Rolle" value={profileSnapshot.currentRole || 'Nicht hinterlegt'} />
                        <ReadonlyField label="Erfahrung" value={profileSnapshot.yearsOfSalesExperience ? `${profileSnapshot.yearsOfSalesExperience} Jahre` : 'Nicht hinterlegt'} />
                        <ReadonlyField label="Deal Size" value={profileSnapshot.averageDealSize ? formatSingleValue(Number(profileSnapshot.averageDealSize), job.currency) : 'Nicht hinterlegt'} />
                        <ReadonlyField label="Cycle" value={profileSnapshot.averageSalesCycle ? `${profileSnapshot.averageSalesCycle} Tage` : 'Nicht hinterlegt'} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Erforderlich</p>
                      {requirementBuckets.required.length > 0 ? (
                        <ul className="mt-4 space-y-3">
                          {requirementBuckets.required.map((item) => (
                            <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">Keine Pflichtanforderungen hinterlegt.</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Nice to have</p>
                      {requirementBuckets.niceToHave.length > 0 ? (
                        <ul className="mt-4 space-y-3">
                          {requirementBuckets.niceToHave.map((item) => (
                            <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                              <span className="mt-2 h-2 w-2 rounded-full bg-primary/60" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">Keine separaten Nice-to-have-Kriterien hinterlegt.</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-primary/5 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">So wird deine Bewerbung verwendet</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Dein bestehendes Profil, dein Lebenslauf und optionale Zusatzdokumente werden zusammen mit deiner Nachricht an das Recruiting-Team übermittelt.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="h-12 w-full rounded-2xl"
                      onClick={handleExpressInterest}
                      disabled={submitting || !canSubmitApplication}
                    >
                      {submitting ? 'Wird gesendet...' : 'Bewerbung jetzt senden'}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>

                    {!canSubmitApplication ? (
                      <p className="text-xs leading-5 text-muted-foreground">
                        Bitte vervollständige zuerst dein Profil, damit wir deine Bewerbung sauber einreichen können.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/70 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Rollenfakten</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <ReadonlyField label="Ort" value={`${job.location || 'Nicht hinterlegt'}${job.country ? `, ${job.country}` : ''}`} />
                    <ReadonlyField label="Remote" value={job.remoteType ? (REMOTE_TYPE_LABELS[job.remoteType as keyof typeof REMOTE_TYPE_LABELS] || job.remoteType) : 'Nicht hinterlegt'} />
                    <ReadonlyField label="Beschäftigung" value={job.employmentType ? (EMPLOYMENT_TYPE_LABELS[job.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS] || job.employmentType) : 'Nicht hinterlegt'} />
                    <ReadonlyField label="Seniority" value={job.seniority ? (SENIORITY_LABELS[job.seniority as keyof typeof SENIORITY_LABELS] || job.seniority) : 'Nicht hinterlegt'} />
                    <ReadonlyField label="Base" value={(job.salaryMin || job.salaryMax) ? formatSalaryRange(job.salaryMin, job.salaryMax, job.currency) : 'Nicht hinterlegt'} />
                    <ReadonlyField label="OTE" value={(job.oteMin || job.oteMax) ? formatSalaryRange(job.oteMin, job.oteMax, job.currency) : 'Nicht hinterlegt'} />
                    <ReadonlyField label="Deal Size" value={typeof job.averageDealSize === 'number' ? formatSingleValue(job.averageDealSize, job.currency) : 'Nicht hinterlegt'} />
                    <ReadonlyField label="Sales Cycle" value={typeof job.salesCycleLength === 'number' ? formatNumberValue(job.salesCycleLength, ' Tage') : 'Nicht hinterlegt'} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
