'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  GraduationCap,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getIdToken } from '@/lib/auth/client';
import { GooglePlacesAutocomplete } from '@/components/google-places-autocomplete';
import {
  JOB_ROLES,
  REMOTE_TYPES,
  REMOTE_TYPE_LABELS,
  SALES_INDUSTRY_OPTIONS,
  SALES_SKILL_SUGGESTIONS,
  SENIORITY_LABELS,
  SENIORITY_LEVELS,
  LANGUAGE_OPTIONS,
  LANGUAGE_PROFICIENCY_LEVELS,
  CAREER_GOAL_OPTIONS,
  COMPANY_TYPE_OPTIONS,
} from '@/lib/config';
import { cn, deriveSeniorityFromYears } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────
interface WorkExperience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  summary: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
}

interface LanguageEntry {
  language: string;
  level: string;
}

interface WizardData {
  // Step 1: CV
  cvFile: File | null;
  cvUrl: string;
  cvFileName: string;
  onboardingSource: 'cv' | 'manual' | undefined;
  // Step 2: Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  location: string;
  country: string;
  googlePlaceId: string;
  // Step 3: Work models
  remotePreference: string[];
  // Step 4: Location preference
  locationPreference: string;
  // Step 5: Roles
  currentRole: string;
  desiredJobRoles: string[];
  // Step 6: Seniority
  yearsOfExperience: number;
  seniority: string;
  // Step 7: Experience & Education
  workExperiences: WorkExperience[];
  educations: Education[];
  // Step 8: Sales specific
  desiredIndustries: string[];
  salesCycleLength: string;
  averageDealSize: string;
  salesMotionExperience: string[];
  // Step 9: Skills & Languages
  skills: string[];
  languageProficiencies: LanguageEntry[];
  // Step 10: Goals & Preferences
  careerGoals: string[];
  preferredCompanyTypes: string[];
  // Step 11: Salary
  salaryExpectationBase: number;
  salaryExpectationOte: number;
  noticePeriod: string;
  openToWork: boolean;
  visibleToRecruiters: boolean;
  shortBio: string;
}

const INITIAL_DATA: WizardData = {
  cvFile: null,
  cvUrl: '',
  cvFileName: '',
  onboardingSource: undefined,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  location: '',
  country: 'Deutschland',
  googlePlaceId: '',
  remotePreference: [],
  locationPreference: '',
  currentRole: '',
  desiredJobRoles: [],
  yearsOfExperience: 0,
  seniority: '',
  workExperiences: [],
  educations: [],
  desiredIndustries: [],
  salesCycleLength: '',
  averageDealSize: '',
  salesMotionExperience: [],
  skills: [],
  languageProficiencies: [{ language: 'Deutsch', level: 'Muttersprachliches Niveau' }],
  careerGoals: [],
  preferredCompanyTypes: [],
  salaryExpectationBase: 60000,
  salaryExpectationOte: 100000,
  noticePeriod: '',
  openToWork: true,
  visibleToRecruiters: true,
  shortBio: '',
};

const STEP_TITLES = [
  'Lebenslauf',
  'Über dich',
  'Arbeitsmodell',
  'Standort',
  'Rollen',
  'Erfahrung',
  'Berufsstationen',
  'Sales-Expertise',
  'Skills & Sprachen',
  'Ziele',
  'Gehalt',
];

const TOTAL_STEPS = STEP_TITLES.length;

const SALES_ROLES = [
  'SDR',
  'BDR',
  'Account Executive',
  'Mid-Market AE',
  'Enterprise AE',
  'Strategic AE',
  'Sales Engineer',
  'Pre-Sales Consultant',
  'Account Manager',
  'Key Account Manager',
  'Customer Success Manager',
  'Business Development Manager',
  'Sales Manager',
  'Head of Sales',
  'VP Sales',
  'Chief Revenue Officer',
  'Revenue Operations',
] as const;

