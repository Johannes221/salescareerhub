'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronLeft, ChevronRight, CloudUpload, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, type FieldPath } from 'react-hook-form';
import type { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { getIdToken } from '@/lib/auth/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  CAREER_GOAL_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  COUNTRIES,
  JOB_ROLES,
  LANGUAGE_OPTIONS,
  LANGUAGE_PROFICIENCY_LEVELS,
  REMOTE_TYPES,
  REMOTE_TYPE_LABELS,
  SALES_INDUSTRY_OPTIONS,
  SALES_SKILL_SUGGESTIONS,
  SENIORITY_LABELS,
} from '@/lib/config';
import { validateFile } from '@/lib/gdpr';
import { candidateProfileSchema, cn, deriveSeniorityFromYears } from '@/lib/utils';

type CandidateProfileFormValues = z.infer<typeof candidateProfileSchema>;
type LanguageEntry = CandidateProfileFormValues['languageProficiencies'][number];
type ToggleField = 'remotePreference' | 'careerGoals' | 'preferredCompanyTypes';

const stepLabels = ['Start', 'Profil', 'Erfahrung', 'Ziele', 'Skills', 'Gehalt'] as const;

const stepFieldMap: Record<number, Array<FieldPath<CandidateProfileFormValues>>> = {
  1: ['firstName', 'lastName', 'email', 'location', 'country'],
  2: ['remotePreference', 'currentRole', 'yearsOfExperience', 'desiredJobRoles'],
  3: ['desiredIndustries', 'careerGoals'],
  4: ['skills', 'languageProficiencies'],
  5: ['salaryExpectationBase', 'salaryExpectationOte'],
};

function buildDefaultValues(seed?: Partial<CandidateProfileFormValues>): CandidateProfileFormValues {
  return {
    firstName: seed?.firstName || '',
    lastName: seed?.lastName || '',
    email: seed?.email || '',
    phone: seed?.phone || '',
    linkedinUrl: seed?.linkedinUrl || '',
    location: seed?.location || '',
    country: seed?.country || '',
    remotePreference: seed?.remotePreference || [],
    yearsOfExperience: seed?.yearsOfExperience ?? 0,
    currentRole: seed?.currentRole || '',
    targetRole: seed?.targetRole || '',
    desiredJobRoles: seed?.desiredJobRoles || [],
    desiredIndustries: seed?.desiredIndustries || [],
    careerGoals: seed?.careerGoals || [],
    preferredCompanyTypes: seed?.preferredCompanyTypes || [],
    seniority: seed?.seniority || '',
    languages: seed?.languages || [],
    languageProficiencies: seed?.languageProficiencies || [
      { language: 'Deutsch', level: 'Muttersprachliches Niveau' },
    ],
    salaryExpectationBase: seed?.salaryExpectationBase ?? 60000,
    salaryExpectationOte: seed?.salaryExpectationOte ?? 100000,
    salaryExpectationCurrency: seed?.salaryExpectationCurrency || 'EUR',
    noticePeriod: seed?.noticePeriod || '',
    shortBio: seed?.shortBio || '',
    skills: seed?.skills || [],
    cvUrl: seed?.cvUrl || '',
    cvFileName: seed?.cvFileName || '',
    cvUploadDate: seed?.cvUploadDate,
    googlePlaceId: seed?.googlePlaceId || '',
    googlePlaceData: seed?.googlePlaceData,
    onboardingStep: seed?.onboardingStep ?? 0,
    onboardingSource: seed?.onboardingSource,
    visibleToRecruiters: seed?.visibleToRecruiters ?? true,
    openToWork: seed?.openToWork ?? true,
  };
}

function normalizeTagArray(values: string[] = []) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const maybeMessage = (error as { message?: unknown }).message;
  return typeof maybeMessage === 'string' ? maybeMessage : undefined;
}

function InlineError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-destructive">{message}</p>;
}

