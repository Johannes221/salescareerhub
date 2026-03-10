'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatRelativeDate } from '@salescareerhub/utils';
import { APPLICATION_STATUS_LABELS } from '@salescareerhub/config';
import { getIdToken } from '@salescareerhub/auth/client';
import { ArrowLeft, Download, Eye, EyeOff, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  cv: 'Lebenslauf',
  cover_letter: 'Anschreiben',
  other: 'Sonstiges',
};

export default function AdminCandidateDetailPage() {
  const { dbUser } = useAuth();
  const params = useParams();
  const candidateId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;

    const fetchCandidate = async () => {
      try {
        const token = await getIdToken();
        const res = await fetch(`/api/admin/candidates/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setCandidate(data.data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    void fetchCandidate();
  }, [candidateId]);

  if (dbUser?.role !== 'admin') return null;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="py-16 text-center">
        <h2 className="mb-2 text-xl font-semibold">Kandidat nicht gefunden</h2>
        <Link href="/dashboard/admin/candidates">
          <Button>Zurück zur Liste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/admin/candidates"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Zurück zu Kandidaten
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-muted-foreground">
              {candidate.currentRole || 'Kandidat'}
              {candidate.seniority ? ` · ${candidate.seniority}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {candidate.openToWork && <Badge variant="success">Open to Work</Badge>}
            {candidate.visibleToRecruiters ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <p className="mb-1 text-muted-foreground">E-Mail</p>
                  <p className="flex items-center gap-2 font-medium">
                    <Mail className="h-4 w-4" />
                    {candidate.email}
                  </p>
                </div>
                {candidate.phone && (
                  <div>
                    <p className="mb-1 text-muted-foreground">Telefon</p>
                    <p className="flex items-center gap-2 font-medium">
                      <Phone className="h-4 w-4" />
                      {candidate.phone}
                    </p>
                  </div>
                )}
                {candidate.location && (
                  <div>
                    <p className="mb-1 text-muted-foreground">Standort</p>
                    <p className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4" />
                      {candidate.location}
                      {candidate.country ? `, ${candidate.country}` : ''}
                    </p>
                  </div>
                )}
                {candidate.linkedinUrl && (
                  <div>
                    <p className="mb-1 text-muted-foreground">LinkedIn</p>
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                    >
                      <Linkedin className="h-4 w-4" />
                      Profil öffnen
                    </a>
                  </div>
                )}
                {candidate.targetRole && (
                  <div>
                    <p className="mb-1 text-muted-foreground">Zielrolle</p>
                    <p className="font-medium">{candidate.targetRole}</p>
                  </div>
                )}
                {candidate.yearsOfExperience != null && (
                  <div>
                    <p className="mb-1 text-muted-foreground">Berufserfahrung</p>
                    <p className="font-medium">{candidate.yearsOfExperience} Jahre</p>
                  </div>
                )}
                {candidate.salaryExpectationBase != null && (
                  <div>
                    <p className="mb-1 text-muted-foreground">Gehaltsvorstellung Base</p>
                    <p className="font-medium">{formatCurrency(candidate.salaryExpectationBase)}</p>
                  </div>
                )}
                {candidate.salaryExpectationOte != null && (
                  <div>
                    <p className="mb-1 text-muted-foreground">Gehaltsvorstellung OTE</p>
                    <p className="font-medium">{formatCurrency(candidate.salaryExpectationOte)}</p>
                  </div>
                )}
              </div>

              {candidate.shortBio && (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Kurzprofil</p>
                  <p className="text-sm leading-relaxed">{candidate.shortBio}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills || []).map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Sprachen</p>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.languages || []).map((lang: string) => (
                      <Badge key={lang} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bewerbungen</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.applications?.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Bewerbungen vorhanden.</p>
              ) : (
                <div className="space-y-3">
                  {candidate.applications.map((app: any) => (
                    <div key={app.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{app.job?.title || 'Job'}</p>
                          <p className="text-xs text-muted-foreground">
                            {app.job?.company?.name || 'Unternehmen'} · {formatRelativeDate(app.createdAt)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            app.status === 'rejected'
                              ? 'destructive'
                              : app.status === 'hired'
                                ? 'success'
                                : 'secondary'
                          }
                        >
                          {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS] || app.status}
                        </Badge>
                      </div>

                      {(app.fitScore != null || app.adminNotes || app.internalNotes || app.candidateMessage) && (
                        <div className="mt-3 space-y-2 text-xs">
                          {app.fitScore != null && (
                            <div className="flex items-center justify-between rounded-md bg-muted px-2 py-1">
                              <span className="text-muted-foreground">Fit-Score</span>
                              <span className="font-medium">{app.fitScore}%</span>
                            </div>
                          )}
                          {app.adminNotes && (
                            <div>
                              <p className="font-medium">Admin-Notiz</p>
                              <p className="text-muted-foreground">{app.adminNotes}</p>
                            </div>
                          )}
                          {app.internalNotes && (
                            <div>
                              <p className="font-medium">Interne Notiz</p>
                              <p className="text-muted-foreground">{app.internalNotes}</p>
                            </div>
                          )}
                          {app.candidateMessage && (
                            <div>
                              <p className="font-medium">Nachricht des Kandidaten</p>
                              <p className="text-muted-foreground">{app.candidateMessage}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {app.job?.slug && (
                        <div className="mt-3">
                          <Link href={`/jobs/${app.job.slug}`} className="text-xs font-medium text-primary hover:underline">
                            Stellenanzeige öffnen
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interne Notizen</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.applications?.some((app: any) => app.adminNotes || app.internalNotes) ? (
                <div className="space-y-3">
                  {candidate.applications
                    .filter((app: any) => app.adminNotes || app.internalNotes)
                    .map((app: any) => (
                      <div key={`${app.id}-notes`} className="rounded-lg border p-3">
                        <p className="text-sm font-medium">{app.job?.title || 'Bewerbung'}</p>
                        {app.adminNotes && <p className="mt-2 text-sm text-muted-foreground">{app.adminNotes}</p>}
                        {app.internalNotes && <p className="mt-2 text-sm text-muted-foreground">{app.internalNotes}</p>}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Für diesen Kandidaten sind noch keine internen Notizen vorhanden.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dokumente</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.documents?.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Dokumente hochgeladen.</p>
              ) : (
                <div className="space-y-3">
                  {candidate.documents.map((doc: any) => (
                    <div key={doc.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {CATEGORY_LABELS[doc.category] || doc.category} · {doc.fileSizeKb} KB
                          </p>
                        </div>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{candidate.user?.isActive ? 'Aktiv' : 'Inaktiv'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registriert</span>
                <span className="font-medium">
                  {candidate.user?.createdAt ? formatRelativeDate(candidate.user.createdAt) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sichtbar für Recruiter</span>
                <span className="font-medium">{candidate.visibleToRecruiters ? 'Ja' : 'Nein'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notice Period</span>
                <span className="font-medium">{candidate.noticePeriod || '-'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
