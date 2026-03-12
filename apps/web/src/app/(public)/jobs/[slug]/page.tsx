'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  REMOTE_TYPE_LABELS, SENIORITY_LABELS, EMPLOYMENT_TYPE_LABELS,
  SOURCE_TYPE_LABELS, APPLICATION_STATUS_LABELS, SALES_INDUSTRY_OPTIONS, SALES_MOTION_OPTIONS, TERRITORY_TYPE_OPTIONS,
} from '@/lib/config';
import { formatSalaryRange, formatRelativeDate, getPublicCompanyLabel } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { validateFile } from '@/lib/gdpr';
import {
  Building2, MapPin, Briefcase, Clock, Euro, ArrowLeft,
  Heart, Send, CheckCircle, AlertCircle, Eye, Users, Paperclip,
} from 'lucide-react';

export default function JobDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const router = useRouter();
  const { dbUser } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interestStatus, setInterestStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    linkedinUrl: dbUser?.candidateProfile?.linkedinUrl || '',
    yearsOfSalesExperience: dbUser?.candidateProfile?.yearsOfExperience?.toString() || '',
    currentRole: dbUser?.candidateProfile?.currentRole || '',
    averageDealSize: '',
    averageSalesCycle: '',
    quotaTarget: '',
    quotaAttainment: '',
    largestDealClosed: '',
    territoryType: '',
    candidateMessage: '',
  });
  const [industriesExperience, setIndustriesExperience] = useState<string[]>([]);
  const [salesMotionExperience, setSalesMotionExperience] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

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
      }
    } catch {} finally { setLoading(false); }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchJob();
  }, [slug, fetchJob]);

  useEffect(() => {
    setApplicationForm((current) => ({
      ...current,
      linkedinUrl: current.linkedinUrl || dbUser?.candidateProfile?.linkedinUrl || '',
      yearsOfSalesExperience: current.yearsOfSalesExperience || dbUser?.candidateProfile?.yearsOfExperience?.toString() || '',
      currentRole: current.currentRole || dbUser?.candidateProfile?.currentRole || '',
    }));
  }, [dbUser]);

  const setFieldValue = (field: string, value: string) => {
    setApplicationForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const toggleArrayValue = (
    value: string,
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setValues((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const handleExpressInterest = async () => {
    if (!dbUser) { router.push('/login'); return; }
    if (dbUser.role !== 'candidate') return;
    const nextErrors: Record<string, string> = {};

    if (!applicationForm.linkedinUrl.trim()) {
      nextErrors.linkedinUrl = 'LinkedIn ist erforderlich';
    } else {
      try {
        new URL(applicationForm.linkedinUrl.trim());
      } catch {
        nextErrors.linkedinUrl = 'Bitte gib eine gültige LinkedIn-URL ein';
      }
    }

    if (cvFile) {
      const validation = validateFile(cvFile, 'CV');
      if (!validation.valid) {
        nextErrors.cv = validation.error || 'Ungültige Datei';
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
      formData.append('linkedinUrl', applicationForm.linkedinUrl.trim());
      formData.append('yearsOfSalesExperience', applicationForm.yearsOfSalesExperience);
      formData.append('currentRole', applicationForm.currentRole.trim());
      formData.append('averageDealSize', applicationForm.averageDealSize);
      formData.append('averageSalesCycle', applicationForm.averageSalesCycle);
      formData.append('quotaTarget', applicationForm.quotaTarget);
      formData.append('quotaAttainment', applicationForm.quotaAttainment);
      formData.append('largestDealClosed', applicationForm.largestDealClosed);
      formData.append('territoryType', applicationForm.territoryType);
      formData.append('candidateMessage', applicationForm.candidateMessage.trim());
      industriesExperience.forEach((value) => formData.append('industriesExperience', value));
      salesMotionExperience.forEach((value) => formData.append('salesMotionExperience', value));
      if (cvFile) {
        formData.append('cv', cvFile);
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (res.ok) {
        setInterestStatus('interest_expressed');
        setApplicationForm((current) => ({ ...current, candidateMessage: '' }));
        setCvFile(null);
        setFieldErrors({});
      } else {
        const data = await res.json().catch(() => null);
        setSubmitError(data?.error || 'Bewerbung konnte nicht gesendet werden');
      }
    } catch {
      setSubmitError('Bewerbung konnte nicht gesendet werden');
    } finally { setSubmitting(false); }
  };

  const handleSaveJob = async () => {
    if (!dbUser) { router.push('/login'); return; }
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
      <div className="container py-8 max-w-4xl">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="h-64 bg-muted animate-pulse rounded-lg mb-6" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-16 text-center">
        <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Job nicht gefunden</h1>
        <p className="text-muted-foreground mb-4">Diese Stelle existiert nicht oder wurde entfernt.</p>
        <Link href="/jobs"><Button>Alle Jobs anzeigen</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Zurück zu Jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.isFeatured && <Badge>Featured</Badge>}
                    {job.isAgencyManaged && <Badge variant="secondary">Persönlich begleitet</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold mt-2">{job.title}</h1>
                  <p className="text-primary font-medium">{getPublicCompanyLabel(job)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="outline">{job.roleCategory}</Badge>
                {job.seniority && <Badge variant="outline">{SENIORITY_LABELS[job.seniority as keyof typeof SENIORITY_LABELS]}</Badge>}
                {job.remoteType && <Badge variant="outline">{REMOTE_TYPE_LABELS[job.remoteType as keyof typeof REMOTE_TYPE_LABELS]}</Badge>}
                {job.employmentType && <Badge variant="outline">{EMPLOYMENT_TYPE_LABELS[job.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS]}</Badge>}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}{job.country ? `, ${job.country}` : ''}</span>}
                {job.publishedAt && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatRelativeDate(job.publishedAt)}</span>}
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{job.viewCount} Aufrufe</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{job.interestCount} Interessenten</span>
              </div>
            </CardContent>
          </Card>

          {/* Salary */}
          {(job.salaryMin || job.salaryMax || job.oteMin || job.oteMax) && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Euro className="h-5 w-5" />Vergütung</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {(job.salaryMin || job.salaryMax) && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Base Salary</p>
                      <p className="text-lg font-semibold">{formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}</p>
                    </div>
                  )}
                  {(job.oteMin || job.oteMax) && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">OTE (On-Target Earnings)</p>
                      <p className="text-lg font-semibold text-primary">{formatSalaryRange(job.oteMin, job.oteMax, job.currency)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Beschreibung</CardTitle></CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{job.description}</div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Anforderungen</CardTitle></CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{job.requirements}</div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Benefits</CardTitle></CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{job.benefits}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Interest CTA */}
          <Card>
            <CardContent className="pt-6">
              {interestStatus ? (
                <div className="text-center">
                  <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Interesse bekundet</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Status: {APPLICATION_STATUS_LABELS[interestStatus as keyof typeof APPLICATION_STATUS_LABELS] || interestStatus}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Wir prüfen dein Profil und melden uns bei dir.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold mb-2">Bewirb dich auf diese Stelle</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reiche deine SaaS-Sales-Bewerbung ein. LinkedIn ist erforderlich, CV und weitere Sales-Daten sind optional, aber hilfreich.
                  </p>
                  {dbUser?.role === 'candidate' && (
                    <div className="space-y-4">
                      {submitError && (
                        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          {submitError}
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="text-sm font-medium">LinkedIn Profil *</label>
                        <input
                          value={applicationForm.linkedinUrl}
                          onChange={(e) => setFieldValue('linkedinUrl', e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {fieldErrors.linkedinUrl && <p className="text-xs text-destructive">{fieldErrors.linkedinUrl}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">CV (PDF)</label>
                        <div className="rounded-md border border-dashed p-3">
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm"
                          />
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Paperclip className="h-3 w-3" />
                            {cvFile ? cvFile.name : 'Optional, max. 10 MB'}
                          </div>
                        </div>
                        {fieldErrors.cv && <p className="text-xs text-destructive">{fieldErrors.cv}</p>}
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Jahre Sales Experience</label>
                          <input
                            type="number"
                            min={0}
                            value={applicationForm.yearsOfSalesExperience}
                            onChange={(e) => setFieldValue('yearsOfSalesExperience', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Current Role</label>
                          <input
                            value={applicationForm.currentRole}
                            onChange={(e) => setFieldValue('currentRole', e.target.value)}
                            placeholder="z.B. Account Executive"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Average Deal Size</label>
                          <input
                            type="number"
                            min={0}
                            value={applicationForm.averageDealSize}
                            onChange={(e) => setFieldValue('averageDealSize', e.target.value)}
                            placeholder="z.B. 25000"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Average Sales Cycle (Tage)</label>
                          <input
                            type="number"
                            min={0}
                            value={applicationForm.averageSalesCycle}
                            onChange={(e) => setFieldValue('averageSalesCycle', e.target.value)}
                            placeholder="z.B. 60"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Quota Target</label>
                          <input
                            type="number"
                            min={0}
                            value={applicationForm.quotaTarget}
                            onChange={(e) => setFieldValue('quotaTarget', e.target.value)}
                            placeholder="z.B. 500000"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Quota Attainment (%)</label>
                          <input
                            type="number"
                            min={0}
                            max={999}
                            value={applicationForm.quotaAttainment}
                            onChange={(e) => setFieldValue('quotaAttainment', e.target.value)}
                            placeholder="z.B. 118"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Largest Deal Closed</label>
                          <input
                            type="number"
                            min={0}
                            value={applicationForm.largestDealClosed}
                            onChange={(e) => setFieldValue('largestDealClosed', e.target.value)}
                            placeholder="z.B. 120000"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Territory Type</label>
                          <select
                            value={applicationForm.territoryType}
                            onChange={(e) => setFieldValue('territoryType', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Auswählen</option>
                            {TERRITORY_TYPE_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Industries Experience</label>
                        <div className="flex flex-wrap gap-2">
                          {SALES_INDUSTRY_OPTIONS.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleArrayValue(option, setIndustriesExperience)}
                              className={`rounded-full border px-3 py-1 text-xs transition-colors ${industriesExperience.includes(option) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground'}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sales Motion Experience</label>
                        <div className="flex flex-wrap gap-2">
                          {SALES_MOTION_OPTIONS.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleArrayValue(option, setSalesMotionExperience)}
                              className={`rounded-full border px-3 py-1 text-xs transition-colors ${salesMotionExperience.includes(option) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground'}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={applicationForm.candidateMessage}
                        onChange={(e) => setFieldValue('candidateMessage', e.target.value)}
                        placeholder="Optionale Nachricht an uns..."
                        rows={3}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button className="w-full" onClick={handleExpressInterest} disabled={submitting}>
                        {submitting ? 'Wird gesendet...' : 'Bewerbung absenden'}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {!dbUser && (
                    <div className="space-y-2">
                      <Link href="/login"><Button className="w-full">Anmelden & Interesse bekunden</Button></Link>
                      <p className="text-xs text-muted-foreground text-center">
                        Noch kein Konto? <Link href="/registrieren" className="text-primary hover:underline">Registrieren</Link>
                      </p>
                    </div>
                  )}
                  {dbUser?.role === 'company' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>Nur Kandidaten können Interesse bekunden.</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Save */}
          <Button variant="outline" className="w-full" onClick={handleSaveJob}>
            <Heart className={`mr-2 h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
            {saved ? 'Gespeichert' : 'Job speichern'}
          </Button>

          {/* Company Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{getPublicCompanyLabel(job)}</h3>
                  <p className="text-xs text-muted-foreground">
                    Unternehmensdetails bleiben bis zur Freigabe durch den Recruiter anonymisiert.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Source Info */}
          {job.sourceType && (
            <div className="text-xs text-muted-foreground px-1">
              Quelle: {SOURCE_TYPE_LABELS[job.sourceType as keyof typeof SOURCE_TYPE_LABELS] || job.sourceType}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
