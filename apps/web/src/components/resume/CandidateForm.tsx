'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NormalizedCandidateProfile, ConfidenceLevel } from '@/lib/resume/schemas';

// ─── Form State Types ───────────────────────────────────────
export interface CandidateFormData {
  aktuelleRolle: string;
  zielrolle: string;
  seniority: string;
  berufserfahrungJahre: string;
  kuendigungsfrist: string;
  skills: string;
  sprachen: string;
  gehaltBaseJahr: string;
  gehaltOTEJahr: string;
  standort: string;
  arbeitsmodellPraeferenz: string;
  telefon: string;
  email: string;
  linkedinUrl: string;
}

export function emptyFormData(): CandidateFormData {
  return {
    aktuelleRolle: '',
    zielrolle: '',
    seniority: '',
    berufserfahrungJahre: '',
    kuendigungsfrist: '',
    skills: '',
    sprachen: '',
    gehaltBaseJahr: '',
    gehaltOTEJahr: '',
    standort: '',
    arbeitsmodellPraeferenz: '',
    telefon: '',
    email: '',
    linkedinUrl: '',
  };
}

export function profileToFormData(profile: NormalizedCandidateProfile): CandidateFormData {
  return {
    aktuelleRolle: profile.aktuelleRolle.value || '',
    zielrolle: profile.zielrolle.value || '',
    seniority: profile.seniority.value || '',
    berufserfahrungJahre: profile.berufserfahrungJahre.value !== null ? String(profile.berufserfahrungJahre.value) : '',
    kuendigungsfrist: profile.kuendigungsfrist.value || '',
    skills: (profile.skills.value || []).join(', '),
    sprachen: (profile.sprachen.value || []).map((l) => `${l.sprache}${l.level ? ` (${l.level})` : ''}`).join(', '),
    gehaltBaseJahr: profile.gehaltBaseJahr.value !== null ? String(profile.gehaltBaseJahr.value) : '',
    gehaltOTEJahr: profile.gehaltOTEJahr.value !== null ? String(profile.gehaltOTEJahr.value) : '',
    standort: profile.standort.value || '',
    arbeitsmodellPraeferenz: profile.arbeitsmodellPraeferenz.value || '',
    telefon: profile.telefon.value || '',
    email: profile.email.value || '',
    linkedinUrl: profile.linkedinUrl.value || '',
  };
}

// ─── Props ──────────────────────────────────────────────────
interface CandidateFormProps {
  formData: CandidateFormData;
  onFieldChange: (field: keyof CandidateFormData, value: string) => void;
  autoFilledFields: Set<string>;
  extractedProfile: NormalizedCandidateProfile | null;
}

const SENIORITY_OPTIONS = [
  { value: '', label: 'Bitte wählen' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'VP' },
  { value: 'c_level', label: 'C-Level' },
];

