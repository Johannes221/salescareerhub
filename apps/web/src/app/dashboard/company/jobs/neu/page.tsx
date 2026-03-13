'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActiveFilterChips, MultiSelectFilter } from '@/components/ui/multi-select-filter';
import { jobSchema } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  COUNTRIES,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  JOB_ROLES,
  REMOTE_TYPES,
  REMOTE_TYPE_LABELS,
  SALES_INDUSTRY_OPTIONS,
  SALES_MOTION_OPTIONS,
  SALES_SKILL_SUGGESTIONS,
  SENIORITY_LABELS,
  SENIORITY_LEVELS,
  type EmploymentType,
  type JobRole,
  type RemoteType,
  type SeniorityLevel,
} from '@/lib/config';
import { EMPTY_JOB_REQUIREMENT_BUCKET, type StructuredJobRequirements } from '@/lib/job-requirements';
import { getIdToken } from '@/lib/auth/client';
import { AlertCircle, Briefcase, Euro, FileText, ListChecks, MapPin, Save } from 'lucide-react';
import type { z } from 'zod';

type JobForm = z.infer<typeof jobSchema>;
type RequirementBucketKey = 'required' | 'optional';
type RequirementArrayField = 'industries' | 'previousRoles' | 'skills' | 'salesMotions';
type SelectOption = { value: string; label: string };

const experienceOptions = Array.from({ length: 16 }, (_, index) => ({
  value: String(index),
  label: index === 15 ? '15+ Jahre' : `${index} ${index === 1 ? 'Jahr' : 'Jahre'}`,
}));

const previousRoleOptions: SelectOption[] = JOB_ROLES.map((value: JobRole) => ({ value, label: value }));
const industryOptions: SelectOption[] = SALES_INDUSTRY_OPTIONS.map((value: string) => ({ value, label: value }));
const skillOptions: SelectOption[] = SALES_SKILL_SUGGESTIONS.map((value: string) => ({ value, label: value }));
const salesMotionOptions: SelectOption[] = SALES_MOTION_OPTIONS.map((value: string) => ({ value, label: value }));

const requirementLabels = {
  previousRoles: Object.fromEntries(previousRoleOptions.map((option: SelectOption) => [option.value, option.label])),
  industries: Object.fromEntries(industryOptions.map((option: SelectOption) => [option.value, option.label])),
  skills: Object.fromEntries(skillOptions.map((option: SelectOption) => [option.value, option.label])),
  salesMotions: Object.fromEntries(salesMotionOptions.map((option: SelectOption) => [option.value, option.label])),
};

const structuredDefaults: StructuredJobRequirements = {
  required: { ...EMPTY_JOB_REQUIREMENT_BUCKET },
  optional: { ...EMPTY_JOB_REQUIREMENT_BUCKET },
};

