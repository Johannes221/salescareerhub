'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JOB_ROLES, SENIORITY_LEVELS, SENIORITY_LABELS, COUNTRIES } from '@/lib/config';
import { formatCurrency } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { TrendingUp, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const emptyForm = {
  role: '', country: '', region: '', seniority: '', baseSalaryMin: 0, baseSalaryMedian: 0,
  baseSalaryMax: 0, oteMin: 0, oteMedian: 0, oteMax: 0, source: '', confidenceScore: 0.5,
  year: new Date().getFullYear(),
};

export default function AdminSalaryPage() {
  const { dbUser } = useAuth();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchInsights(); }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/salary', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setInsights(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const saveInsight = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const token = await getIdToken();
      const method = editing.id ? 'PATCH' : 'POST';
      const body = editing.id ? editing : { ...editing };
      const res = await fetch('/api/admin/salary', {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) { setEditing(null); await fetchInsights(); }
    } catch {} finally { setSaving(false); }
  };

  const deleteInsight = async (id: string) => {
    if (!confirm('Wirklich löschen?')) return;
    try {
      const token = await getIdToken();
      await fetch('/api/admin/salary', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      await fetchInsights();
    } catch {}
  };

  if (dbUser?.role !== 'admin') return null;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Salary Data</h1>
          <p className="text-muted-foreground">{insights.length} Gehaltsdatensätze</p>
        </div>
        <Button onClick={() => setEditing({ ...emptyForm })}><Plus className="mr-2 h-4 w-4" />Neuer Eintrag</Button>
      </div>

      {editing && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">{editing.id ? 'Eintrag bearbeiten' : 'Neuer Gehaltseintrag'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Rolle *</label>
                <select value={editing.role} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditing({ ...editing, role: e.target.value })}
                  className="w-full h-9 rounded-md border bg-background px-2 text-sm">
                  <option value="">Auswählen</option>
                  {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Land *</label>
                <select value={editing.country} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditing({ ...editing, country: e.target.value })}
                  className="w-full h-9 rounded-md border bg-background px-2 text-sm">
                  <option value="">Auswählen</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Seniority *</label>
                <select value={editing.seniority} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditing({ ...editing, seniority: e.target.value })}
                  className="w-full h-9 rounded-md border bg-background px-2 text-sm">
                  <option value="">Auswählen</option>
                  {SENIORITY_LEVELS.map((s) => <option key={s} value={s}>{SENIORITY_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><label className="text-xs font-medium">Base Min (€)</label><Input type="number" value={editing.baseSalaryMin || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, baseSalaryMin: parseInt(e.target.value) || 0 })} className="h-9" /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Base Median (€)</label><Input type="number" value={editing.baseSalaryMedian || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, baseSalaryMedian: parseInt(e.target.value) || 0 })} className="h-9" /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Base Max (€)</label><Input type="number" value={editing.baseSalaryMax || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, baseSalaryMax: parseInt(e.target.value) || 0 })} className="h-9" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><label className="text-xs font-medium">OTE Min (€)</label><Input type="number" value={editing.oteMin || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, oteMin: parseInt(e.target.value) || 0 })} className="h-9" /></div>
              <div className="space-y-1"><label className="text-xs font-medium">OTE Median (€)</label><Input type="number" value={editing.oteMedian || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, oteMedian: parseInt(e.target.value) || 0 })} className="h-9" /></div>
              <div className="space-y-1"><label className="text-xs font-medium">OTE Max (€)</label><Input type="number" value={editing.oteMax || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, oteMax: parseInt(e.target.value) || 0 })} className="h-9" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><label className="text-xs font-medium">Region</label><Input value={editing.region || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, region: e.target.value })} className="h-9" placeholder="z.B. Bayern" /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Quelle</label><Input value={editing.source || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, source: e.target.value })} className="h-9" placeholder="z.B. Marktdaten 2024" /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Jahr</label><Input type="number" value={editing.year || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, year: parseInt(e.target.value) || 2024 })} className="h-9" /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveInsight} disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}<Save className="ml-2 h-3 w-3" /></Button>
              <Button variant="outline" onClick={() => setEditing(null)}><X className="mr-2 h-3 w-3" />Abbrechen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
      ) : insights.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Gehaltsdaten</h3>
          <p className="text-sm text-muted-foreground mb-4">Erstelle den ersten Gehaltsdatensatz.</p>
          <Button onClick={() => setEditing({ ...emptyForm })}><Plus className="mr-2 h-4 w-4" />Eintrag erstellen</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {insights.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{s.role}</p>
                      <Badge variant="outline" className="text-xs">{SENIORITY_LABELS[s.seniority as keyof typeof SENIORITY_LABELS] || s.seniority}</Badge>
                      <Badge variant="secondary" className="text-xs">{s.country}</Badge>
                      {s.region && <span className="text-xs text-muted-foreground">{s.region}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Base: {formatCurrency(s.baseSalaryMin)} – {formatCurrency(s.baseSalaryMax)} · OTE: {formatCurrency(s.oteMin)} – {formatCurrency(s.oteMax)} · {s.year}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-2">{Math.round(s.confidenceScore * 100)}%</span>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(s)}><Edit className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteInsight(s.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
