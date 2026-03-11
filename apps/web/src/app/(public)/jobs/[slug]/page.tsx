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
  SOURCE_TYPE_LABELS, APPLICATION_STATUS_LABELS,
} from '@/lib/config';
import { formatSalaryRange, formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import {
  Building2, MapPin, Briefcase, Clock, Euro, Shield, ArrowLeft,
  Heart, Send, CheckCircle, AlertCircle, Eye, Users,
} from 'lucide-react';

export default function JobDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const router = useRouter();
  const { dbUser } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interestStatus, setInterestStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
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

  const handleExpressInterest = async () => {
    if (!dbUser) { router.push('/login'); return; }
    if (dbUser.role !== 'candidate') return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, message }),
      });
      if (res.ok) {
        setInterestStatus('interest_expressed');
        setMessage('');
      }
    } catch {} finally { setSubmitting(false); }
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
                    {job.company?.isVerified && <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Verifiziert</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold mt-2">{job.title}</h1>
                  <Link href={`/unternehmen/${job.company?.slug}`} className="text-primary hover:underline font-medium">
                    {job.company?.name}
                  </Link>
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
                  <h3 className="font-semibold mb-2">Interesse an dieser Stelle?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bekunde dein Interesse – wir prüfen dein Profil und begleiten dich persönlich durch den Prozess.
                  </p>
                  {dbUser?.role === 'candidate' && (
                    <div className="space-y-3">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Optionale Nachricht an uns..."
                        rows={3}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button className="w-full" onClick={handleExpressInterest} disabled={submitting}>
                        {submitting ? 'Wird gesendet...' : 'Interesse bekunden'}
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
          {job.company && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{job.company.name}</h3>
                    {job.company.industry && <p className="text-xs text-muted-foreground">{job.company.industry}</p>}
                  </div>
                </div>
                <Link href={`/unternehmen/${job.company.slug}`}>
                  <Button variant="outline" size="sm" className="w-full">Unternehmensprofil ansehen</Button>
                </Link>
              </CardContent>
            </Card>
          )}

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