const WORK_MODEL_OPTIONS = [
  { value: '', label: 'Bitte wählen' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Vor Ort' },
];

function FieldWrapper({
  label,
  fieldKey,
  autoFilled,
  confidence,
  children,
}: {
  label: string;
  fieldKey: string;
  autoFilled: boolean;
  confidence?: ConfidenceLevel;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={fieldKey} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {autoFilled && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] text-blue-600 font-medium">
            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
            </svg>
            Automatisch
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function CandidateForm({ formData, onFieldChange, autoFilledFields, extractedProfile }: CandidateFormProps) {
  const getConfidence = (key: string): ConfidenceLevel | undefined => {
    if (!extractedProfile) return undefined;
    const field = extractedProfile[key as keyof NormalizedCandidateProfile];
    if (field && typeof field === 'object' && 'confidence' in field) {
      return field.confidence as ConfidenceLevel | undefined;
    }
    return undefined;
  };

  const isAutoFilled = (key: string) => autoFilledFields.has(key);

  return (
    <div className="space-y-6">
      {/* Berufserfahrung */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Berufserfahrung</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Aktuelle Rolle" fieldKey="aktuelleRolle" autoFilled={isAutoFilled('aktuelleRolle')} confidence={getConfidence('aktuelleRolle')}>
            <Input
              id="aktuelleRolle"
              value={formData.aktuelleRolle}
              onChange={(e) => onFieldChange('aktuelleRolle', e.target.value)}
              placeholder="z. B. Account Executive"
              className={cn(isAutoFilled('aktuelleRolle') && 'ring-1 ring-blue-200')}
            />
          </FieldWrapper>

          <FieldWrapper label="Zielrolle" fieldKey="zielrolle" autoFilled={isAutoFilled('zielrolle')} confidence={getConfidence('zielrolle')}>
            <Input
              id="zielrolle"
              value={formData.zielrolle}
              onChange={(e) => onFieldChange('zielrolle', e.target.value)}
              placeholder="z. B. Sales Manager"
              className={cn(isAutoFilled('zielrolle') && 'ring-1 ring-blue-200')}
            />
          </FieldWrapper>

          <FieldWrapper label="Seniority" fieldKey="seniority" autoFilled={isAutoFilled('seniority')} confidence={getConfidence('seniority')}>
            <select
              id="seniority"
              value={formData.seniority}
              onChange={(e) => onFieldChange('seniority', e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isAutoFilled('seniority') && 'ring-1 ring-blue-200',
              )}
            >
              {SENIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FieldWrapper>

          <FieldWrapper label="Berufserfahrung (Jahre)" fieldKey="berufserfahrungJahre" autoFilled={isAutoFilled('berufserfahrungJahre')} confidence={getConfidence('berufserfahrungJahre')}>
            <Input
              id="berufserfahrungJahre"
              type="number"
              min={0}
              max={50}
              value={formData.berufserfahrungJahre}
              onChange={(e) => onFieldChange('berufserfahrungJahre', e.target.value)}
              placeholder="z. B. 6"
              className={cn(isAutoFilled('berufserfahrungJahre') && 'ring-1 ring-blue-200')}
            />
          </FieldWrapper>

          <FieldWrapper label="Kündigungsfrist" fieldKey="kuendigungsfrist" autoFilled={isAutoFilled('kuendigungsfrist')} confidence={getConfidence('kuendigungsfrist')}>
            <Input
              id="kuendigungsfrist"
              value={formData.kuendigungsfrist}
              onChange={(e) => onFieldChange('kuendigungsfrist', e.target.value)}
              placeholder="z. B. 3 Monate"
              className={cn(isAutoFilled('kuendigungsfrist') && 'ring-1 ring-blue-200')}
            />
          </FieldWrapper>

          <FieldWrapper label="Standort" fieldKey="standort" autoFilled={isAutoFilled('standort')} confidence={getConfidence('standort')}>
            <Input
              id="standort"
              value={formData.standort}
              onChange={(e) => onFieldChange('standort', e.target.value)}
              placeholder="z. B. München"
              className={cn(isAutoFilled('standort') && 'ring-1 ring-blue-200')}
            />
          </FieldWrapper>

          <FieldWrapper label="Arbeitsmodell" fieldKey="arbeitsmodellPraeferenz" autoFilled={isAutoFilled('arbeitsmodellPraeferenz')} confidence={getConfidence('arbeitsmodellPraeferenz')}>
            <select
              id="arbeitsmodellPraeferenz"
              value={formData.arbeitsmodellPraeferenz}
              onChange={(e) => onFieldChange('arbeitsmodellPraeferenz', e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isAutoFilled('arbeitsmodellPraeferenz') && 'ring-1 ring-blue-200',
              )}
            >
              {WORK_MODEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FieldWrapper>
        </CardContent>
      </Card>

      {/* Skills & Sprachen */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Skills & Sprachen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FieldWrapper label="Skills" fieldKey="skills" autoFilled={isAutoFilled('skills')} confidence={getConfidence('skills')}>
            <textarea
              id="skills"
              value={formData.skills}
              onChange={(e) => onFieldChange('skills', e.target.value)}
              placeholder="z. B. SaaS Sales, MEDDIC, CRM, Salesforce"
              rows={3}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isAutoFilled('skills') && 'ring-1 ring-blue-200',
              )}
            />
            <p className="text-xs text-muted-foreground">Kommagetrennt eingeben</p>
          </FieldWrapper>

          <FieldWrapper label="Sprachen" fieldKey="sprachen" autoFilled={isAutoFilled('sprachen')} confidence={getConfidence('sprachen')}>
            <textarea
              id="sprachen"
              value={formData.sprachen}
              onChange={(e) => onFieldChange('sprachen', e.target.value)}
              placeholder="z. B. Deutsch (Muttersprache), Englisch (Fließend)"
              rows={2}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isAutoFilled('sprachen') && 'ring-1 ring-blue-200',
              )}
            />
            <p className="text-xs text-muted-foreground">Format: Sprache (Level), kommagetrennt</p>
          </FieldWrapper>
        </CardContent>
      </Card>

      {/* Gehaltsvorstellung */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Gehaltsvorstellung</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Grundgehalt (jährlich, EUR)" fieldKey="gehaltBaseJahr" autoFilled={isAutoFilled('gehaltBaseJahr')} confidence={getConfidence('gehaltBaseJahr')}>
            <Input
              id="gehaltBaseJahr"
              type="number"
              min={0}
              step={1000}
              value={formData.gehaltBaseJahr}
              onChange={(e) => onFieldChange('gehaltBaseJahr', e.target.value)}
              placeholder="z. B. 60000"
              className={cn(isAutoFilled('gehaltBaseJahr') && 'ring-1 ring-blue-200')}
            />
          </FieldWrapper>

          <FieldWrapper label="OTE (jährlich, EUR)" fieldKey="gehaltOTEJahr" autoFilled={isAutoFilled('gehaltOTEJahr')} confidence={getConfidence('gehaltOTEJahr')}>
            <Input
              id="gehaltOTEJahr"
              type="number"
              min={0}
              step={1000}
              value={formData.gehaltOTEJahr}
              onChange={(e) => onFieldChange('gehaltOTEJahr', e.target.value)}
              placeholder="z. B. 90000"
              className={cn(isAutoFilled('gehaltOTEJahr') && 'ring-1 ring-blue-200')}
            />
          </FieldWrapper>
        </CardContent>
      </Card>

      {/* Kontaktdaten */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Kontaktdaten</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="E-Mail" fieldKey="email" autoFilled={isAutoFilled('email')} confidence={getConfidence('email')}>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="name@example.com"
              className={cn(isAutoFilled('email') && 'ring-1 ring-blue-200')}
            />
          </FieldWrapper>

          <FieldWrapper label="Telefon" fieldKey="telefon" autoFilled={isAutoFilled('telefon')} confidence={getConfidence('telefon')}>
            <Input
              id="telefon"
              type="tel"
              value={formData.telefon}
              onChange={(e) => onFieldChange('telefon', e.target.value)}
              placeholder="+49 170 1234567"
              className={cn(isAutoFilled('telefon') && 'ring-1 ring-blue-200')}
            />
          </FieldWrapper>

          <FieldWrapper label="LinkedIn URL" fieldKey="linkedinUrl" autoFilled={isAutoFilled('linkedinUrl')} confidence={getConfidence('linkedinUrl')}>
            <Input
              id="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => onFieldChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className={cn(isAutoFilled('linkedinUrl') && 'ring-1 ring-blue-200')}
            />
          </FieldWrapper>
        </CardContent>
      </Card>

      {/* Sichtbarkeit & Status (Platzhalter) */}
      <Card className="opacity-60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-muted-foreground">Sichtbarkeit & Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Diese Einstellungen werden in einer späteren Version verfügbar sein.
          </p>
        </CardContent>
      </Card>

      {/* Submit-Bereich */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Bitte überprüfen Sie alle Angaben vor dem Absenden.
        </p>
        <Button type="button" size="lg">
          Profil speichern
        </Button>
      </div>
    </div>
  );
}
