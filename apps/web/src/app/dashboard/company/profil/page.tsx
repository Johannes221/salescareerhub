'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companyProfileSchema } from '@salescareerhub/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES, FUNDING_STAGES, FUNDING_STAGE_LABELS, COMPANY_SIZES, REMOTE_TYPES, REMOTE_TYPE_LABELS } from '@salescareerhub/config';
import { getIdToken } from '@salescareerhub/auth/client';
import { Save, CheckCircle, AlertCircle, Building2, Globe, MapPin } from 'lucide-react';
import type { z } from 'zod';

type CompanyForm = z.infer<typeof companyProfileSchema>;

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<CompanyForm>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: { benefits: [] },
  });

  const benefits = watch('benefits') || [];

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/company/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); if (data.data) reset(data.data); }
    } catch {} finally { setLoading(false); }
  };

  const onSubmit = async (formData: CompanyForm) => {
    setSaving(true); setError(''); setSuccess(false);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
      else { const d = await res.json(); setError(d.error || 'Fehler'); }
    } catch { setError('Fehler beim Speichern'); } finally { setSaving(false); }
  };

  const addBenefit = () => {
    if (benefitInput.trim() && !benefits?.includes(benefitInput.trim())) {
      setValue('benefits', [...(benefits || []), benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  if (loading) return <div className="container py-8"><div className="h-96 bg-muted animate-pulse rounded-lg" /></div>;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Unternehmensprofil</h1>
        <p className="text-muted-foreground">Pflege dein Unternehmensprofil für Kandidaten und die Plattform.</p>
      </div>

      {success && <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-800 text-sm mb-4"><CheckCircle className="h-4 w-4" /> Profil gespeichert</div>}
      {error && <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4"><AlertCircle className="h-4 w-4" /> {error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5" /> Grunddaten</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo</label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center shrink-0 border-2 border-dashed">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <Button type="button" variant="outline" size="sm" disabled>
                    Logo hochladen
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG oder WebP, max. 2 MB. Wird nach Firebase Storage Setup aktiviert.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Firmenname *</label>
              <Input {...register('name')} placeholder="Dein Unternehmen GmbH" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Industrie</label>
                <Input {...register('industry')} placeholder="z.B. Enterprise SaaS" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mitarbeiteranzahl</label>
                <select {...register('employeeCount')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="">Auswählen</option>
                  {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Funding Stage</label>
                <select {...register('fundingStage')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="">Auswählen</option>
                  {FUNDING_STAGES.map((f) => <option key={f} value={f}>{FUNDING_STAGE_LABELS[f]}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Remote Policy</label>
                <select {...register('remotePolicy')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="">Auswählen</option>
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
                <Input {...register('city')} placeholder="z.B. München" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" /> Online-Präsenz</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Website</label><Input {...register('website')} placeholder="https://..." /></div>
            <div className="space-y-2"><label className="text-sm font-medium">LinkedIn URL</label><Input {...register('linkedinUrl')} placeholder="https://linkedin.com/company/..." /></div>
            <div className="space-y-2"><label className="text-sm font-medium">ATS Link</label><Input {...register('atsLink')} placeholder="https://..." /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Beschreibung & Benefits</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Unternehmensbeschreibung</label>
              <textarea {...register('description')} rows={4} placeholder="Beschreibe dein Unternehmen..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Benefits</label>
              <div className="flex gap-2">
                <Input value={benefitInput} onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
                  placeholder="Benefit hinzufügen..." />
                <Button type="button" variant="outline" onClick={addBenefit}>+</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {benefits?.map((b: string) => (
                  <Badge key={b} variant="secondary" className="cursor-pointer"
                    onClick={() => setValue('benefits', (benefits || []).filter((x: string) => x !== b))}>
                    {b} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sales Team Größe</label>
              <Input {...register('salesTeamSize')} placeholder="z.B. 25-50" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? 'Wird gespeichert...' : 'Profil speichern'}<Save className="ml-2 h-4 w-4" /></Button>
        </div>
      </form>
    </div>
  );
}
