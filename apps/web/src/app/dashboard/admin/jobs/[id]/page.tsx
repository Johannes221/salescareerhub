'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  JOB_ROLES,
  SENIORITY_LEVELS,
  SENIORITY_LABELS,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  REMOTE_TYPES,
  REMOTE_TYPE_LABELS,
  COUNTRIES,
  APPLICATION_STATUS_LABELS,
} from '@/lib/config';
import { formatRelativeDate, formatCurrency } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Save,
  Shield,
  Sparkles,
  Star,
  Users,
  XCircle,
} from 'lucide-react';

export default function AdminJobDetailPage() {
  const { dbUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [anonymizing, setAnonymizing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchJob = useCallback(async () => {
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJob(data.data);
        setEditForm(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const saveJob = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          jobId,
          title: editForm.title,
          roleCategory: editForm.roleCategory,
          seniority: editForm.seniority,
          employmentType: editForm.employmentType,
          remoteType: editForm.remoteType,
          location: editForm.location,
          country: editForm.country,
          salaryMin: editForm.salaryMin,
          salaryMax: editForm.salaryMax,
          oteMin: editForm.oteMin,
          oteMax: editForm.oteMax,
          description: editForm.description,
          requirements: editForm.requirements,
          benefits: editForm.benefits,
          approvalStatus: editForm.approvalStatus,
          status: editForm.status,
          isFeatured: editForm.isFeatured,
          isAgencyManaged: editForm.isAgencyManaged,
        }),
      });
      if (res.ok) {
        setEditing(false);
        await fetchJob();
        setSuccessMsg('Gespeichert');
        setTimeout(() => setSuccessMsg(''), 2000);
      } else {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.error || 'Fehler beim Speichern');
      }
    } catch {
      setErrorMsg('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const reAnonymize = async () => {
    setAnonymizing(true);
    setErrorMsg('');
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/jobs/${jobId}/anonymize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchJob();
        setSuccessMsg('Neu anonymisiert');
        setTimeout(() => setSuccessMsg(''), 2000);
      } else {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.error || 'Fehler beim Anonymisieren');
      }
    } catch {
      setErrorMsg('Fehler beim Anonymisieren');
    } finally {
      setAnonymizing(false);
    }
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
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-16 text-center">
        <Briefcase className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Job nicht gefunden</h1>
        <Link href="/dashboard/admin/jobs">
          <Button variant="outline">Zurück zu Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin/jobs')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Jobs
          </Button>
          <div>
            <h1 className="text-xl font-bold">{job.title}</h1>
            <p className="text-sm text-muted-foreground">
              {job.company?.name} · {job.roleCategory} · {formatRelativeDate(job.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {successMsg && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              {successMsg}
            </span>
          )}
          <Badge variant={job.approvalStatus === 'approved' ? 'success' : job.approvalStatus === 'pending' ? 'warning' : 'destructive'}>
            {job.approvalStatus === 'approved' ? 'Genehmigt' : job.approvalStatus === 'pending' ? 'Ausstehend' : 'Abgelehnt'}
          </Badge>
          {job.isFeatured && <Badge>Featured</Badge>}
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit className="mr-1 h-3 w-3" />
              Bearbeiten
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button size="sm" onClick={saveJob} disabled={saving}>
                {saving ? 'Wird gespeichert...' : 'Speichern'}
                <Save className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setEditing(false); setEditForm(job); }}>
                Abbrechen
              </Button>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stellendaten</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Titel</label>
                    <Input value={editForm.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((p: any) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Rolle</label>
                    <select value={editForm.roleCategory || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, roleCategory: e.target.value }))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                      {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Seniority</label>
                    <select value={editForm.seniority || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, seniority: e.target.value }))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                      {SENIORITY_LEVELS.map((s) => <option key={s} value={s}>{SENIORITY_LABELS[s]}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Anstellungsart</label>
                    <select value={editForm.employmentType || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, employmentType: e.target.value }))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                      {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{EMPLOYMENT_TYPE_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Remote-Typ</label>
                    <select value={editForm.remoteType || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, remoteType: e.target.value }))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                      {REMOTE_TYPES.map((t) => <option key={t} value={t}>{REMOTE_TYPE_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Standort</label>
                    <Input value={editForm.location || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((p: any) => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Land</label>
                    <select value={editForm.country || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, country: e.target.value }))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">OTE Min</label>
                      <Input type="number" value={editForm.oteMin ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((p: any) => ({ ...p, oteMin: e.target.value ? parseInt(e.target.value) : null }))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">OTE Max</label>
                      <Input type="number" value={editForm.oteMax ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((p: any) => ({ ...p, oteMax: e.target.value ? parseInt(e.target.value) : null }))} />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-medium">Beschreibung (anonymisiert)</label>
                    <textarea value={editForm.description || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, description: e.target.value }))} rows={6} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-medium">Anforderungen</label>
                    <textarea value={editForm.requirements || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, requirements: e.target.value }))} rows={4} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-medium">Benefits</label>
                    <textarea value={editForm.benefits || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, benefits: e.target.value }))} rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                    <div><p className="text-xs text-muted-foreground">Titel</p><p className="font-medium">{job.title}</p></div>
                    <div><p className="text-xs text-muted-foreground">Rolle</p><p className="font-medium">{job.roleCategory}</p></div>
                    <div><p className="text-xs text-muted-foreground">Seniority</p><p className="font-medium">{SENIORITY_LABELS[job.seniority as keyof typeof SENIORITY_LABELS] || job.seniority}</p></div>
                    <div><p className="text-xs text-muted-foreground">Anstellung</p><p className="font-medium">{EMPLOYMENT_TYPE_LABELS[job.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS] || job.employmentType}</p></div>
                    <div><p className="text-xs text-muted-foreground">Remote</p><p className="font-medium">{REMOTE_TYPE_LABELS[job.remoteType as keyof typeof REMOTE_TYPE_LABELS] || job.remoteType}</p></div>
                    <div><p className="text-xs text-muted-foreground">Standort</p><p className="font-medium">{job.location || '-'}{job.country ? `, ${job.country}` : ''}</p></div>
                    <div><p className="text-xs text-muted-foreground">OTE Range</p><p className="font-medium">{job.oteMin && job.oteMax ? `${formatCurrency(job.oteMin)} – ${formatCurrency(job.oteMax)}` : '-'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Bewerbungen</p><p className="font-medium">{job._count?.applications || 0}</p></div>
                    <div><p className="text-xs text-muted-foreground">Aufrufe</p><p className="font-medium">{job.viewCount || 0}</p></div>
                  </div>

                  {job.description && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Beschreibung (anonymisiert)</p>
                      <div className="rounded-lg border bg-muted/20 p-4 text-sm whitespace-pre-wrap">{job.description}</div>
                    </div>
                  )}

                  {job.descriptionOriginal && job.descriptionOriginal !== job.description && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Beschreibung (Original)</p>
                      <div className="rounded-lg border bg-amber-50 p-4 text-sm whitespace-pre-wrap">{job.descriptionOriginal}</div>
                    </div>
                  )}

                  {job.requirements && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Anforderungen</p>
                      <div className="rounded-lg border bg-muted/20 p-4 text-sm whitespace-pre-wrap">{job.requirements}</div>
                    </div>
                  )}

                  {job.benefits && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Benefits</p>
                      <div className="rounded-lg border bg-muted/20 p-4 text-sm whitespace-pre-wrap">{job.benefits}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications for this job */}
          {job.applications?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bewerbungen ({job.applications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {job.applications.map((app: any) => (
                    <Link key={app.id} href={`/dashboard/admin/applications/${app.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{app.candidate?.firstName} {app.candidate?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{app.candidate?.currentRole || '-'} · {formatRelativeDate(app.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.fitScore != null && <span className="text-xs font-bold text-primary">{app.fitScore}%</span>}
                        <Badge variant="outline" className="text-xs">
                          {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS] || app.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Anonymization */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Anonymisierung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Stelle mit KI neu anonymisieren. Unternehmensname, Links und identifizierende Informationen werden entfernt.
              </p>
              {job.anonymizedCompanyProfile && (
                <div className="rounded-md border bg-background p-2">
                  <p className="text-xs text-muted-foreground">Anonymisiertes Unternehmensprofil</p>
                  <p className="text-sm font-medium">{job.anonymizedCompanyProfile}</p>
                </div>
              )}
              {job.originalCompanyName && (
                <div className="rounded-md border bg-amber-50 p-2">
                  <p className="text-xs text-muted-foreground">Echtes Unternehmen</p>
                  <p className="text-sm font-medium">{job.originalCompanyName}</p>
                </div>
              )}
              <Button className="w-full" size="sm" onClick={reAnonymize} disabled={anonymizing}>
                <Sparkles className="mr-2 h-3 w-3" />
                {anonymizing ? 'Anonymisierung läuft...' : 'Neu anonymisieren (KI)'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schnellaktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {job.approvalStatus === 'pending' && (
                <>
                  <Button className="w-full" size="sm" variant="default" onClick={async () => {
                    const token = await getIdToken();
                    await fetch('/api/admin/jobs', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ jobId, approvalStatus: 'approved', status: 'live' }) });
                    await fetchJob();
                    setSuccessMsg('Freigeschaltet');
                    setTimeout(() => setSuccessMsg(''), 2000);
                  }}>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Freischalten
                  </Button>
                  <Button className="w-full" size="sm" variant="outline" onClick={async () => {
                    const token = await getIdToken();
                    await fetch('/api/admin/jobs', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ jobId, approvalStatus: 'rejected' }) });
                    await fetchJob();
                  }}>
                    <XCircle className="mr-1 h-3 w-3" />
                    Ablehnen
                  </Button>
                </>
              )}
              <Button className="w-full" size="sm" variant="outline" onClick={async () => {
                const token = await getIdToken();
                await fetch('/api/admin/jobs', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ jobId, isFeatured: !job.isFeatured }) });
                await fetchJob();
              }}>
                <Star className={`mr-1 h-3 w-3 ${job.isFeatured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                {job.isFeatured ? 'Featured entfernen' : 'Als Featured markieren'}
              </Button>
              {job.status === 'live' && (
                <Button className="w-full" size="sm" variant="outline" onClick={async () => {
                  const token = await getIdToken();
                  await fetch('/api/admin/jobs', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ jobId, status: 'archived' }) });
                  await fetchJob();
                }}>
                  <EyeOff className="mr-1 h-3 w-3" />
                  Archivieren
                </Button>
              )}
              {job.slug && (
                <Link href={`/jobs/${job.slug}`} target="_blank">
                  <Button className="w-full" size="sm" variant="ghost">
                    <Eye className="mr-1 h-3 w-3" />
                    Öffentliche Ansicht
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Unternehmen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{job.company?.name}</span>
              </div>
              {job.company?.isVerified && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="success" className="text-xs">Verifiziert</Badge>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">{job.sourceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {(job.tags || []).slice(0, 5).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Metadaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono">{job.id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Erstellt</span>
                <span>{formatRelativeDate(job.createdAt)}</span>
              </div>
              {job.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Veröffentlicht</span>
                  <span>{formatRelativeDate(job.publishedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-mono truncate max-w-[200px]">{job.slug}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
