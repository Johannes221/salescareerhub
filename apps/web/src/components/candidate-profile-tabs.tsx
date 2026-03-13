'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getIdToken } from '@/lib/auth/client';
import {
  CAREER_GOAL_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  COUNTRIES,
  JOB_ROLES,
  LANGUAGE_OPTIONS,
  REMOTE_TYPE_LABELS,
  REMOTE_TYPES,
  SALES_INDUSTRY_OPTIONS,
  SALES_MOTION_OPTIONS,
  SALES_SKILL_SUGGESTIONS,
  SENIORITY_LABELS,
} from '@/lib/config';
import { cn, deriveSeniorityFromYears, formatCurrency, formatSalaryRange, getCandidateSalaryGuidance } from '@/lib/utils';
import {
  BriefcaseBusiness,
  FileText,
  Globe,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Target,
  TrendingUp,
  Upload,
  User,
  Wallet,
  X,
} from 'lucide-react';

type ProfileRecord = Record<string, unknown>;
type TabKey = 'personal' | 'career' | 'sales' | 'documents' | 'preferences';
type ArrayField =
  | 'remotePreference'
  | 'desiredJobRoles'
  | 'desiredIndustries'
  | 'careerGoals'
  | 'preferredCompanyTypes'
  | 'skills'
  | 'languages'
  | 'dealSizePreference'
  | 'salesMotionExperience'
  | 'industriesExperience'
  | 'locationPreference';

type LanguageEntry = {
  language: string;
  level: string;
};

type EditableProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  location: string;
  country: string;
  remotePreference: string[];
  locationPreference: string[];
  yearsOfExperience: number;
  currentRole: string;
  targetRole: string;
  desiredJobRoles: string[];
  desiredIndustries: string[];
  careerGoals: string[];
  preferredCompanyTypes: string[];
  seniority: string;
  languages: string[];
  languageProficiencies: LanguageEntry[];
  salaryExpectationBase: number;
  salaryExpectationOte: number;
  salaryExpectationCurrency: string;
  noticePeriod: string;
  salesCycleLength: string;
  skills: string[];
  dealSizePreference: string[];
  salesMotionExperience: string[];
  workExperiences: unknown[];
  educations: unknown[];
  cvUrl: string;
  cvFileName: string;
  cvUploadDate: string | null;
  googlePlaceId: string;
  googlePlaceData?: Record<string, unknown>;
  onboardingStep: number;
  onboardingSource: 'manual' | 'cv';
  averageDealSize: string;
  largestDealClosed: string;
  averageSalesCycle: string;
  territorySize: string;
  industriesExperience: string[];
};

const TABS: Array<{ key: TabKey; label: string; description: string; icon: React.ElementType }> = [
  { key: 'personal', label: 'Persönliche Daten', description: 'Kontakt, Name und Standort', icon: User },
  { key: 'career', label: 'Karriereziele', description: 'Rolle, OTE und Zielprofil', icon: Target },
  { key: 'sales', label: 'Erfahrung & Sales-Fokus', description: 'Hintergrund, Umfeld und optionale Kennzahlen', icon: TrendingUp },
  { key: 'documents', label: 'Dokumente', description: 'CV und Unterlagen', icon: FileText },
  { key: 'preferences', label: 'Präferenzen', description: 'Skills, Sprachen, Wunschumfeld', icon: Globe },
];

const LOCATION_PREFERENCE_OPTIONS = [
  'In meiner Stadt bleiben',
  'In meiner Region (50km)',
  'Überall in Deutschland',
  'DACH-Region',
  'Überall in der EU',
] as const;