const LOCATION_PREFERENCES = [
  { value: 'local', label: 'In meiner Stadt bleiben', icon: '🏠' },
  { value: 'region', label: 'In meiner Region (50km)', icon: '📍' },
  { value: 'germany', label: 'Überall in Deutschland', icon: '🇩🇪' },
  { value: 'dach', label: 'DACH-Region', icon: '🌍' },
  { value: 'eu', label: 'Überall in der EU', icon: '🇪🇺' },
] as const;

const SALES_CYCLE_OPTIONS = [
  '< 1 Monat',
  '1-3 Monate',
  '3-6 Monate',
  '6-12 Monate',
  '12+ Monate',
] as const;

const DEAL_SIZE_OPTIONS = [
  '< 10k €',
  '10k - 50k €',
  '50k - 100k €',
  '100k - 500k €',
  '500k+ €',
] as const;

const SALES_MOTION_OPTIONS = [
  'Inbound',
  'Outbound',
  'Full Cycle',
  'Channel / Partner',
  'PLG',
  'Enterprise',
  'SMB',
  'Mid-Market',
] as const;

const INDUSTRY_OPTIONS = [
  'SaaS',
  'AI / Automation',
  'Cyber Security',
  'Cloud Infrastructure',
  'Data & Analytics',
  'FinTech',
  'HR Tech',
  'MarTech',
  'HealthTech',
  'DevTools',
  'Pharma',
  'E-Commerce',
  'Logistics / Supply Chain',
  'InsurTech',
  'PropTech',
  'EdTech',
  'LegalTech',
  'CleanTech',
] as const;

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// ─── Sub-Components ─────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = Math.round(((current) / (total - 1)) * 100);
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Schritt {current + 1} von {total}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function StepCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-1 text-xl font-semibold text-foreground md:text-2xl">{title}</h2>
        {description && (
          <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="space-y-5">{children}</div>
      </div>
    </div>
  );
}

function MultiChoiceCard({
  label,
  description,
  icon,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
      )}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      <div className="flex-1">
        <span className={cn('font-medium', selected && 'text-primary')}>{label}</span>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {selected && (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
      )}
    </button>
  );
}

function TagInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  suggestions: readonly string[];
  placeholder: string;
}) {
  const [input, setInput] = useState('');
  const listId = useId();

  const add = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={input}
          list={listId}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(input);
            }
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <datalist id={listId}>
          {suggestions.filter((s) => !value.includes(s)).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={() => add(input)}
          className="shrink-0 rounded-md border bg-white px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary cursor-pointer hover:bg-primary/20"
              onClick={() => onChange(value.filter((v) => v !== item))}
            >
              {item} ×
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {suggestions
          .filter((s) => !value.includes(s))
          .slice(0, 10)
          .map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full border bg-gray-50 px-3 py-1 text-xs text-muted-foreground transition hover:bg-gray-100 hover:text-foreground"
              onClick={() => add(s)}
            >
              + {s}
            </button>
          ))}
      </div>
    </div>
  );
}

