'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { NormalizedCandidateProfile, ConfidenceLevel } from '@/lib/resume/schemas';
import { cn } from '@/lib/utils';

interface ReviewPanelProps {
  profile: NormalizedCandidateProfile;
  warnings: string[];
  onDismiss: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  aktuelleRolle: 'Aktuelle Rolle',
  zielrolle: 'Zielrolle',
  seniority: 'Seniority',
  berufserfahrungJahre: 'Berufserfahrung (Jahre)',
  kuendigungsfrist: 'Kündigungsfrist',
  skills: 'Skills',
  sprachen: 'Sprachen',
  gehaltBaseJahr: 'Grundgehalt (jährlich)',
  gehaltOTEJahr: 'OTE (jährlich)',
  berufsstationen: 'Berufsstationen',
  standort: 'Standort',
  arbeitsmodellPraeferenz: 'Arbeitsmodell',
  telefon: 'Telefon',
  email: 'E-Mail',
  linkedinUrl: 'LinkedIn',
};

function confidenceBadge(level?: ConfidenceLevel) {
  if (!level) return null;
  const styles: Record<ConfidenceLevel, string> = {
    high: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-red-100 text-red-700 border-red-200',
    unknown: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  const labels: Record<ConfidenceLevel, string> = {
    high: 'Sicher',
    medium: 'Wahrscheinlich',
    low: 'Unsicher',
    unknown: 'Unbekannt',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', styles[level])}>
      {labels[level]}
    </span>
  );
}

function hasValue(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string' && val.trim() === '') return false;
  if (Array.isArray(val) && val.length === 0) return false;
  return true;
}

function formatFieldValue(key: string, value: unknown): string {
  if (!hasValue(value)) return '—';
  if (Array.isArray(value)) {
    if (key === 'sprachen') {
      return (value as Array<{ sprache: string; level?: string | null }>)
        .map((l) => `${l.sprache}${l.level ? ` (${l.level})` : ''}`)
        .join(', ');
    }
    if (key === 'berufsstationen') {
      return `${(value as Array<unknown>).length} Station(en)`;
    }
    return (value as string[]).join(', ');
  }
  if (typeof value === 'number') return String(value);
  return String(value);
}

export function ReviewPanel({ profile, warnings, onDismiss }: ReviewPanelProps) {
  const recognized: string[] = [];
  const missing: string[] = [];
  const uncertain: string[] = [];

  for (const [key, field] of Object.entries(profile)) {
    const label = FIELD_LABELS[key] || key;
    const typedField = field as { value: unknown; confidence?: ConfidenceLevel };

    if (!hasValue(typedField.value)) {
      missing.push(label);
    } else if (typedField.confidence === 'low' || typedField.confidence === 'unknown') {
      uncertain.push(label);
    } else {
      recognized.push(label);
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Erkannte Daten prüfen
            </CardTitle>
            <CardDescription className="mt-1">
              Bitte überprüfen Sie die automatisch übernommenen Angaben.
            </CardDescription>
          </div>
          <button
            onClick={onDismiss}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Review schließen"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-green-700">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {recognized.length} erkannt
          </span>
          {missing.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
              {missing.length} nicht erkannt
            </span>
          )}
          {uncertain.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">
              {uncertain.length} unsicher
            </span>
          )}
        </div>

        {/* Field details */}
        <div className="divide-y divide-border rounded-md border bg-background">
          {Object.entries(profile).map(([key, field]) => {
            const typedField = field as { value: unknown; confidence?: ConfidenceLevel };
            const label = FIELD_LABELS[key] || key;
            const has = hasValue(typedField.value);

            return (
              <div key={key} className={cn('flex items-center justify-between px-3 py-2 text-sm', !has && 'opacity-50')}>
                <div className="flex items-center gap-2">
                  <span className={cn('h-1.5 w-1.5 rounded-full', has ? 'bg-green-500' : 'bg-gray-300')} />
                  <span className="font-medium text-foreground/80">{label}</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="max-w-[200px] truncate text-muted-foreground">
                    {formatFieldValue(key, typedField.value)}
                  </span>
                  {has && confidenceBadge(typedField.confidence)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-xs font-medium text-amber-800 mb-1">Hinweise:</p>
            <ul className="text-xs text-amber-700 space-y-0.5">
              {warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