const ENTRY_LEVEL_OPTION = 'Noch keine direkte Sales-Erfahrung';
const DEAL_SIZE_OPTIONS = [ENTRY_LEVEL_OPTION, '< 10k €', '10k - 50k €', '50k - 100k €', '100k - 500k €', '500k+ €'] as const;
const SALES_CYCLE_OPTIONS = [ENTRY_LEVEL_OPTION, '< 1 Monat', '1-3 Monate', '3-6 Monate', '6-12 Monate', '12+ Monate'] as const;
const SELECT_CLASSES = 'flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring/20';

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function normalizeProfile(profile: ProfileRecord): EditableProfile {
  const rawLanguageEntries = Array.isArray(profile.languageProficiencies)
    ? profile.languageProficiencies
    : [];

  const languageProficiencies = rawLanguageEntries.length > 0
    ? rawLanguageEntries.map((entry) => ({
      language: String((entry as LanguageEntry).language || '').trim(),
      level: String((entry as LanguageEntry).level || 'Konversationssicher').trim(),
    })).filter((entry) => entry.language)
    : toStringArray(profile.languages).map((language) => ({
      language,
      level: 'Konversationssicher',
    }));

  const languages = languageProficiencies.length > 0
    ? languageProficiencies.map((entry) => entry.language)
    : ['Deutsch'];

  const yearsOfExperience = Number(profile.yearsOfExperience ?? 0);

  return {
    firstName: String(profile.firstName || ''),
    lastName: String(profile.lastName || ''),
    email: String(profile.email || ''),
    phone: String(profile.phone || ''),
    linkedinUrl: String(profile.linkedinUrl || ''),
    location: String(profile.location || ''),
    country: String(profile.country || 'Deutschland'),
    remotePreference: toStringArray(profile.remotePreference),
    locationPreference: toStringArray(profile.locationPreference),
    yearsOfExperience,
    currentRole: String(profile.currentRole || ''),
    targetRole: String(profile.targetRole || ''),
    desiredJobRoles: toStringArray(profile.desiredJobRoles),
    desiredIndustries: toStringArray(profile.desiredIndustries),
    careerGoals: toStringArray(profile.careerGoals),
    preferredCompanyTypes: toStringArray(profile.preferredCompanyTypes),
    seniority: String(profile.seniority || deriveSeniorityFromYears(yearsOfExperience) || ''),
    languages,
    languageProficiencies: languageProficiencies.length > 0
      ? languageProficiencies
      : [{ language: 'Deutsch', level: 'Muttersprachliches Niveau' }],
    salaryExpectationBase: Number(profile.salaryExpectationBase ?? 60000),
    salaryExpectationOte: Number(profile.salaryExpectationOte ?? 100000),
    salaryExpectationCurrency: String(profile.salaryExpectationCurrency || 'EUR'),
    noticePeriod: String(profile.noticePeriod || ''),
    salesCycleLength: String(profile.salesCycleLength || ''),
    skills: toStringArray(profile.skills),
    dealSizePreference: toStringArray(profile.dealSizePreference),
    salesMotionExperience: toStringArray(profile.salesMotionExperience),
    workExperiences: Array.isArray(profile.workExperiences) ? profile.workExperiences : [],
    educations: Array.isArray(profile.educations) ? profile.educations : [],
    cvUrl: String(profile.cvUrl || ''),
    cvFileName: String(profile.cvFileName || ''),
    cvUploadDate: profile.cvUploadDate ? String(profile.cvUploadDate) : null,
    googlePlaceId: String(profile.googlePlaceId || ''),
    googlePlaceData: typeof profile.googlePlaceData === 'object' && profile.googlePlaceData !== null
      ? profile.googlePlaceData as Record<string, unknown>
      : undefined,
    onboardingStep: Number(profile.onboardingStep ?? 5),
    onboardingSource: profile.onboardingSource === 'cv' ? 'cv' : 'manual',
    averageDealSize: profile.averageDealSize ? String(profile.averageDealSize) : '',
    largestDealClosed: profile.largestDealClosed ? String(profile.largestDealClosed) : '',
    averageSalesCycle: profile.averageSalesCycle ? String(profile.averageSalesCycle) : '',
    territorySize: String(profile.territorySize || ''),
    industriesExperience: toStringArray(profile.industriesExperience),
  };
}

