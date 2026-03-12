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
import { deriveSeniorityFromYears, formatCurrency } from '@/lib/utils';
import { FileText, Globe, PencilLine, Shield, Target, TrendingUp, Upload, User, X } from 'lucide-react';

type ProfileRecord = Record<string, unknown>;
type TabKey = 'personal' | 'career' | 'sales' | 'documents' | 'preferences' | 'privacy';
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
  shortBio: string;
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
  visibleToRecruiters: boolean;
  openToWork: boolean;
  averageDealSize: string;
  largestDealClosed: string;
  averageSalesCycle: string;
  territorySize: string;
  industriesExperience: string[];
};

const TABS: Array<{ key: TabKey; label: string; icon: React.ElementType }> = [
  { key: 'personal', label: 'Persönliche Daten', icon: User },
  { key: 'career', label: 'Karriereziele', icon: Target },
  { key: 'sales', label: 'Saleserfahrung', icon: TrendingUp },
  { key: 'documents', label: 'Dokumente', icon: FileText },
  { key: 'preferences', label: 'Präferenzen', icon: Globe },
  { key: 'privacy', label: 'Datenschutz', icon: Shield },
];

const LOCATION_PREFERENCE_OPTIONS = [
  'In meiner Stadt bleiben',
  'In meiner Region (50km)',
  'Überall in Deutschland',
  'DACH-Region',
  'Überall in der EU',
] as const;

