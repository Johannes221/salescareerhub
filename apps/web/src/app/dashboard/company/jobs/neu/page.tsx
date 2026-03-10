'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobSchema } from '@salescareerhub/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JOB_ROLES, SENIORITY_LEVELS, SENIORITY_LABELS, EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_LABELS, REMOTE_TYPES, REMOTE_TYPE_LABELS, COUNTRIES } from '@salescareerhub/config';
import { getIdToken } from '@salescareerhub/auth/client';
import { Save, CheckCircle, AlertCircle, Briefcase, Euro, MapPin, FileText } from 'lucide-react';
import type { z } from 'zod';

type JobForm = z.infer<typeof jobSchema>;

export default function CreateJobPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: { employmentType: 'fulltime', remoteType: 'hybrid', currency: 'EUR', sourceType: 'direct_company_posting', tags: [] },
  });

  const tags = watch('tags') || [];

  const onSubmit = async (formData: JobForm) => {
    setSaving(true); setError('');
    try {
      const token = await getIdToken();
      const res = await fetch('/api/company/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) { router.push('/dashboard/company/jobs?created=true'); }
      else { const d = await res.json(); setError(d.error || 'Fehler beim Erstellen'); }
    } catch { setError('Fehler beim Erstellen'); } finally { setSaving(false); }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags?.includes(tagInput.trim())) {
      setValue('tags', [...(tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Job erstellen</h1>
        <p className="text-muted-foreground">Erstelle eine neue Stellenanzeige. Nach dem Erstellen wird sie von uns geprüft und freigeschaltet.</p>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4"><AlertCircle className="h-4 w-4" /> {error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5" /> Stelleninformationen</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jobtitel *</label>
              <Input {...register('title')} placeholder="z.B. Enterprise Account Executive – DACH" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rolle *</label>
                <select {...register('roleCategory')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="">Auswählen</option>
                  {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.roleCategory && <p className="text-xs text-destructive">{errors.roleCategory.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seniority *</label>
                <select {...register('seniority')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="">Auswählen</option>
                  {SENIORITY_LEVELS.map((s) => <option key={s} value={s}>{SENIORITY_LABELS[s]}</option>)}
                </select>
                {errors.seniority && <p className="text-xs text-destructive">{errors.seniority.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Beschäftigungsart</label>
                <select {...register('employmentType')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  {EMPLOYMENT_TYPES.map((e) => <option key={e} value={e}>{EMPLOYMENT_TYPE_LABELS[e]}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Remote-Typ</label>
                <select {...register('remoteType')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  {REMOTE_TYPES.map((r) => <option key={r} value={r}>{REMOTE_TYPE_LABELS[r]}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> Standort</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Land</label>
                <select {...register('country')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="">Auswählen</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stadt</label>
                <Input {...register('location')} placeholder="z.B. München" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Euro className="h-5 w-5" /> Vergütung</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Salary Min (€)</label>
                <Input {...register('salaryMin', { valueAsNumber: true })} type="number" min={0} placeholder="z.B. 80000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Salary Max (€)</label>
                <Input {...register('salaryMax', { valueAsNumber: true })} type="number" min={0} placeholder="z.B. 120000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">OTE Min (€)</label>
                <Input {...register('oteMin', { valueAsNumber: true })} type="number" min={0} placeholder="z.B. 140000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OTE Max (€)</label>
                <Input {...register('oteMax', { valueAsNumber: true })} type="number" min={0} placeholder="z.B. 200000" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Beschreibung</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stellenbeschreibung *</label>
              <textarea {...register('description')} rows={6} placeholder="Beschreibe die Stelle, Aufgaben und Verantwortlichkeiten..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Anforderungen</label>
              <textarea {...register('requirements')} rows={4} placeholder="Was bringt der ideale Kandidat mit?"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Benefits</label>
              <textarea {...register('benefits')} rows={3} placeholder="Was bietet ihr Kandidaten?"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Tag hinzufügen..." />
                <Button type="button" variant="outline" onClick={addTag}>+</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer"
                    onClick={() => setValue('tags', (tags || []).filter((t: string) => t !== tag))}>{tag} ×</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p><strong>Hinweis:</strong> Deine Stellenanzeige wird nach dem Erstellen von unserem Team geprüft und innerhalb von 24 Stunden freigeschaltet. Kandidaten können sich nicht direkt bewerben – wir screenen alle Interessenten und leiten passende Kandidaten persönlich an dich weiter.</p>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Abbrechen</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Wird erstellt...' : 'Job erstellen'}<Save className="ml-2 h-4 w-4" /></Button>
        </div>
      </form>
    </div>
  );
}