function buildProfilePayload(profile: EditableProfile) {
  return {
    ...profile,
    languageProficiencies: profile.languageProficiencies,
    languages: profile.languageProficiencies.map((entry) => entry.language).filter(Boolean),
  };
}

export function CandidateProfileTabs({
  profile,
  onProfileUpdated,
}: {
  profile: ProfileRecord;
  onProfileUpdated: (nextProfile: EditableProfile) => void;
}) {
  const normalizedProfile = useMemo(() => normalizeProfile(profile), [profile]);
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [editingTab, setEditingTab] = useState<TabKey | null>(null);
  const [draft, setDraft] = useState<EditableProfile>(normalizedProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const salaryGuidance = useMemo(() => getCandidateSalaryGuidance(draft.yearsOfExperience), [draft.yearsOfExperience]);

  const beginEdit = (tab: TabKey) => {
    setDraft(normalizeProfile(profile));
    setEditingTab(tab);
    setActiveTab(tab);
    setError('');
  };

  const setField = <K extends keyof EditableProfile>(field: K, value: EditableProfile[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const toggleArrayValue = (field: ArrayField, value: string) => {
    const currentValues = draft[field];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((entry) => entry !== value)
      : [...currentValues, value];

    setField(field, nextValues as EditableProfile[typeof field]);

    if (field === 'languages') {
      setField(
        'languageProficiencies',
        nextValues.map((language) => ({
          language,
          level: draft.languageProficiencies.find((entry) => entry.language === language)?.level || 'Konversationssicher',
        })),
      );
    }
  };

  const addTag = (field: ArrayField, value: string) => {
    const normalized = value.trim();

    if (!normalized) {
      return;
    }

    const nextValues = Array.from(new Set([...draft[field], normalized]));
    setField(field, nextValues as EditableProfile[typeof field]);

    if (field === 'languages') {
      setField(
        'languageProficiencies',
        nextValues.map((language) => ({
          language,
          level: draft.languageProficiencies.find((entry) => entry.language === language)?.level || 'Konversationssicher',
        })),
      );
    }
  };

  const removeTag = (field: ArrayField, value: string) => {
    const nextValues = draft[field].filter((entry) => entry !== value);
    setField(field, nextValues as EditableProfile[typeof field]);

    if (field === 'languages') {
      setField(
        'languageProficiencies',
        draft.languageProficiencies.filter((entry) => entry.language !== value),
      );
    }
  };

  const saveTab = async (tab: TabKey) => {
    setSaving(true);
    setError('');

    try {
      const token = await getIdToken();
      const profileResponse = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildProfilePayload(draft)),
      });
      const profilePayload = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profilePayload.error || 'Fehler beim Speichern');
      }

      let nextProfile = normalizeProfile(profilePayload.data as ProfileRecord);

      if (tab === 'sales') {
        const metricsResponse = await fetch('/api/candidate/profile/metrics', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            averageDealSize: draft.averageDealSize,
            largestDealClosed: draft.largestDealClosed,
            averageSalesCycle: draft.averageSalesCycle,
            salesMotionExperience: draft.salesMotionExperience.join(', '),
            industriesExperience: draft.industriesExperience,
            territorySize: draft.territorySize,
          }),
        });
        const metricsPayload = await metricsResponse.json().catch(() => null);

        if (!metricsResponse.ok) {
          throw new Error(metricsPayload?.error || 'Fehler beim Speichern');
        }

        nextProfile = normalizeProfile({
          ...nextProfile,
          ...metricsPayload?.data,
        });
      }

      onProfileUpdated(nextProfile);
      setDraft(nextProfile);
      setEditingTab(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const isEditingThisTab = editingTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'group rounded-2xl border p-4 text-left transition-all',
                isActive
                  ? 'border-primary/40 bg-primary/[0.06] shadow-sm ring-1 ring-primary/10'
                  : 'bg-background/80 hover:border-primary/20 hover:bg-accent/30',
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                  isActive ? 'border-primary/20 bg-primary/10 text-primary' : 'border-border bg-muted/40 text-muted-foreground',
                )}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('text-sm font-semibold', isActive ? 'text-foreground' : 'text-foreground/90')}>{tab.label}</span>
                    {isEditingThisTab ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Bearbeitung</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{tab.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {activeTab === 'personal' && (
        <SectionShell
          title="Persönliche Daten"
          description="Kontaktdaten, Name und Standort für dein Profil."
          editing={editingTab === 'personal'}
          saving={saving}
          error={error}
          onEdit={() => beginEdit('personal')}
          onCancel={() => setEditingTab(null)}
          onSave={() => saveTab('personal')}
        >
          {editingTab === 'personal' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Vorname" icon={User}>
                <Input value={draft.firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('firstName', e.target.value)} placeholder="z. B. Johannes" className="h-11 rounded-xl" />
              </FormField>
              <FormField label="Nachname" icon={User}>
                <Input value={draft.lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('lastName', e.target.value)} placeholder="z. B. Schartl" className="h-11 rounded-xl" />
              </FormField>
              <FormField label="E-Mail-Adresse" icon={Mail} className="md:col-span-2">
                <Input value={draft.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('email', e.target.value)} placeholder="name@beispiel.de" className="h-11 rounded-xl" />
              </FormField>
              <FormField label="Telefonnummer" icon={Phone}>
                <Input value={draft.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('phone', e.target.value)} placeholder="+49 ..." className="h-11 rounded-xl" />
              </FormField>
              <FormField label="LinkedIn Profil" icon={Linkedin}>
                <Input value={draft.linkedinUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." className="h-11 rounded-xl" />
              </FormField>
              <FormField label="Standort" icon={MapPin}>
                <Input value={draft.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('location', e.target.value)} placeholder="Stadt oder Region" className="h-11 rounded-xl" />
              </FormField>
              <FormField label="Land" icon={MapPin}>
                <select value={draft.country} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('country', e.target.value)} className={SELECT_CLASSES}>
                  {COUNTRIES.map((country: string) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </FormField>
            </div>
          ) : (
            <SummaryGrid
              items={[
                { label: 'Vorname', value: normalizedProfile.firstName || '–', icon: User },
                { label: 'Nachname', value: normalizedProfile.lastName || '–', icon: User },
                { label: 'E-Mail-Adresse', value: normalizedProfile.email || '–', icon: Mail },
                { label: 'Telefonnummer', value: normalizedProfile.phone || 'Nicht hinterlegt', icon: Phone },
                { label: 'LinkedIn Profil', value: normalizedProfile.linkedinUrl || 'Nicht hinterlegt', icon: Linkedin },
                { label: 'Standort', value: normalizedProfile.location || 'Nicht hinterlegt', icon: MapPin },
                { label: 'Land', value: normalizedProfile.country || '–', icon: MapPin },
              ]}
            />
          )}
        </SectionShell>
      )}

      {activeTab === 'career' && (
        <SectionShell
          title="Karriereziele"
          description="Definiere Zielrolle, Arbeitsmodell und eine realistische Gehaltsspanne für deinen nächsten Schritt."
          editing={editingTab === 'career'}
          saving={saving}
          error={error}
          onEdit={() => beginEdit('career')}
          onCancel={() => setEditingTab(null)}
          onSave={() => saveTab('career')}
        >
          {editingTab === 'career' ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Aktuelle Rolle" icon={BriefcaseBusiness}>
                  <Input value={draft.currentRole} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('currentRole', e.target.value)} placeholder="z. B. Berufseinstieg, SDR, Account Executive" className="h-11 rounded-xl" />
                </FormField>
                <FormField label="Zielrolle" icon={Target}>
                  <Input value={draft.targetRole} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('targetRole', e.target.value)} placeholder="z. B. Junior SDR, AE oder RevOps" className="h-11 rounded-xl" />
                </FormField>
                <FormField label="Kündigungsfrist" icon={Target} className="md:col-span-2">
                  <Input value={draft.noticePeriod} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('noticePeriod', e.target.value)} placeholder="z. B. 3 Monate" className="h-11 rounded-xl" />
                </FormField>
              </div>
              <Subsection title="Gehaltsorientierung" description={`Auf Basis von ${draft.yearsOfExperience || 0} Jahren Erfahrung ergibt sich als grobe Orientierung aktuell ${salaryGuidance.label}.`}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Grundgehalt</p>
                    <p className="mt-1 text-sm font-semibold">{formatSalaryRange(salaryGuidance.baseMin, salaryGuidance.baseMax)}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">OTE</p>
                    <p className="mt-1 text-sm font-semibold">{formatSalaryRange(salaryGuidance.oteMin, salaryGuidance.oteMax)}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm font-medium">
                      <span>Grundgehalt</span>
                      <span className="text-primary">{formatCurrency(draft.salaryExpectationBase || 0)}</span>
                    </div>
                    <input
                      type="range"
                      min={25000}
                      max={250000}
                      step={5000}
                      value={draft.salaryExpectationBase}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const nextBase = Number(e.target.value || 0);
                        setField('salaryExpectationBase', nextBase);
                        if (draft.salaryExpectationOte < nextBase) {
                          setField('salaryExpectationOte', nextBase);
                        }
                      }}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm font-medium">
                      <span>OTE Ziel</span>
                      <span className="text-primary">{formatCurrency(Math.max(draft.salaryExpectationOte || 0, draft.salaryExpectationBase || 0))}</span>
                    </div>
                    <input
                      type="range"
                      min={30000}
                      max={400000}
                      step={5000}
                      value={Math.max(draft.salaryExpectationOte || 0, draft.salaryExpectationBase || 0)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('salaryExpectationOte', Number(e.target.value || 0))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </Subsection>
              <Subsection title="Zielrollen" description="Füge Rollen hinzu, die für dich besonders relevant sind.">
                <AddableTagField values={draft.desiredJobRoles} suggestions={JOB_ROLES as unknown as readonly string[]} onAdd={(value) => addTag('desiredJobRoles', value)} onRemove={(value) => removeTag('desiredJobRoles', value)} placeholder="Zielrolle hinzufügen" />
              </Subsection>
              <Subsection title="Arbeitsmodell" description="Welche Setups passen zu deinem Alltag?">
                <ChoiceGroup options={REMOTE_TYPES as unknown as readonly string[]} values={draft.remotePreference} onToggle={(value) => toggleArrayValue('remotePreference', value)} getLabel={(value) => REMOTE_TYPE_LABELS[value as keyof typeof REMOTE_TYPE_LABELS] || value} />
              </Subsection>
              <Subsection title="Branchen" description="In welchen Themenfeldern möchtest du idealerweise arbeiten?">
                <ChoiceGroup options={SALES_INDUSTRY_OPTIONS as unknown as readonly string[]} values={draft.desiredIndustries} onToggle={(value) => toggleArrayValue('desiredIndustries', value)} />
              </Subsection>
              <Subsection title="Karriereziele" description="Woran soll dein nächster Schritt gemessen werden?">
                <ChoiceGroup options={CAREER_GOAL_OPTIONS as unknown as readonly string[]} values={draft.careerGoals} onToggle={(value) => toggleArrayValue('careerGoals', value)} />
              </Subsection>
            </div>
          ) : (
            <SummaryGrid
              items={[
                { label: 'Aktuelle Rolle', value: normalizedProfile.currentRole || '–', icon: BriefcaseBusiness },
                { label: 'Zielrolle', value: normalizedProfile.targetRole || normalizedProfile.desiredJobRoles.join(', ') || '–', icon: Target },
                { label: 'Arbeitsmodell', value: normalizedProfile.remotePreference.map((value) => REMOTE_TYPE_LABELS[value as keyof typeof REMOTE_TYPE_LABELS] || value).join(', ') || '–', icon: Globe },
                { label: 'Karriereziele', value: normalizedProfile.careerGoals.join(', ') || '–', icon: Target },
                { label: 'Grundgehalt', value: formatCurrency(normalizedProfile.salaryExpectationBase || 0), icon: Wallet },
                { label: 'OTE', value: formatCurrency(normalizedProfile.salaryExpectationOte || 0), icon: Wallet },
              ]}
            />
          )}
        </SectionShell>
      )}

      {activeTab === 'sales' && (
        <SectionShell
          title="Erfahrung & Sales-Fokus"
          description="Zeige deinen bisherigen Hintergrund über aktuelle und frühere Stationen. Tiefe Kennzahlen bleiben optional."
          editing={editingTab === 'sales'}
          saving={saving}
          error={error}
          onEdit={() => beginEdit('sales')}
          onCancel={() => setEditingTab(null)}
          onSave={() => saveTab('sales')}
        >
          {editingTab === 'sales' ? (
            <div className="space-y-5">
              <div className="rounded-2xl border bg-primary/[0.04] p-4 text-sm text-muted-foreground">
                Hier geht es nicht nur um deinen aktuellen Job, sondern um dein bisheriges Gesamtbild: Branchen, Motion, betreute Accounts, Dealgrößen und Sales Cycles.
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Jahre Erfahrung" icon={TrendingUp}>
                  <Input type="number" value={draft.yearsOfExperience} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('yearsOfExperience', Number(e.target.value || 0))} placeholder="3" className="h-11 rounded-xl" />
                </FormField>
                <FormField label="Abgeleitete Seniorität" icon={TrendingUp}>
                  <Input value={deriveSeniorityFromYears(draft.yearsOfExperience) || draft.seniority} disabled className="h-11 rounded-xl bg-muted/40" />
                </FormField>
                <FormField label="Bisheriger Sales Cycle (optional)" icon={TrendingUp}>
                  <select value={draft.salesCycleLength} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('salesCycleLength', e.target.value)} className={SELECT_CLASSES}>
                    <option value="">Bitte auswählen</option>
                    {SALES_CYCLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Accounts / Territory (optional)" icon={MapPin}>
                  <Input value={draft.territorySize} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('territorySize', e.target.value)} placeholder="z. B. DACH Mid-Market, Named Accounts" className="h-11 rounded-xl" />
                </FormField>
                <FormField label="Ø Deal Size (optional)" icon={Wallet}>
                  <Input type="number" value={draft.averageDealSize} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('averageDealSize', e.target.value)} placeholder="25000" className="h-11 rounded-xl" />
                </FormField>
                <FormField label="Größter Deal (optional)" icon={Wallet}>
                  <Input type="number" value={draft.largestDealClosed} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('largestDealClosed', e.target.value)} placeholder="120000" className="h-11 rounded-xl" />
                </FormField>
                <FormField label="Ø Sales Cycle in Tagen (optional)" icon={TrendingUp} className="md:col-span-2">
                  <Input type="number" value={draft.averageSalesCycle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('averageSalesCycle', e.target.value)} placeholder="60" className="h-11 rounded-xl" />
                </FormField>
              </div>
              <Subsection title="Deal Size / betreute Bandbreiten" description="Optional: Welche Dealgrößen hast du bisher vor allem betreut?">
                <ChoiceGroup options={DEAL_SIZE_OPTIONS} values={draft.dealSizePreference} onToggle={(value) => toggleArrayValue('dealSizePreference', value)} />
              </Subsection>
              <Subsection title="Sales Motion" description="Optional: Welche Motion war in deinem bisherigen Umfeld prägend?">
                <ChoiceGroup options={SALES_MOTION_OPTIONS as unknown as readonly string[]} values={draft.salesMotionExperience} onToggle={(value) => toggleArrayValue('salesMotionExperience', value)} />
              </Subsection>
              <Subsection title="Branchen-Erfahrung" description="Welche Branchen hast du bisher betreut oder inhaltlich kennengelernt?">
                <ChoiceGroup options={SALES_INDUSTRY_OPTIONS as unknown as readonly string[]} values={draft.industriesExperience} onToggle={(value) => toggleArrayValue('industriesExperience', value)} />
              </Subsection>
            </div>
          ) : (
            <SummaryGrid
              items={[
                { label: 'Erfahrung', value: `${normalizedProfile.yearsOfExperience || 0} Jahre`, icon: TrendingUp },
                { label: 'Seniorität', value: SENIORITY_LABELS[normalizedProfile.seniority as keyof typeof SENIORITY_LABELS] || normalizedProfile.seniority || '–', icon: TrendingUp },
                { label: 'Sales Cycle', value: normalizedProfile.salesCycleLength || '–', icon: TrendingUp },
                { label: 'Ø Deal Size', value: normalizedProfile.averageDealSize ? formatCurrency(Number(normalizedProfile.averageDealSize)) : '–', icon: Wallet },
                { label: 'Größter Deal', value: normalizedProfile.largestDealClosed ? formatCurrency(Number(normalizedProfile.largestDealClosed)) : '–', icon: Wallet },
                { label: 'Territory', value: normalizedProfile.territorySize || '–', icon: MapPin },
              ]}
            />
          )}
        </SectionShell>
      )}

      {activeTab === 'documents' && (
        <SectionShell
          title="Dokumente"
          description="CV und Unterlagen an einem zentralen Ort."
          editing={false}
        >
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Lebenslauf</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {normalizedProfile.cvFileName || 'Noch kein Dokument hochgeladen'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {normalizedProfile.cvUploadDate
                      ? `Zuletzt aktualisiert am ${new Date(normalizedProfile.cvUploadDate).toLocaleDateString('de-DE')}`
                      : 'Lade einen aktuellen CV hoch, damit Recruiter dein Profil schneller einordnen können.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background p-5">
              <p className="text-sm font-semibold">Nächster Schritt</p>
              <p className="mt-1 text-sm text-muted-foreground">Verwalte hier deinen CV und weitere Unterlagen.</p>
              <Link href="/dashboard/candidate/dokumente" className="mt-4 inline-flex">
                <Button variant="outline" className="gap-1.5 rounded-xl">
                  <Upload className="h-4 w-4" />
                  Dokumente verwalten
                </Button>
              </Link>
            </div>
          </div>
        </SectionShell>
      )}

      {activeTab === 'preferences' && (
        <SectionShell
          title="Präferenzen"
          description="Skills, Sprachen und Wunschumfeld für bessere Matches."
          editing={editingTab === 'preferences'}
          saving={saving}
          error={error}
          onEdit={() => beginEdit('preferences')}
          onCancel={() => setEditingTab(null)}
          onSave={() => saveTab('preferences')}
        >
          {editingTab === 'preferences' ? (
            <div className="space-y-5">
              <Subsection title="Skills" description="Pflege die wichtigsten Fähigkeiten, die dich ausmachen.">
                <AddableTagField
                  values={draft.skills}
                  suggestions={SALES_SKILL_SUGGESTIONS as unknown as readonly string[]}
                  onAdd={(value) => addTag('skills', value)}
                  onRemove={(value) => removeTag('skills', value)}
                  placeholder="Skill hinzufügen"
                />
              </Subsection>
              <Subsection title="Sprachen" description="Diese Informationen werden auch für internationale Rollen genutzt.">
                <AddableTagField
                  values={draft.languages}
                  suggestions={LANGUAGE_OPTIONS as unknown as readonly string[]}
                  onAdd={(value) => addTag('languages', value)}
                  onRemove={(value) => removeTag('languages', value)}
                  placeholder="Sprache hinzufügen"
                />
              </Subsection>
              <Subsection title="Wunsch-Unternehmen" description="Welche Company-Setups sprechen dich besonders an?">
                <ChoiceGroup options={COMPANY_TYPE_OPTIONS as unknown as readonly string[]} values={draft.preferredCompanyTypes} onToggle={(value) => toggleArrayValue('preferredCompanyTypes', value)} />
              </Subsection>
              <Subsection title="Standortpräferenz" description="Wie flexibel bist du beim Standort?">
                <ChoiceGroup options={LOCATION_PREFERENCE_OPTIONS} values={draft.locationPreference} onToggle={(value) => toggleArrayValue('locationPreference', value)} />
              </Subsection>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <InfoPanel title="Skills" icon={BriefcaseBusiness}>
                  <ChipGroup values={normalizedProfile.skills} />
                </InfoPanel>
                <InfoPanel title="Sprachen" icon={Languages}>
                  <ChipGroup values={normalizedProfile.languages} />
                </InfoPanel>
              </div>
              <SummaryGrid
                items={[
                  { label: 'Wunsch-Unternehmen', value: normalizedProfile.preferredCompanyTypes.join(', ') || '–', icon: BriefcaseBusiness },
                  { label: 'Standortpräferenz', value: normalizedProfile.locationPreference.join(', ') || '–', icon: MapPin },
                ]}
              />
            </div>
          )}
        </SectionShell>
      )}

    </div>
  );
}

