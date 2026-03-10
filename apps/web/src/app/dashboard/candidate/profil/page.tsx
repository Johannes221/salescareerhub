'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { candidateProfileSchema } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JOB_ROLES, SENIORITY_LEVELS, SENIORITY_LABELS, REMOTE_TYPES, REMOTE_TYPE_LABELS, COUNTRIES } from '@/lib/config';
import { getIdToken } from '@/lib/auth/client';
import { Save, CheckCircle, AlertCircle, User, Briefcase, MapPin, Euro, FileText } from 'lucide-react';
import type { z } from 'zod';

type ProfileForm = z.infer<typeof candidateProfileSchema>;

export default function CandidateProfilePage() {
  const { dbUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<ProfileForm>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: { visibleToRecruiters: false, openToWork: true, languages: [], skills: [] },
  });

  const [skillInput, setSkillInput] = useState('');
  const [langInput, setLangInput] = useState('');
  const skills = watch('skills') || [];
  const languages = watch('languages') || [];

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/candidate/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (data.data) reset(data.data);
      }
    } catch {} finally { setLoading(false); }
  };

  const onSubmit = async (formData: ProfileForm) => {
    setSaving(true); setError(''); setSuccess(false);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
      else { const d = await res.json(); setError(d.error || 'Fehler beim Speichern'); }
    } catch { setError('Fehler beim Speichern'); } finally { setSaving(false); }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills?.includes(skillInput.trim())) {
      setValue('skills', [...(skills || []), skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setValue('skills', (skills || []).filter((s: string) => s !== skill));
  };

  if (loading) return <div className="container py-8"><div className="h-96 bg-muted animate-pulse rounded-lg" /></div>;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mein Profil</h1>
        <p className="text-muted-foreground">Vervollständige dein Profil, damit wir die besten Jobs für dich finden können.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-800 text-sm mb-4">
          <CheckCircle className="h-4 w-4" /> Profil erfolgreich gespeichert
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Persönliche Daten */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Persönliche Daten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vorname *</label>
                <Input {...register('firstName')} placeholder="Max" />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nachname *</label>
                <Input {...register('lastName')} placeholder="Mustermann" />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">E-Mail *</label>
                <Input {...register('email')} type="email" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon</label>
                <Input {...register('phone')} placeholder="+49..." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn URL</label>
              <Input {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kurzprofil</label>
              <textarea {...register('shortBio')} rows={3} placeholder="Kurze Beschreibung deiner Erfahrung und Ziele..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Standort */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> Standort & Präferenz</CardTitle>
          </CardHeader>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Remote-Präferenz</label>
              <select {...register('remotePreference')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option value="">Auswählen</option>
                {REMOTE_TYPES.map((r) => <option key={r} value={r}>{REMOTE_TYPE_LABELS[r]}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Berufserfahrung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5" /> Berufserfahrung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Aktuelle Rolle</label>
                <Input {...register('currentRole')} placeholder="z.B. Account Executive" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Zielrolle</label>
                <select {...register('targetRole')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="">Auswählen</option>
                  {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Seniority</label>
                <select {...register('seniority')} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="">Auswählen</option>
                  {SENIORITY_LEVELS.map((s) => <option key={s} value={s}>{SENIORITY_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Berufserfahrung (Jahre)</label>
                <Input {...register('yearsOfExperience', { valueAsNumber: true })} type="number" min={0} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kündigungsfrist</label>
              <Input {...register('noticePeriod')} placeholder="z.B. 3 Monate" />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Skills & Sprachen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Skills</label>
              <div className="flex gap-2">
                <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Skill hinzufügen..." />
                <Button type="button" variant="outline" onClick={addSkill}>+</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills?.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sprachen</label>
              <div className="flex gap-2">
                <Input value={langInput} onChange={(e) => setLangInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (langInput.trim() && !languages?.includes(langInput.trim())) {
                        setValue('languages', [...(languages || []), langInput.trim()]);
                        setLangInput('');
                      }
                    }
                  }}
                  placeholder="z.B. Deutsch, Englisch..." />
                <Button type="button" variant="outline" onClick={() => {
                  if (langInput.trim() && !languages?.includes(langInput.trim())) {
                    setValue('languages', [...(languages || []), langInput.trim()]);
                    setLangInput('');
                  }
                }}>+</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {languages?.map((lang: string) => (
                  <Badge key={lang} variant="outline" className="cursor-pointer"
                    onClick={() => setValue('languages', (languages || []).filter((l: string) => l !== lang))}>
                    {lang} ×
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gehalt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Euro className="h-5 w-5" /> Gehaltsvorstellung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Salary (€/Jahr)</label>
                <Input {...register('salaryExpectationBase', { valueAsNumber: true })} type="number" min={0} placeholder="z.B. 80000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OTE (€/Jahr)</label>
                <Input {...register('salaryExpectationOte', { valueAsNumber: true })} type="number" min={0} placeholder="z.B. 140000" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sichtbarkeit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sichtbarkeit & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Open to Work</p>
                <p className="text-xs text-muted-foreground">Zeige an, dass du offen für neue Rollen bist</p>
              </div>
              <input type="checkbox" {...register('openToWork')} className="h-5 w-5 rounded border-gray-300" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Sichtbar für Recruiter</p>
                <p className="text-xs text-muted-foreground">Dein Profil kann von unserem Team eingesehen werden</p>
              </div>
              <input type="checkbox" {...register('visibleToRecruiters')} className="h-5 w-5 rounded border-gray-300" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Wird gespeichert...' : 'Profil speichern'}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