export default function CreateJobPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      employmentType: 'fulltime',
      remoteType: 'hybrid',
      currency: 'EUR',
      sourceType: 'direct_company_posting',
      tags: [],
      requirementsStructured: structuredDefaults,
    },
  });

  const requirements = watch('requirementsStructured') || structuredDefaults;

  const chipFilters = useMemo(() => ({
    previousRoles: requirements.required.previousRoles || [],
    industries: requirements.required.industries || [],
    skills: requirements.required.skills || [],
    salesMotions: requirements.required.salesMotions || [],
  }), [requirements.required]);

  const updateRequirementArray = (
    bucket: RequirementBucketKey,
    field: RequirementArrayField,
    values: string[],
  ) => {
    setValue(`requirementsStructured.${bucket}.${field}` as never, values as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const updateRequirementYears = (bucket: RequirementBucketKey, value: string) => {
    setValue(
      `requirementsStructured.${bucket}.yearsOfExperience` as never,
      (value ? Number(value) : null) as never,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const onSubmit = async (formData: JobForm) => {
    setSaving(true);
    setError('');

    try {
      const token = await getIdToken();
      const res = await fetch('/api/company/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/dashboard/company/jobs?created=true');
        return;
      }

      const data = await res.json().catch(() => null);
      setError(data?.error || 'Fehler beim Erstellen');
    } catch {
      setError('Fehler beim Erstellen');
    } finally {
      setSaving(false);
    }
  };

  const renderRequirementBucket = (
    bucket: RequirementBucketKey,
    title: string,
    description: string,
  ) => {
    const current = requirements[bucket];

    return (
      <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sales-Erfahrung</label>
            <select
              value={current.yearsOfExperience == null ? '' : String(current.yearsOfExperience)}
              onChange={(event) => updateRequirementYears(bucket, event.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Nicht festgelegt</option>
              {experienceOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <MultiSelectFilter
            label="Bisherige Rollen"
            options={previousRoleOptions}
            selected={current.previousRoles || []}
            onChange={(values: string[]) => updateRequirementArray(bucket, 'previousRoles', values)}
            placeholder="Rollen auswählen"
          />

          <MultiSelectFilter
            label="Branchen / Nischen"
            options={industryOptions}
            selected={current.industries || []}
            onChange={(values: string[]) => updateRequirementArray(bucket, 'industries', values)}
            placeholder="Branchen auswählen"
          />

          <MultiSelectFilter
            label="Sales Motion"
            options={salesMotionOptions}
            selected={current.salesMotions || []}
            onChange={(values: string[]) => updateRequirementArray(bucket, 'salesMotions', values)}
            placeholder="Motion auswählen"
          />

          <div className="lg:col-span-2">
            <MultiSelectFilter
              label="Skills"
              options={skillOptions}
              selected={current.skills || []}
              onChange={(values: string[]) => updateRequirementArray(bucket, 'skills', values)}
              placeholder="Skills auswählen"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold">Job erstellen</h1>
        <p className="text-muted-foreground">
          Hinterlege Rollenanforderungen strukturiert, damit Kandidaten auf den ersten Blick sehen,
          was passt und das Matching sauber auf harte Felder mappt.
        </p>
      </div>

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5" />
              Stelleninformationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jobtitel *</label>
              <Input {...register('title')} placeholder="z. B. Customer Success Manager Schweiz" />
              {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rolle *</label>
                <select {...register('roleCategory')} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">Auswählen</option>
                  {JOB_ROLES.map((role: JobRole) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.roleCategory ? <p className="text-xs text-destructive">{errors.roleCategory.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Seniority *</label>
                <select {...register('seniority')} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">Auswählen</option>
                  {SENIORITY_LEVELS.map((level: SeniorityLevel) => (
                    <option key={level} value={level}>{SENIORITY_LABELS[level]}</option>
                  ))}
                </select>
                {errors.seniority ? <p className="text-xs text-destructive">{errors.seniority.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Beschäftigungsart</label>
                <select {...register('employmentType')} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  {EMPLOYMENT_TYPES.map((type: EmploymentType) => (
                    <option key={type} value={type}>{EMPLOYMENT_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Remote-Typ</label>
                <select {...register('remoteType')} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  {REMOTE_TYPES.map((type: RemoteType) => (
                    <option key={type} value={type}>{REMOTE_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Standort
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Land</label>
              <select {...register('country')} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">Auswählen</option>
                {COUNTRIES.map((country: string) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stadt</label>
              <Input {...register('location')} placeholder="z. B. Basel" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Euro className="h-5 w-5" />
              Vergütung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Min (€)</label>
                <Input {...register('salaryMin', { valueAsNumber: true })} type="number" min={0} placeholder="z. B. 80000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Max (€)</label>
                <Input {...register('salaryMax', { valueAsNumber: true })} type="number" min={0} placeholder="z. B. 110000" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">OTE Min (€)</label>
                <Input {...register('oteMin', { valueAsNumber: true })} type="number" min={0} placeholder="z. B. 130000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OTE Max (€)</label>
                <Input {...register('oteMax', { valueAsNumber: true })} type="number" min={0} placeholder="z. B. 180000" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5" />
              Strukturierte Anforderungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 text-sm text-muted-foreground">
              Kandidaten sehen diese Kriterien später als klare Eigenschaften mit Match-Status statt als Freitextblock.
            </div>

            {renderRequirementBucket(
              'required',
              'Pflichtkriterien',
              'Diese Eigenschaften sollten für einen starken Match vorhanden sein.',
            )}

            {renderRequirementBucket(
              'optional',
              'Nice to have',
              'Diese Punkte verbessern das Matching, sind aber kein Ausschlusskriterium.',
            )}

            <ActiveFilterChips
              filters={chipFilters}
              labels={requirementLabels}
              onRemove={(group: string, value: string) => {
                const requirementGroup = group as RequirementArrayField;
                updateRequirementArray('required', requirementGroup, chipFilters[requirementGroup].filter((entry: string) => entry !== value));
              }}
              onClearAll={() => {
                updateRequirementArray('required', 'previousRoles', []);
                updateRequirementArray('required', 'industries', []);
                updateRequirementArray('required', 'skills', []);
                updateRequirementArray('required', 'salesMotions', []);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Beschreibung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kurzbeschreibung & Scope *</label>
              <textarea
                {...register('description')}
                rows={5}
                placeholder="Beschreibe die Rolle, den Kontext, das Team und die wichtigsten Verantwortlichkeiten."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Benefits</label>
              <textarea
                {...register('benefits')}
                rows={3}
                placeholder="Was bietet ihr Kandidaten?"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p>
            <strong>Hinweis:</strong> Die Anzeige wird nach dem Erstellen geprüft. Kandidaten sehen später kompakte
            Requirement-Felder und einen strukturierten Match statt eines überladenen Freitext-Screens.
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Abbrechen</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Wird erstellt...' : 'Job erstellen'}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