function SectionShell({
  title,
  description,
  editing,
  saving,
  error,
  onEdit,
  onCancel,
  onSave,
  children,
}: {
  title: string;
  description: string;
  editing: boolean;
  saving?: boolean;
  error?: string;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-border/70 bg-background/95 p-6 shadow-sm md:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={onCancel}>Abbrechen</Button>
            <Button size="sm" className="rounded-xl" onClick={onSave} disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}</Button>
          </div>
        ) : onEdit ? (
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={onEdit}>
            <PencilLine className="h-3.5 w-3.5" />
            Bearbeiten
          </Button>
        ) : null}
      </div>
      <div className="space-y-5">{children}</div>
      {error ? <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  className,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

function Subsection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/[0.18] p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SummaryGrid({
  items,
}: {
  items: Array<{ label: string; value: string; icon?: React.ElementType }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-border/70 bg-muted/[0.16] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.icon ? <item.icon className="h-3.5 w-3.5" /> : null}
            <span>{item.label}</span>
          </div>
          <p className="mt-2 break-words text-sm font-semibold leading-6 text-foreground">{item.value || '–'}</p>
        </div>
      ))}
    </div>
  );
}

function InfoPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/[0.16] p-4">
      <div className="mb-3 flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
        <p className="text-sm font-semibold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function ChipGroup({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <p className="text-sm text-muted-foreground">–</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <Badge key={value} variant="secondary" className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-foreground">{value}</Badge>
      ))}
    </div>
  );
}

