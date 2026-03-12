'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS, type ApplicationStatus } from '@/lib/config';
import { formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Users, Briefcase, Star, Send, MessageSquare, ChevronDown, ChevronUp, Save, CheckCircle } from 'lucide-react';

export default function AdminApplicationsPage() {
  const { dbUser } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/applications${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setApplications(data.data || []); }
    } catch {} finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchApplications(); }, [statusFilter, fetchApplications]);

  const updateApplication = async (id: string) => {
    setSaving(id);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData[id] || {}),
      });
      if (res.ok) { await fetchApplications(); setExpandedId(null); }
    } catch {} finally { setSaving(null); }
  };

  const setEditField = (id: string, field: string, value: any) => {
    setEditData((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  if (dbUser?.role !== 'admin') return null;

  const STATUS_COLORS: Record<string, string> = {
    interest_expressed: 'bg-blue-100 text-blue-800',
    screening: 'bg-yellow-100 text-yellow-800',
    shortlisted: 'bg-purple-100 text-purple-800',
    forwarded: 'bg-green-100 text-green-800',
    interview_1: 'bg-indigo-100 text-indigo-800',
    interview_2: 'bg-indigo-100 text-indigo-800',
    offer: 'bg-emerald-100 text-emerald-800',
    hired: 'bg-green-200 text-green-900',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bewerbungs-Pipeline</h1>
        <p className="text-muted-foreground">Kandidaten screenen, bewerten und weiterleiten</p>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!statusFilter ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
          Alle ({applications.length})
        </button>
        {APPLICATION_STATUS.map((s: ApplicationStatus) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
            {APPLICATION_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : applications.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Bewerbungen</h3>
          <p className="text-muted-foreground">Noch keine Interessenbekundungen vorhanden.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <Card key={app.id} className="overflow-hidden">
              <CardContent className="py-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{app.candidate?.firstName} {app.candidate?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{app.candidate?.currentRole || 'Keine Rolle'} · {app.candidate?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-medium">{app.job?.title}</p>
                      <p className="text-xs text-muted-foreground">{app.job?.company?.name} · {formatRelativeDate(app.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] || 'bg-gray-100'}`}>
                      {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS]}
                    </span>
                    {app.recommendedByAdmin && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    {expandedId === app.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedId === app.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* Candidate Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><p className="text-xs text-muted-foreground">Seniority</p><p className="font-medium">{app.candidate?.seniority || '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Skills</p><div className="flex flex-wrap gap-1">{app.candidate?.skills?.slice(0, 4).map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></div>
                      <div><p className="text-xs text-muted-foreground">LinkedIn</p>{(app.linkedinUrl || app.candidate?.linkedinUrl) ? <a href={app.linkedinUrl || app.candidate?.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">Profil öffnen</a> : <p>-</p>}</div>
                      <div><p className="text-xs text-muted-foreground">Kandidaten-Nachricht</p><p className="text-xs">{app.candidateMessage || 'Keine Nachricht'}</p></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div><p className="text-xs text-muted-foreground">Sales Experience</p><p className="font-medium">{app.yearsOfSalesExperience ?? '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Current Role</p><p className="font-medium">{app.currentRoleSnapshot || app.candidate?.currentRole || '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Average Deal Size</p><p className="font-medium">{app.averageDealSize ?? '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Average Sales Cycle</p><p className="font-medium">{app.averageSalesCycle ? `${app.averageSalesCycle} Tage` : '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Quota Target</p><p className="font-medium">{app.quotaTarget ?? '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Quota Attainment</p><p className="font-medium">{app.quotaAttainment ? `${app.quotaAttainment}%` : '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Largest Deal</p><p className="font-medium">{app.largestDealClosed ?? '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Territory</p><p className="font-medium">{app.territoryType || '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">CV</p>{app.cvFileUrl ? <a href={app.cvFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">{app.cvFileName || 'CV öffnen'}</a> : <p>-</p>}</div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Industries</p>
                        <div className="flex flex-wrap gap-1">
                          {(app.industriesExperience || []).length === 0
                            ? <p>-</p>
                            : app.industriesExperience.map((industry: string) => <Badge key={industry} variant="outline" className="text-xs">{industry}</Badge>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Sales Motion</p>
                        <div className="flex flex-wrap gap-1">
                          {(app.salesMotionExperience || []).length === 0
                            ? <p>-</p>
                            : app.salesMotionExperience.map((motion: string) => <Badge key={motion} variant="outline" className="text-xs">{motion}</Badge>)}
                        </div>
                      </div>
                    </div>

                    {/* Admin Controls */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Status ändern</label>
                        <select
                          value={editData[app.id]?.status || app.status}
                          onChange={(e) => setEditField(app.id, 'status', e.target.value)}
                          className="w-full h-9 rounded-md border bg-background px-2 text-sm">
                          {APPLICATION_STATUS.map((s: ApplicationStatus) => <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Fit-Score (1-10)</label>
                        <Input type="number" min={1} max={10}
                          value={editData[app.id]?.fitScore ?? app.fitScore ?? ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditField(app.id, 'fitScore', parseInt(e.target.value) || null)}
                          className="h-9" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium flex items-center gap-1">
                          <input type="checkbox"
                            checked={editData[app.id]?.recommendedByAdmin ?? app.recommendedByAdmin}
                            onChange={(e) => setEditField(app.id, 'recommendedByAdmin', e.target.checked)}
                            className="rounded" />
                          Empfohlen
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Interne Notizen (nur für Admin sichtbar)</label>
                      <textarea
                        value={editData[app.id]?.internalNotes ?? app.internalNotes ?? ''}
                        onChange={(e) => setEditField(app.id, 'internalNotes', e.target.value)}
                        rows={2} placeholder="Interne Notizen zur Bewerbung..."
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Admin-Notizen (für Kandidat sichtbar bei Weiterleitung)</label>
                      <textarea
                        value={editData[app.id]?.adminNotes ?? app.adminNotes ?? ''}
                        onChange={(e) => setEditField(app.id, 'adminNotes', e.target.value)}
                        rows={2} placeholder="Notizen für den Kandidaten..."
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setExpandedId(null)}>Abbrechen</Button>
                      <Button size="sm" onClick={() => updateApplication(app.id)} disabled={saving === app.id}>
                        {saving === app.id ? 'Wird gespeichert...' : 'Speichern'}
                        <Save className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