const DEAL_SIZE_OPTIONS = ['< 10k €', '10k - 50k €', '50k - 100k €', '100k - 500k €', '500k+ €'] as const;
const SALES_CYCLE_OPTIONS = ['< 1 Monat', '1-3 Monate', '3-6 Monate', '6-12 Monate', '12+ Monate'] as const;

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
    shortBio: String(profile.shortBio || ''),
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
    visibleToRecruiters: Boolean(profile.visibleToRecruiters ?? true),
    openToWork: Boolean(profile.openToWork ?? true),
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
    <div className="space-y-5">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition ${
                isActive ? 'border-primary bg-primary/5 text-primary' : 'bg-background hover:bg-accent/40'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'personal' && (
        <SectionShell
          title="Persönliche Daten"
          description="Name, Kontakt und Standort."
          editing={editingTab === 'personal'}
          saving={saving}
          error={error}
          onEdit={() => beginEdit('personal')}
          onCancel={() => setEditingTab(null)}
          onSave={() => saveTab('personal')}
        >
          {editingTab === 'personal' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Input value={draft.firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('firstName', e.target.value)} placeholder="Vorname" />
              <Input value={draft.lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('lastName', e.target.value)} placeholder="Nachname" />
              <Input value={draft.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('email', e.target.value)} placeholder="E-Mail" className="md:col-span-2" />
              <Input value={draft.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('phone', e.target.value)} placeholder="Telefon" />
              <Input value={draft.linkedinUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('linkedinUrl', e.target.value)} placeholder="LinkedIn URL" />
              <Input value={draft.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('location', e.target.value)} placeholder="Standort" />
              <select value={draft.country} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('country', e.target.value)} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          ) : (
            <SummaryGrid
              items={[
                { label: 'Name', value: [normalizedProfile.firstName, normalizedProfile.lastName].filter(Boolean).join(' ') },
                { label: 'E-Mail', value: normalizedProfile.email },
                { label: 'Telefon', value: normalizedProfile.phone || '–' },
                { label: 'LinkedIn', value: normalizedProfile.linkedinUrl || 'Nicht hinterlegt' },
                { label: 'Standort', value: [normalizedProfile.location, normalizedProfile.country].filter(Boolean).join(', ') },
              ]}
            />
          )}
        </SectionShell>
      )}

      {activeTab === 'career' && (
        <SectionShell
          title="Karriereziele"
          description="Rolle, Arbeitsmodell und Gehaltsziele."
          editing={editingTab === 'career'}
          saving={saving}
          error={error}
          onEdit={() => beginEdit('career')}
          onCancel={() => setEditingTab(null)}
          onSave={() => saveTab('career')}
        >
          {editingTab === 'career' ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={draft.currentRole} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('currentRole', e.target.value)} placeholder="Aktuelle Rolle" />
                <Input value={draft.targetRole} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('targetRole', e.target.value)} placeholder="Zielrolle" />
                <Input type="number" value={draft.salaryExpectationBase} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('salaryExpectationBase', Number(e.target.value || 0))} placeholder="Grundgehalt" />
                <Input type="number" value={draft.salaryExpectationOte} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('salaryExpectationOte', Number(e.target.value || 0))} placeholder="OTE" />
                <Input value={draft.noticePeriod} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('noticePeriod', e.target.value)} placeholder="Kündigungsfrist" className="md:col-span-2" />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Zielrollen</p>
                <AddableTagField values={draft.desiredJobRoles} suggestions={JOB_ROLES as unknown as readonly string[]} onAdd={(value) => addTag('desiredJobRoles', value)} onRemove={(value) => removeTag('desiredJobRoles', value)} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Arbeitsmodell</p>
                <ChoiceGroup options={REMOTE_TYPES as unknown as readonly string[]} values={draft.remotePreference} onToggle={(value) => toggleArrayValue('remotePreference', value)} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Branchen</p>
                <ChoiceGroup options={SALES_INDUSTRY_OPTIONS as unknown as readonly string[]} values={draft.desiredIndustries} onToggle={(value) => toggleArrayValue('desiredIndustries', value)} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Karriereziele</p>
                <ChoiceGroup options={CAREER_GOAL_OPTIONS as unknown as readonly string[]} values={draft.careerGoals} onToggle={(value) => toggleArrayValue('careerGoals', value)} />
              </div>
            </div>
          ) : (
            <SummaryGrid
              items={[
                { label: 'Aktuelle Rolle', value: normalizedProfile.currentRole || '–' },
                { label: 'Zielrolle', value: normalizedProfile.targetRole || normalizedProfile.desiredJobRoles.join(', ') || '–' },
                { label: 'Arbeitsmodell', value: normalizedProfile.remotePreference.map((value) => REMOTE_TYPE_LABELS[value as keyof typeof REMOTE_TYPE_LABELS] || value).join(', ') || '–' },
                { label: 'Karriereziele', value: normalizedProfile.careerGoals.join(', ') || '–' },
                { label: 'Base', value: formatCurrency(normalizedProfile.salaryExpectationBase || 0) },
                { label: 'OTE', value: formatCurrency(normalizedProfile.salaryExpectationOte || 0) },
              ]}
            />
          )}
        </SectionShell>
      )}

      {activeTab === 'sales' && (
        <SectionShell
          title="Saleserfahrung"
          description="Erfahrung, Motion und Kennzahlen."
          editing={editingTab === 'sales'}
          saving={saving}
          error={error}
          onEdit={() => beginEdit('sales')}
          onCancel={() => setEditingTab(null)}
          onSave={() => saveTab('sales')}
        >
          {editingTab === 'sales' ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input type="number" value={draft.yearsOfExperience} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('yearsOfExperience', Number(e.target.value || 0))} placeholder="Jahre Erfahrung" />
                <Input value={deriveSeniorityFromYears(draft.yearsOfExperience) || draft.seniority} disabled placeholder="Seniorität" />
                <select value={draft.salesCycleLength} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('salesCycleLength', e.target.value)} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">Sales Cycle</option>
                  {SALES_CYCLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <Input value={draft.territorySize} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('territorySize', e.target.value)} placeholder="Territory" />
                <Input type="number" value={draft.averageDealSize} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('averageDealSize', e.target.value)} placeholder="Average Deal Size" />
                <Input type="number" value={draft.largestDealClosed} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('largestDealClosed', e.target.value)} placeholder="Largest Deal Closed" />
                <Input type="number" value={draft.averageSalesCycle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('averageSalesCycle', e.target.value)} placeholder="Average Sales Cycle in Tagen" className="md:col-span-2" />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Deal Size Präferenzen</p>
                <ChoiceGroup options={DEAL_SIZE_OPTIONS} values={draft.dealSizePreference} onToggle={(value) => toggleArrayValue('dealSizePreference', value)} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Sales Motion</p>
                <ChoiceGroup options={SALES_MOTION_OPTIONS as unknown as readonly string[]} values={draft.salesMotionExperience} onToggle={(value) => toggleArrayValue('salesMotionExperience', value)} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Industrie-Erfahrung</p>
                <ChoiceGroup options={SALES_INDUSTRY_OPTIONS as unknown as readonly string[]} values={draft.industriesExperience} onToggle={(value) => toggleArrayValue('industriesExperience', value)} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Kurzprofil</p>
                <textarea value={draft.shortBio} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('shortBio', e.target.value)} rows={4} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
            </div>
          ) : (
            <SummaryGrid
              items={[
                { label: 'Erfahrung', value: `${normalizedProfile.yearsOfExperience || 0} Jahre` },
                { label: 'Seniorität', value: SENIORITY_LABELS[normalizedProfile.seniority as keyof typeof SENIORITY_LABELS] || normalizedProfile.seniority || '–' },
                { label: 'Sales Cycle', value: normalizedProfile.salesCycleLength || '–' },
                { label: 'Average Deal Size', value: normalizedProfile.averageDealSize ? formatCurrency(Number(normalizedProfile.averageDealSize)) : '–' },
                { label: 'Largest Deal Closed', value: normalizedProfile.largestDealClosed ? formatCurrency(Number(normalizedProfile.largestDealClosed)) : '–' },
                { label: 'Territory', value: normalizedProfile.territorySize || '–' },
              ]}
            />
          )}
        </SectionShell>
      )}

      {activeTab === 'documents' && (
        <SectionShell
          title="Dokumente"
          description="Lebenslauf und Unterlagen."
          editing={false}
        >
          <div className="space-y-4">
            <SummaryGrid
              items={[
                { label: 'CV', value: normalizedProfile.cvFileName || 'Noch nicht hochgeladen' },
                {
                  label: 'Hochgeladen am',
                  value: normalizedProfile.cvUploadDate
                    ? new Date(normalizedProfile.cvUploadDate).toLocaleDateString('de-DE')
                    : '–',
                },
              ]}
            />
            <Link href="/dashboard/candidate/dokumente">
              <Button variant="outline" className="gap-1.5">
                <Upload className="h-4 w-4" />
                Dokumente verwalten
              </Button>
            </Link>
          </div>
        </SectionShell>
      )}

      {activeTab === 'preferences' && (
        <SectionShell
          title="Präferenzen"
          description="Skills, Sprachen und Wunschunternehmen."
          editing={editingTab === 'preferences'}
          saving={saving}
          error={error}
          onEdit={() => beginEdit('preferences')}
          onCancel={() => setEditingTab(null)}
          onSave={() => saveTab('preferences')}
        >
          {editingTab === 'preferences' ? (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Skills</p>
                <AddableTagField
                  values={draft.skills}
                  suggestions={SALES_SKILL_SUGGESTIONS as unknown as readonly string[]}
                  onAdd={(value) => addTag('skills', value)}
                  onRemove={(value) => removeTag('skills', value)}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Sprachen</p>
                <AddableTagField
                  values={draft.languages}
                  suggestions={LANGUAGE_OPTIONS as unknown as readonly string[]}
                  onAdd={(value) => addTag('languages', value)}
                  onRemove={(value) => removeTag('languages', value)}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Wunsch-Unternehmen</p>
                <ChoiceGroup options={COMPANY_TYPE_OPTIONS as unknown as readonly string[]} values={draft.preferredCompanyTypes} onToggle={(value) => toggleArrayValue('preferredCompanyTypes', value)} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Standortpräferenz</p>
                <ChoiceGroup options={LOCATION_PREFERENCE_OPTIONS} values={draft.locationPreference} onToggle={(value) => toggleArrayValue('locationPreference', value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Skills</p>
                <ChipGroup values={normalizedProfile.skills} />
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Sprachen</p>
                <ChipGroup values={normalizedProfile.languages} />
              </div>
              <SummaryGrid
                items={[
                  { label: 'Wunsch-Unternehmen', value: normalizedProfile.preferredCompanyTypes.join(', ') || '–' },
                  { label: 'Standortpräferenz', value: normalizedProfile.locationPreference.join(', ') || '–' },
                ]}
              />
            </div>
          )}
        </SectionShell>
      )}

      {activeTab === 'privacy' && (
        <SectionShell
          title="Datenschutz & Sichtbarkeit"
          description="Steuere, wie sichtbar dein Profil für Recruiter ist."
          editing={editingTab === 'privacy'}
          saving={saving}
          error={error}
          onEdit={() => beginEdit('privacy')}
          onCancel={() => setEditingTab(null)}
          onSave={() => saveTab('privacy')}
        >
          {editingTab === 'privacy' ? (
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
                <span>Open to Work</span>
                <input type="checkbox" checked={draft.openToWork} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('openToWork', e.target.checked)} />
              </label>
              <label className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
                <span>Sichtbar für Recruiter</span>
                <input type="checkbox" checked={draft.visibleToRecruiters} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('visibleToRecruiters', e.target.checked)} />
              </label>
            </div>
          ) : (
            <SummaryGrid
              items={[
                { label: 'Open to Work', value: normalizedProfile.openToWork ? 'Ja' : 'Nein' },
                { label: 'Sichtbar für Recruiter', value: normalizedProfile.visibleToRecruiters ? 'Ja' : 'Nein' },
              ]}
            />
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
    <div className="rounded-2xl border bg-background p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>Abbrechen</Button>
            <Button size="sm" onClick={onSave} disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}</Button>
          </div>
        ) : onEdit ? (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
            <PencilLine className="h-3.5 w-3.5" />
            Bearbeiten
          </Button>
        ) : null}
      </div>
      {children}
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function SummaryGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-sm font-medium">{item.value || '–'}</p>
        </div>
      ))}
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
        <Badge key={value} variant="secondary">{value}</Badge>
      ))}
    </div>
  );
}

function ChoiceGroup({
  options,
  values,
  onToggle,
}: {
  options: readonly string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={`rounded-full border px-3 py-1.5 text-sm transition ${
            values.includes(option) ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent/40'
          }`}
        >
          {option}
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
}: {
  values: string[];
  suggestions: readonly string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
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
          placeholder="Wert hinzufügen"
        />
        <Button type="button" variant="outline" onClick={commitValue}>Hinzufügen</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge
            key={value}
            variant="secondary"
            className="cursor-pointer"
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
            className="rounded-full border px-3 py-1 text-xs hover:bg-accent/40"
            onClick={() => onAdd(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