function ChoiceGroup({
  options,
  values,
  onToggle,
  getLabel,
}: {
  options: readonly string[];
  values: string[];
  onToggle: (value: string) => void;
  getLabel?: (value: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
            values.includes(option)
              ? 'border-primary/40 bg-primary/10 text-primary shadow-sm'
              : 'border-border/70 bg-background hover:bg-accent/40',
          )}
        >
          {getLabel ? getLabel(option) : option}
        </button>
      ))}
    </div>
  );
}

function AddableTagField({
  values,
  suggestions,
  onAdd,
  onRemove,
  placeholder,
}: {
  values: string[];
  suggestions: readonly string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const commitValue = () => {
    onAdd(inputValue);
    setInputValue('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitValue();
            }
          }}
          placeholder={placeholder || 'Wert hinzufügen'}
          className="h-11 rounded-xl"
        />
        <Button type="button" variant="outline" className="rounded-xl" onClick={commitValue}>Hinzufügen</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge
            key={value}
            variant="secondary"
            className="cursor-pointer rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            onClick={() => onRemove(value)}
          >
            {value}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.filter((value) => !values.includes(value)).slice(0, 10).map((value) => (
          <button
            key={value}
            type="button"
            className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium hover:bg-accent/40"
            onClick={() => onAdd(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