function TagSelector({
  value,
  onChange,
  suggestions,
  placeholder,
  buttonLabel,
}: {
  value: string[];
  onChange: (nextValue: string[]) => void;
  suggestions: readonly string[];
  placeholder: string;
  buttonLabel: string;
}) {
  const [inputValue, setInputValue] = useState('');
  const listId = useId();

  const addValue = (rawValue: string) => {
    const normalized = rawValue.trim();

    if (!normalized) {
      return;
    }

    onChange(normalizeTagArray([...value, normalized]));
    setInputValue('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          list={listId}
          placeholder={placeholder}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addValue(inputValue);
            }
          }}
        />
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
        <Button type="button" variant="outline" onClick={() => addValue(inputValue)}>
          {buttonLabel}
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onChange(value.filter((entry) => entry !== item))}
            >
              {item} ×
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {suggestions
          .filter((suggestion) => !value.includes(suggestion))
          .slice(0, 12)
          .map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
              onClick={() => addValue(suggestion)}
            >
              + {suggestion}
            </button>
          ))}
      </div>
    </div>
  );
}

export function CandidateOnboardingFlow({ entryPoint }: { entryPoint: 'onboarding' | 'profile' }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dbUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(entryPoint === 'profile' ? 1 : 0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CandidateProfileFormValues>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: buildDefaultValues({ email: dbUser?.email || '' }),
  });

  const remotePreference = watch('remotePreference') || [];
  const desiredJobRoles = watch('desiredJobRoles') || [];
  const desiredIndustries = watch('desiredIndustries') || [];
  const careerGoals = watch('careerGoals') || [];
  const preferredCompanyTypes = watch('preferredCompanyTypes') || [];
  const skills = watch('skills') || [];
  const languageProficiencies = watch('languageProficiencies') || [];
  const salaryExpectationBase = Number(watch('salaryExpectationBase') || 0);
  const salaryExpectationOte = Number(watch('salaryExpectationOte') || 0);
  const yearsOfExperience = Number(watch('yearsOfExperience') || 0);
  const derivedSeniority = useMemo(
    () => deriveSeniorityFromYears(yearsOfExperience),
    [yearsOfExperience],
  );

  useEffect(() => {
    if (!derivedSeniority) {
      return;
    }

    setValue('seniority', derivedSeniority, { shouldValidate: false });
  }, [derivedSeniority, setValue]);

  useEffect(() => {
    if (!dbUser) {
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);

      try {
        const token = await getIdToken();
        const response = await fetch('/api/candidate/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await response.json();
        const nextValues = payload.data
          ? buildDefaultValues(payload.data)
          : buildDefaultValues({ email: dbUser.email || '' });

        reset(nextValues);
        setStep(entryPoint === 'profile' ? 1 : Math.max(nextValues.onboardingStep || 0, 0));
      } catch {
        reset(buildDefaultValues({ email: dbUser.email || '' }));
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [dbUser, entryPoint, reset]);

  const toggleMultiValue = (field: ToggleField, value: string) => {
    const currentValue = watch(field) || [];
    const nextValue = currentValue.includes(value)
      ? currentValue.filter((entry: string) => entry !== value)
      : [...currentValue, value];

    setValue(field, normalizeTagArray(nextValue), { shouldValidate: true });
  };

  const updateLanguageEntry = (index: number, patch: Partial<LanguageEntry>) => {
    const nextEntries = [...languageProficiencies];
    nextEntries[index] = { ...nextEntries[index], ...patch };

    setValue('languageProficiencies', nextEntries, { shouldValidate: true });
    setValue(
      'languages',
      normalizeTagArray(nextEntries.map((entry) => entry.language)),
      { shouldValidate: false },
    );
  };

  const addLanguageEntry = () => {
    setValue(
      'languageProficiencies',
      [...languageProficiencies, { language: '', level: 'Konversationssicher' }],
      { shouldValidate: true },
    );
  };

  const removeLanguageEntry = (index: number) => {
    const nextEntries = languageProficiencies.filter((_: LanguageEntry, itemIndex: number) => itemIndex !== index);
    const normalized = nextEntries.length
      ? nextEntries
      : [{ language: '', level: 'Konversationssicher' }];

    setValue('languageProficiencies', normalized, { shouldValidate: true });
    setValue(
      'languages',
      normalizeTagArray(nextEntries.map((entry) => entry.language)),
      { shouldValidate: false },
    );
  };

  const goNext = async () => {
    const fields = stepFieldMap[step];

    if (fields) {
      const isValid = await trigger(fields);

      if (!isValid) {
        return;
      }
    }

    setError('');
    setStep((currentStep) => Math.min(currentStep + 1, 5));
  };

  const handleCvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validation = validateFile(file, 'CV');

    if (!validation.valid) {
      setError(validation.error || 'Ungültige Datei');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const fileUrl = `https://storage.placeholder.com/${Date.now()}-${file.name}`;
      const token = await getIdToken();
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl,
          fileType: file.type,
          fileSizeKb: Math.round(file.size / 1024),
          category: 'cv',
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Upload fehlgeschlagen');
      }

      reset(buildDefaultValues({
        ...getValues(),
        ...payload.extraction,
        cvUrl: fileUrl,
        cvFileName: file.name,
        cvUploadDate: new Date().toISOString(),
        onboardingStep: 1,
        onboardingSource: 'cv',
      }));
      setSuccess('Lebenslauf hochgeladen und Mock-Daten übernommen.');
      setStep(1);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (values: CandidateProfileFormValues) => {
    setSaving(true);
    setError('');

    try {
      const token = await getIdToken();
      const response = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          seniority: derivedSeniority,
          onboardingStep: 5,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Fehler beim Speichern');
      }

      await refreshUser();
      setSuccess('Dein Profil wurde erfolgreich gespeichert.');
      router.push('/dashboard/candidate');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  if (!dbUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="h-[520px] animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {entryPoint === 'onboarding' ? 'Dein Sales-Profil' : 'Mein Profil'}
          </h1>
          <p className="text-muted-foreground">
            Schritt für Schritt zu besseren Software-Sales-Matches.
          </p>
        </div>
        {derivedSeniority && (
          <Badge variant="outline">{SENIORITY_LABELS[derivedSeniority]}</Badge>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {stepLabels.map((label, index) => (
          <button
            key={label}
            type="button"
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              step === index
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground',
            )}
            onClick={() => {
              if (index === 0 || step > index) {
                setStep(index);
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="rounded-3xl border-0 bg-muted/30 shadow-none">
        <CardHeader>
          <CardTitle>
            {step === 0
              ? 'Wie möchtest du starten?'
              : step === 1
                ? 'Erzähl uns etwas über dich'
                : step === 2
                  ? 'Was suchst du als Nächstes?'
                  : step === 3
                    ? 'Worauf legst du Wert?'
                    : step === 4
                      ? 'Welche Skills und Sprachen bringst du mit?'
                      : 'Was sind deine Gehaltsziele?'}
          </CardTitle>
          <CardDescription>
            {step === 0
              ? 'Du kannst deinen CV hochladen oder direkt manuell loslegen.'
              : 'Pflichtfelder sind markiert und werden inline validiert.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                className="rounded-2xl border bg-background p-6 text-left transition hover:border-primary"
                onClick={() => {
                  setValue('onboardingSource', 'cv');
                  fileInputRef.current?.click();
                }}
              >
                <CloudUpload className="mb-4 h-8 w-8 text-primary" />
                <p className="mb-2 text-lg font-semibold">Lebenslauf hochladen</p>
                <p className="text-sm text-muted-foreground">
                  Wir übernehmen Mock-Daten aus deinem CV und du passt sie danach an.
                </p>
              </button>

              <button
                type="button"
                className="rounded-2xl border bg-background p-6 text-left transition hover:border-primary"
                onClick={() => {
                  setValue('onboardingSource', 'manual');
                  setError('');
                  setStep(1);
                }}
              >
                <Sparkles className="mb-4 h-8 w-8 text-primary" />
                <p className="mb-2 text-lg font-semibold">Manuell starten</p>
                <p className="text-sm text-muted-foreground">
                  Ideal, wenn du dein Profil direkt Schritt für Schritt aufbauen möchtest.
                </p>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleCvUpload}
              />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Vorname *</label>
                  <Input {...register('firstName')} />
                  <InlineError message={getErrorMessage(errors.firstName)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Nachname *</label>
                  <Input {...register('lastName')} />
                  <InlineError message={getErrorMessage(errors.lastName)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">E-Mail *</label>
                  <Input type="email" {...register('email')} />
                  <InlineError message={getErrorMessage(errors.email)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Telefon</label>
                  <Input {...register('phone')} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">LinkedIn</label>
                  <Input {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
                  <InlineError message={getErrorMessage(errors.linkedinUrl)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Standort *</label>
                  <Input {...register('location')} placeholder="z. B. Berlin" />
                  <InlineError message={getErrorMessage(errors.location)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Land *</label>
                  <select
                    {...register('country')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Bitte wählen</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <InlineError message={getErrorMessage(errors.country)} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Kurzprofil</label>
                  <textarea
                    {...register('shortBio')}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Womit bist du im Software Sales besonders stark?"
                  />
                  <InlineError message={getErrorMessage(errors.shortBio)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">Remote Preference *</label>
                  <div className="flex flex-wrap gap-2">
                    {REMOTE_TYPES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm',
                          remotePreference.includes(option)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'bg-background',
                        )}
                        onClick={() => toggleMultiValue('remotePreference', option)}
                      >
                        {REMOTE_TYPE_LABELS[option]}
                      </button>
                    ))}
                  </div>
                  <InlineError message={getErrorMessage(errors.remotePreference)} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Aktuelle Rolle *</label>
                    <Input
                      list="current-role-options"
                      placeholder="z. B. Account Executive"
                      {...register('currentRole')}
                    />
                    <datalist id="current-role-options">
                      {JOB_ROLES.map((role) => (
                        <option key={role} value={role} />
                      ))}
                    </datalist>
                    <InlineError message={getErrorMessage(errors.currentRole)} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Berufserfahrung *</label>
                    <Input
                      type="number"
                      min={0}
                      {...register('yearsOfExperience', { valueAsNumber: true })}
                    />
                    <InlineError message={getErrorMessage(errors.yearsOfExperience)} />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Zielrollen *</label>
                  <TagSelector
                    value={desiredJobRoles}
                    onChange={(nextValue) => {
                      setValue('desiredJobRoles', nextValue, { shouldValidate: true });
                      setValue('targetRole', nextValue[0] || '', { shouldValidate: false });
                    }}
                    suggestions={JOB_ROLES}
                    placeholder="Rolle eingeben oder auswählen"
                    buttonLabel="Hinzufügen"
                  />
                  <InlineError message={getErrorMessage(errors.desiredJobRoles)} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Kündigungsfrist</label>
                  <Input {...register('noticePeriod')} placeholder="z. B. 3 Monate" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">Branchen *</label>
                  <TagSelector
                    value={desiredIndustries}
                    onChange={(nextValue) => setValue('desiredIndustries', nextValue, { shouldValidate: true })}
                    suggestions={SALES_INDUSTRY_OPTIONS}
                    placeholder="Branche auswählen"
                    buttonLabel="Hinzufügen"
                  />
                  <InlineError message={getErrorMessage(errors.desiredIndustries)} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Karriereziele *</label>
                  <div className="flex flex-wrap gap-2">
                    {CAREER_GOAL_OPTIONS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm',
                          careerGoals.includes(goal)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'bg-background',
                        )}
                        onClick={() => toggleMultiValue('careerGoals', goal)}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                  <InlineError message={getErrorMessage(errors.careerGoals)} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Bevorzugte Company-Typen</label>
                  <div className="flex flex-wrap gap-2">
                    {COMPANY_TYPE_OPTIONS.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm',
                          preferredCompanyTypes.includes(type)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'bg-background',
                        )}
                        onClick={() => toggleMultiValue('preferredCompanyTypes', type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">Top Skills *</label>
                  <TagSelector
                    value={skills}
                    onChange={(nextValue) => setValue('skills', nextValue, { shouldValidate: true })}
                    suggestions={SALES_SKILL_SUGGESTIONS}
                    placeholder="Skill eingeben und auswählen"
                    buttonLabel="Skill"
                  />
                  <InlineError message={getErrorMessage(errors.skills)} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Sprachen *</label>
                  <div className="space-y-3">
                    {languageProficiencies.map((entry, index) => (
                      <div
                        key={`${entry.language}-${index}`}
                        className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                      >
                        <div>
                          <Input
                            list={`language-options-${index}`}
                            value={entry.language}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              updateLanguageEntry(index, { language: event.target.value })
                            }
                          />
                          <datalist id={`language-options-${index}`}>
                            {LANGUAGE_OPTIONS.map((language) => (
                              <option key={language} value={language} />
                            ))}
                          </datalist>
                        </div>
                        <div>
                          <select
                            value={entry.level}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                              updateLanguageEntry(index, { level: event.target.value })
                            }
                          >
                            {LANGUAGE_PROFICIENCY_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button type="button" variant="ghost" onClick={() => removeLanguageEntry(index)}>
                          Entfernen
                        </Button>
                      </div>
                    ))}
                  </div>
                  <InlineError message={getErrorMessage(errors.languageProficiencies)} />
                  <Button type="button" variant="outline" onClick={addLanguageEntry}>
                    Sprache hinzufügen
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm font-medium">
                      <span>Grundgehalt *</span>
                      <span>{salaryExpectationBase.toLocaleString('de-DE')} €</span>
                    </div>
                    <input
                      type="range"
                      min={35000}
                      max={220000}
                      step={5000}
                      value={salaryExpectationBase}
                      className="w-full"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setValue('salaryExpectationBase', Number(event.target.value), { shouldValidate: true })
                      }
                    />
                    <InlineError message={getErrorMessage(errors.salaryExpectationBase)} />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm font-medium">
                      <span>OTE *</span>
                      <span>{Math.max(salaryExpectationOte, salaryExpectationBase).toLocaleString('de-DE')} €</span>
                    </div>
                    <input
                      type="range"
                      min={50000}
                      max={400000}
                      step={5000}
                      value={Math.max(salaryExpectationOte, salaryExpectationBase)}
                      className="w-full"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setValue('salaryExpectationOte', Number(event.target.value), { shouldValidate: true })
                      }
                    />
                    <InlineError message={getErrorMessage(errors.salaryExpectationOte)} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center justify-between rounded-2xl border bg-background px-4 py-3 text-sm font-medium">
                    Open to Work
                    <input type="checkbox" {...register('openToWork')} />
                  </label>
                  <label className="flex items-center justify-between rounded-2xl border bg-background px-4 py-3 text-sm font-medium">
                    Sichtbar für Recruiter
                    <input type="checkbox" {...register('visibleToRecruiters')} />
                  </label>
                </div>

                <div className="rounded-2xl border bg-background p-5">
                  <div className="mb-3 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Match-Zusammenfassung
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {desiredJobRoles.map((role) => (
                      <Badge key={role}>{role}</Badge>
                    ))}
                    {skills.slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {Object.keys(errors).length > 0 && step > 0 && (
              <p className="text-sm text-destructive">
                Bitte prüfe die markierten Pflichtfelder in diesem Schritt.
              </p>
            )}

            {step > 0 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep((currentStep) => Math.max(currentStep - 1, entryPoint === 'profile' ? 1 : 0))}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Zurück
                </Button>

                {step < 5 ? (
                  <Button type="button" onClick={goNext}>
                    Weiter
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={saving || uploading}>
                    {saving ? 'Wird gespeichert...' : 'Abschließen'}
                  </Button>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