// ─── Main Wizard ────────────────────────────────────────────
export function CandidateOnboardingWizard({ entryPoint }: { entryPoint: 'onboarding' | 'profile' }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dbUser, refreshUser } = useAuth();

  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [editingExperience, setEditingExperience] = useState<string | null>(null);
  const [editingEducation, setEditingEducation] = useState<string | null>(null);

  const update = useCallback((patch: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const derivedSeniority = useMemo(
    () => deriveSeniorityFromYears(data.yearsOfExperience),
    [data.yearsOfExperience],
  );

  // Load existing profile
  useEffect(() => {
    if (!dbUser) return;
    const load = async () => {
      setLoading(true);
      try {
        const token = await getIdToken();
        const res = await fetch('/api/candidate/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (payload.data) {
          const d = payload.data;
          setData((prev) => ({
            ...prev,
            firstName: d.firstName || '',
            lastName: d.lastName || '',
            email: d.email || dbUser.email || '',
            phone: d.phone || '',
            linkedinUrl: d.linkedinUrl || '',
            location: d.location || '',
            country: d.country || 'Deutschland',
            googlePlaceId: d.googlePlaceId || '',
            remotePreference: d.remotePreference || [],
            currentRole: d.currentRole || '',
            desiredJobRoles: d.desiredJobRoles || [],
            yearsOfExperience: d.yearsOfExperience ?? 0,
            seniority: d.seniority || '',
            desiredIndustries: d.desiredIndustries || [],
            skills: d.skills || [],
            languageProficiencies: d.languageProficiencies?.length
              ? d.languageProficiencies
              : [{ language: 'Deutsch', level: 'Muttersprachliches Niveau' }],
            careerGoals: d.careerGoals || [],
            preferredCompanyTypes: d.preferredCompanyTypes || [],
            salaryExpectationBase: d.salaryExpectationBase ?? 60000,
            salaryExpectationOte: d.salaryExpectationOte ?? 100000,
            noticePeriod: d.noticePeriod || '',
            openToWork: d.openToWork ?? true,
            visibleToRecruiters: d.visibleToRecruiters ?? true,
            shortBio: d.shortBio || '',
            cvUrl: d.cvUrl || '',
            cvFileName: d.cvFileName || '',
          }));
          if (entryPoint === 'profile') setStep(1);
          else setStep(Math.max(d.onboardingStep || 0, 0));
        } else {
          update({ email: dbUser.email || '' });
        }
      } catch {
        update({ email: dbUser?.email || '' });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [dbUser, entryPoint, update]);

  // ─── CV Upload & Extraction ──────────────────────
  const handleCvUpload = async (file: File) => {
    setExtracting(true);
    setError('');
    update({ onboardingSource: 'cv' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/resume/extract', {
        method: 'POST',
        body: formData,
      });

      const payload = await res.json();

      if (!payload.success) {
        throw new Error(payload.error?.message || 'CV-Extraktion fehlgeschlagen');
      }

      const extracted = payload.extracted;
      const v = (field: any) => field?.value;

      // Map extracted data to wizard data
      const stations: WorkExperience[] = (v(extracted.berufsstationen) || []).map(
        (s: any) => ({
          id: generateId(),
          title: s.title || '',
          company: s.company || '',
          startDate: s.startDate || '',
          endDate: s.endDate || '',
          isCurrent: s.isCurrent || false,
          summary: s.summary || '',
        }),
      );

      const languages: LanguageEntry[] = (v(extracted.sprachen) || []).map(
        (l: any) => ({
          language: l.sprache || l.language || '',
          level: l.level || 'Konversationssicher',
        }),
      );

      update({
        cvFileName: file.name,
        onboardingSource: 'cv',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: v(extracted.email) || data.email || dbUser?.email || '',
        phone: v(extracted.telefon) || '',
        linkedinUrl: v(extracted.linkedinUrl) || '',
        location: v(extracted.standort) || '',
        currentRole: v(extracted.aktuelleRolle) || '',
        yearsOfExperience: v(extracted.berufserfahrungJahre) ?? 0,
        skills: v(extracted.skills) || [],
        workExperiences: stations,
        languageProficiencies: languages.length > 0 ? languages : data.languageProficiencies,
        salaryExpectationBase: v(extracted.gehaltBaseJahr) || data.salaryExpectationBase,
        salaryExpectationOte: v(extracted.gehaltOTEJahr) || data.salaryExpectationOte,
        noticePeriod: v(extracted.kuendigungsfrist) || '',
      });

      // Also upload the file to storage
      const token = await getIdToken();
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('category', 'cv');
      await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadForm,
      }).catch(() => {});

      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CV-Extraktion fehlgeschlagen');
    } finally {
      setExtracting(false);
    }
  };

  // ─── Save Profile ────────────────────────────────
  const saveProfile = async () => {
    setSaving(true);
    setError('');

    try {
      const token = await getIdToken();
      const body = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        linkedinUrl: data.linkedinUrl,
        location: data.location,
        country: data.country,
        googlePlaceId: data.googlePlaceId,
        remotePreference: data.remotePreference,
        currentRole: data.currentRole,
        targetRole: data.desiredJobRoles[0] || '',
        desiredJobRoles: data.desiredJobRoles,
        yearsOfExperience: data.yearsOfExperience,
        seniority: derivedSeniority || data.seniority,
        desiredIndustries: data.desiredIndustries,
        skills: data.skills,
        languages: data.languageProficiencies.map((l) => l.language).filter(Boolean),
        languageProficiencies: data.languageProficiencies,
        careerGoals: data.careerGoals,
        preferredCompanyTypes: data.preferredCompanyTypes,
        salaryExpectationBase: data.salaryExpectationBase,
        salaryExpectationOte: data.salaryExpectationOte,
        salaryExpectationCurrency: 'EUR',
        noticePeriod: data.noticePeriod,
        openToWork: data.openToWork,
        visibleToRecruiters: data.visibleToRecruiters,
        shortBio: data.shortBio,
        cvUrl: data.cvUrl,
        cvFileName: data.cvFileName,
        onboardingStep: TOTAL_STEPS - 1,
        onboardingSource: data.onboardingSource || 'manual',
      };

      const res = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Fehler beim Speichern');

      await refreshUser();
      router.push('/dashboard/candidate');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  // ─── Navigation ──────────────────────────────────
  const canGoNext = (): boolean => {
    switch (step) {
      case 1: return !!data.firstName && !!data.lastName && !!data.email;
      case 2: return data.remotePreference.length > 0;
      case 3: return !!data.locationPreference || !!data.location;
      case 4: return data.desiredJobRoles.length > 0;
      case 5: return data.yearsOfExperience >= 0;
      default: return true;
    }
  };

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    if (step > (entryPoint === 'profile' ? 1 : 0)) {
      setStep(step - 1);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ─── Toggle helpers ──────────────────────────────
  const toggleArray = (field: keyof WizardData, value: string) => {
    const current = (data[field] as string[]) || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update({ [field]: next } as any);
  };

  // ─── Render ──────────────────────────────────────
  if (!dbUser) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <ProgressBar current={step} total={TOTAL_STEPS} />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 0: CV Upload */}
      {step === 0 && (
        <StepCard
          title="CV Dokument hochladen"
          description="Wir füllen dein Profil aus, sodass du dich in wenigen Minuten bewerben kannst!"
        >
          {extracting ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-gray-200" />
                <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-primary" />
                <Upload className="absolute inset-0 m-auto h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Profil wird importiert</p>
                <p className="text-sm text-muted-foreground">
                  Einen Moment! Wir holen gerade dein Profil.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-10 transition hover:border-primary hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type === 'application/pdf') {
                    void handleCvUpload(file);
                  }
                }}
              >
                <CloudUpload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm">
                    <span className="font-medium text-primary">Klicke zum hochzuladen</span>{' '}
                    oder benutze Drag & Drop
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF-Dateien bis zu 10 MB
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleCvUpload(file);
                }}
              />

              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-muted-foreground">oder</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() => {
                  update({ onboardingSource: 'manual' });
                  setStep(1);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium transition hover:border-gray-300 hover:bg-gray-50"
              >
                <Sparkles className="h-4 w-4" />
                Manuell starten
              </button>
            </>
          )}
        </StepCard>
      )}

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <StepCard title="Erzähl uns über dich" description="Deine grundlegenden Informationen.">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Vorname *</label>
              <input
                value={data.firstName}
                onChange={(e) => update({ firstName: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nachname *</label>
              <input
                value={data.lastName}
                onChange={(e) => update({ lastName: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">E-Mail *</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => update({ email: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Telefon</label>
              <input
                value={data.phone}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="+49 123 456789"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Standort *</label>
              <GooglePlacesAutocomplete
                value={data.location}
                onChange={(v) => update({ location: v })}
                onPlaceSelect={(place) =>
                  update({ googlePlaceId: place.placeId, location: place.mainText })
                }
                placeholder="z.B. Heidelberg, Berlin, München..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">LinkedIn</label>
              <input
                value={data.linkedinUrl}
                onChange={(e) => update({ linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </StepCard>
      )}

      {/* Step 2: Work Models */}
      {step === 2 && (
        <StepCard
          title="Welche Arbeitsmodelle kommen für dich in Frage?"
          description="Wähle alle passenden Optionen aus."
        >
          <div className="space-y-3">
            <MultiChoiceCard
              label="100% Remote"
              description="100% von zu Hause aus arbeiten"
              icon="💻"
              selected={data.remotePreference.includes('remote')}
              onClick={() => toggleArray('remotePreference', 'remote')}
            />
            <MultiChoiceCard
              label="Hybrid"
              description="Jobs mit Homeoffice-Anteil"
              icon="🏢"
              selected={data.remotePreference.includes('hybrid')}
              onClick={() => toggleArray('remotePreference', 'hybrid')}
            />
            <MultiChoiceCard
              label="Vor Ort"
              description="Vom Büro aus arbeiten"
              icon="🏛️"
              selected={data.remotePreference.includes('onsite')}
              onClick={() => toggleArray('remotePreference', 'onsite')}
            />
          </div>
        </StepCard>
      )}

      {/* Step 3: Location Preference */}
      {step === 3 && (
        <StepCard
          title="Wo möchtest du arbeiten?"
          description={data.location ? `Du hast ${data.location} als Standort angegeben.` : 'Wähle deinen Suchradius.'}
        >
          <div className="space-y-3">
            {LOCATION_PREFERENCES.map((pref) => (
              <MultiChoiceCard
                key={pref.value}
                label={pref.label}
                icon={pref.icon}
                selected={data.locationPreference === pref.value}
                onClick={() => update({ locationPreference: pref.value })}
              />
            ))}
          </div>
        </StepCard>
      )}

      {/* Step 4: Target Roles */}
      {step === 4 && (
        <StepCard
          title="Welche Rollen interessieren dich?"
          description="Wähle alle Sales-Rollen aus, die für dich in Frage kommen."
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium">Aktuelle Rolle</label>
            <input
              value={data.currentRole}
              onChange={(e) => update({ currentRole: e.target.value })}
              list="current-role-list"
              placeholder="z.B. Account Executive"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <datalist id="current-role-list">
              {SALES_ROLES.map((r) => <option key={r} value={r} />)}
            </datalist>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Zielrollen *</label>
            <div className="flex flex-wrap gap-2">
              {SALES_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleArray('desiredJobRoles', role)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    data.desiredJobRoles.includes(role)
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </StepCard>
      )}

      {/* Step 5: Seniority */}
      {step === 5 && (
        <StepCard
          title="Dein Erfahrungslevel"
          description="Wie lange bist du schon im Sales tätig?"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium">Jahre Berufserfahrung im Sales</label>
            <input
              type="number"
              min={0}
              max={40}
              value={data.yearsOfExperience}
              onChange={(e) => update({ yearsOfExperience: parseInt(e.target.value) || 0 })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {derivedSeniority && (
            <div className="rounded-xl border bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">Abgeleitetes Level</p>
              <p className="text-lg font-semibold text-primary">
                {SENIORITY_LABELS[derivedSeniority as keyof typeof SENIORITY_LABELS] || derivedSeniority}
              </p>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Kündigungsfrist</label>
            <input
              value={data.noticePeriod}
              onChange={(e) => update({ noticePeriod: e.target.value })}
              placeholder="z.B. 3 Monate"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </StepCard>
      )}

      {/* Step 6: Experience & Education */}
      {step === 6 && (
        <StepCard
          title="Deine Erfahrung und Ausbildung"
          description="Überprüfe und ergänze deine Berufsstationen."
        >
          {/* Work Experiences */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Berufserfahrung</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newExp: WorkExperience = {
                    id: generateId(),
                    title: '',
                    company: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                    summary: '',
                  };
                  update({ workExperiences: [...data.workExperiences, newExp] });
                  setEditingExperience(newExp.id);
                }}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <Plus className="h-4 w-4" /> Hinzufügen
              </button>
            </div>

            <div className="space-y-2">
              {data.workExperiences.map((exp) => (
                <div key={exp.id} className={cn(
                  'rounded-lg border p-3 transition',
                  (!exp.title || !exp.company) && 'border-red-200 bg-red-50/50',
                )}>
                  {editingExperience === exp.id ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium">Stellenbezeichnung *</label>
                          <input
                            value={exp.title}
                            onChange={(e) => {
                              const updated = data.workExperiences.map((w) =>
                                w.id === exp.id ? { ...w, title: e.target.value } : w,
                              );
                              update({ workExperiences: updated });
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="z.B. Account Executive"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">Arbeitgeber *</label>
                          <input
                            value={exp.company}
                            onChange={(e) => {
                              const updated = data.workExperiences.map((w) =>
                                w.id === exp.id ? { ...w, company: e.target.value } : w,
                              );
                              update({ workExperiences: updated });
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="z.B. INTEGRTR GmbH"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">Von</label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => {
                              const updated = data.workExperiences.map((w) =>
                                w.id === exp.id ? { ...w, startDate: e.target.value } : w,
                              );
                              update({ workExperiences: updated });
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">Bis</label>
                          <div className="flex items-center gap-2">
                            {!exp.isCurrent && (
                              <input
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => {
                                  const updated = data.workExperiences.map((w) =>
                                    w.id === exp.id ? { ...w, endDate: e.target.value } : w,
                                  );
                                  update({ workExperiences: updated });
                                }}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                              />
                            )}
                            <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={exp.isCurrent}
                                onChange={(e) => {
                                  const updated = data.workExperiences.map((w) =>
                                    w.id === exp.id
                                      ? { ...w, isCurrent: e.target.checked, endDate: '' }
                                      : w,
                                  );
                                  update({ workExperiences: updated });
                                }}
                              />
                              Heute
                            </label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Kurzbeschreibung</label>
                        <textarea
                          value={exp.summary}
                          onChange={(e) => {
                            const updated = data.workExperiences.map((w) =>
                              w.id === exp.id ? { ...w, summary: e.target.value } : w,
                            );
                            update({ workExperiences: updated });
                          }}
                          rows={2}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Was waren deine Hauptaufgaben?"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingExperience(null)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Fertig
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {exp.title || 'Keine Bezeichnung'} @ {exp.company || 'Kein Arbeitgeber'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exp.startDate || '?'} - {exp.isCurrent ? 'Heute' : exp.endDate || '?'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingExperience(exp.id)}
                          className="rounded p-1 hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              workExperiences: data.workExperiences.filter((w) => w.id !== exp.id),
                            })
                          }
                          className="rounded p-1 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {data.workExperiences.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Noch keine Berufserfahrung hinzugefügt.
                </p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="pt-4 border-t">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Ausbildung (optional)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newEdu: Education = {
                    id: generateId(),
                    degree: '',
                    institution: '',
                    startYear: '',
                    endYear: '',
                  };
                  update({ educations: [...data.educations, newEdu] });
                  setEditingEducation(newEdu.id);
                }}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <Plus className="h-4 w-4" /> Hinzufügen
              </button>
            </div>

            <div className="space-y-2">
              {data.educations.map((edu) => (
                <div key={edu.id} className="rounded-lg border p-3">
                  {editingEducation === edu.id ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium">Abschluss / Studiengang</label>
                          <input
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = data.educations.map((ed) =>
                                ed.id === edu.id ? { ...ed, degree: e.target.value } : ed,
                              );
                              update({ educations: updated });
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="z.B. Business Informatics"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">Institution</label>
                          <input
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = data.educations.map((ed) =>
                                ed.id === edu.id ? { ...ed, institution: e.target.value } : ed,
                              );
                              update({ educations: updated });
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="z.B. Hochschule Mannheim"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">Von (Jahr)</label>
                          <input
                            value={edu.startYear}
                            onChange={(e) => {
                              const updated = data.educations.map((ed) =>
                                ed.id === edu.id ? { ...ed, startYear: e.target.value } : ed,
                              );
                              update({ educations: updated });
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="2019"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">Bis (Jahr)</label>
                          <input
                            value={edu.endYear}
                            onChange={(e) => {
                              const updated = data.educations.map((ed) =>
                                ed.id === edu.id ? { ...ed, endYear: e.target.value } : ed,
                              );
                              update({ educations: updated });
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            placeholder="2023"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingEducation(null)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Fertig
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {edu.degree || 'Kein Abschluss'} @ {edu.institution || 'Keine Institution'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {edu.startYear || '?'} - {edu.endYear || '?'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingEducation(edu.id)}
                          className="rounded p-1 hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              educations: data.educations.filter((ed) => ed.id !== edu.id),
                            })
                          }
                          className="rounded p-1 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </StepCard>
      )}

      {/* Step 7: Sales Specific */}
      {step === 7 && (
        <StepCard
          title="Deine Sales-Expertise"
          description="Optional: Hilf uns, bessere Matches für dich zu finden."
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium">Branchen</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => toggleArray('desiredIndustries', ind)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    data.desiredIndustries.includes(ind)
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  )}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Sales Cycle</label>
            <div className="flex flex-wrap gap-2">
              {SALES_CYCLE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update({ salesCycleLength: data.salesCycleLength === opt ? '' : opt })}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    data.salesCycleLength === opt
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Annual Contract Value (ACV)</label>
            <div className="flex flex-wrap gap-2">
              {DEAL_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update({ averageDealSize: data.averageDealSize === opt ? '' : opt })}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    data.averageDealSize === opt
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Sales Motion</label>
            <div className="flex flex-wrap gap-2">
              {SALES_MOTION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleArray('salesMotionExperience', opt)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    data.salesMotionExperience.includes(opt)
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </StepCard>
      )}

      {/* Step 8: Skills & Languages */}
      {step === 8 && (
        <StepCard
          title="Skills & Sprachen"
          description="Welche Sales-Skills und Sprachen bringst du mit?"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium">Top Skills</label>
            <TagInput
              value={data.skills}
              onChange={(v) => update({ skills: v })}
              suggestions={SALES_SKILL_SUGGESTIONS}
              placeholder="Skill eingeben..."
            />
          </div>

          <div className="pt-2 border-t">
            <label className="mb-2 block text-sm font-medium">Sprachen</label>
            <div className="space-y-3">
              {data.languageProficiencies.map((lang, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={lang.language}
                    onChange={(e) => {
                      const updated = [...data.languageProficiencies];
                      updated[index] = { ...updated[index], language: e.target.value };
                      update({ languageProficiencies: updated });
                    }}
                    list={`lang-list-${index}`}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    placeholder="Sprache"
                  />
                  <datalist id={`lang-list-${index}`}>
                    {LANGUAGE_OPTIONS.map((l) => <option key={l} value={l} />)}
                  </datalist>
                  <select
                    value={lang.level}
                    onChange={(e) => {
                      const updated = [...data.languageProficiencies];
                      updated[index] = { ...updated[index], level: e.target.value };
                      update({ languageProficiencies: updated });
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    {LANGUAGE_PROFICIENCY_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = data.languageProficiencies.filter((_, i) => i !== index);
                      update({
                        languageProficiencies: updated.length > 0
                          ? updated
                          : [{ language: '', level: 'Konversationssicher' }],
                      });
                    }}
                    className="flex h-9 items-center justify-center rounded-md px-2 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                update({
                  languageProficiencies: [
                    ...data.languageProficiencies,
                    { language: '', level: 'Konversationssicher' },
                  ],
                })
              }
              className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <Plus className="h-4 w-4" /> Sprache hinzufügen
            </button>
          </div>
        </StepCard>
      )}

      {/* Step 9: Goals */}
      {step === 9 && (
        <StepCard
          title="Deine Karriereziele"
          description="Worauf legst du bei deinem nächsten Schritt Wert?"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">Karriereziele</label>
            <div className="space-y-2">
              {CAREER_GOAL_OPTIONS.map((goal) => (
                <MultiChoiceCard
                  key={goal}
                  label={goal}
                  selected={data.careerGoals.includes(goal)}
                  onClick={() => toggleArray('careerGoals', goal)}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <label className="mb-2 block text-sm font-medium">Bevorzugte Company-Typen</label>
            <div className="flex flex-wrap gap-2">
              {COMPANY_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArray('preferredCompanyTypes', type)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    data.preferredCompanyTypes.includes(type)
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <label className="mb-1.5 block text-sm font-medium">Kurzprofil (optional)</label>
            <textarea
              value={data.shortBio}
              onChange={(e) => update({ shortBio: e.target.value })}
              rows={3}
              maxLength={1000}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Womit bist du im Software Sales besonders stark?"
            />
          </div>
        </StepCard>
      )}

      {/* Step 10: Salary */}
      {step === 10 && (
        <StepCard
          title="Gehaltsvorstellungen"
          description="Was sind deine Ziele? Nur sichtbar für Recruiter."
        >
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium">
                <span>Grundgehalt (Base)</span>
                <span className="font-semibold text-primary">
                  {data.salaryExpectationBase.toLocaleString('de-DE')} €
                </span>
              </div>
              <input
                type="range"
                min={25000}
                max={250000}
                step={5000}
                value={data.salaryExpectationBase}
                onChange={(e) => {
                  const base = Number(e.target.value);
                  update({
                    salaryExpectationBase: base,
                    salaryExpectationOte: Math.max(data.salaryExpectationOte, base),
                  });
                }}
                className="w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>25.000 €</span>
                <span>250.000 €</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium">
                <span>OTE (On Target Earnings)</span>
                <span className="font-semibold text-primary">
                  {Math.max(data.salaryExpectationOte, data.salaryExpectationBase).toLocaleString('de-DE')} €
                </span>
              </div>
              <input
                type="range"
                min={30000}
                max={400000}
                step={5000}
                value={Math.max(data.salaryExpectationOte, data.salaryExpectationBase)}
                onChange={(e) =>
                  update({ salaryExpectationOte: Number(e.target.value) })
                }
                className="w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>30.000 €</span>
                <span>400.000 €</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <label className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-medium cursor-pointer hover:bg-gray-50">
                <span>Open to Work</span>
                <input
                  type="checkbox"
                  checked={data.openToWork}
                  onChange={(e) => update({ openToWork: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-medium cursor-pointer hover:bg-gray-50">
                <span>Sichtbar für Recruiter</span>
                <input
                  type="checkbox"
                  checked={data.visibleToRecruiters}
                  onChange={(e) => update({ visibleToRecruiters: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            </div>

            {/* Summary */}
            <div className="rounded-xl border bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Zusammenfassung
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.desiredJobRoles.slice(0, 3).map((role) => (
                  <span key={role} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {role}
                  </span>
                ))}
                {data.skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="rounded-full border px-2 py-0.5 text-xs">
                    {skill}
                  </span>
                ))}
                {derivedSeniority && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    {SENIORITY_LABELS[derivedSeniority as keyof typeof SENIORITY_LABELS]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </StepCard>
      )}

      {/* Navigation Buttons */}
      {step > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-gray-100 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Zurück
          </button>

          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition',
                canGoNext()
                  ? 'bg-primary hover:bg-primary/90 shadow-sm'
                  : 'bg-gray-300 cursor-not-allowed',
              )}
            >
              Weiter
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                'Profil abschließen'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
