'use client';

import React, { useState, useCallback } from 'react';
import { UploadCard } from '@/components/resume/UploadCard';
import { ReviewPanel } from '@/components/resume/ReviewPanel';
import { PrivacyNotice } from '@/components/resume/PrivacyNotice';
import {
  CandidateForm,
  emptyFormData,
  profileToFormData,
  type CandidateFormData,
} from '@/components/resume/CandidateForm';
import { extractResumeFromFile, extractResumeDemo } from '@/lib/resume/api-client';
import type { NormalizedCandidateProfile } from '@/lib/resume/schemas';

type ExtractionStatus = 'idle' | 'loading' | 'success' | 'error';

export default function LebenslaufPage() {
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<CandidateFormData>(emptyFormData());
  const [extractedProfile, setExtractedProfile] = useState<NormalizedCandidateProfile | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [showReview, setShowReview] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [providerInfo, setProviderInfo] = useState<string | null>(null);

  const hasExistingData = Object.values(formData).some((v) => v !== '');

  const applyExtraction = useCallback((profile: NormalizedCandidateProfile, meta: { provider: string; warnings: string[] }) => {
    const newFormData = profileToFormData(profile);
    setFormData(newFormData);
    setExtractedProfile(profile);
    setWarnings(meta.warnings);
    setProviderInfo(meta.provider);

    const filled = new Set<string>();
    for (const [key, value] of Object.entries(newFormData)) {
      if (value !== '') filled.add(key);
    }
    setAutoFilledFields(filled);
    setShowReview(true);
    setStatus('success');
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      if (!privacyAccepted) {
        setErrorMessage('Bitte bestätigen Sie die Datenschutzhinweise vor dem Upload.');
        return;
      }

      setStatus('loading');
      setErrorMessage(null);

      try {
        const result = await extractResumeFromFile(file);

        if (result.success) {
          applyExtraction(result.extracted, result.meta);
        } else {
          setStatus('error');
          setErrorMessage(result.error.message);
        }
      } catch {
        setStatus('error');
        setErrorMessage('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      }
    },
    [privacyAccepted, applyExtraction],
  );

  const handleDemoExtract = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await extractResumeDemo();
      if (result.success) {
        applyExtraction(result.extracted, result.meta);
      } else {
        setStatus('error');
        setErrorMessage(result.error.message);
      }
    } catch {
      setStatus('error');
      setErrorMessage('Demo-Extraktion fehlgeschlagen.');
    }
  }, [applyExtraction]);

  const handleFieldChange = useCallback((field: keyof CandidateFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setAutoFilledFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Kandidatenprofil erstellen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Laden Sie Ihren Lebenslauf hoch, um das Formular automatisch vorzubefüllen,
          oder füllen Sie die Felder manuell aus.
        </p>
      </div>

      <div className="space-y-6">
        {/* Privacy Notice */}
        <PrivacyNotice accepted={privacyAccepted} onAcceptChange={setPrivacyAccepted} />

        {/* Upload Card */}
        <UploadCard
          onFileSelected={handleFileSelected}
          isLoading={status === 'loading'}
          hasExistingData={hasExistingData}
          onDemoExtract={handleDemoExtract}
        />

        {/* Error Banner */}
        {status === 'error' && errorMessage && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-destructive">
                  Der Lebenslauf konnte nicht verarbeitet werden.
                </p>
                <p className="mt-1 text-sm text-destructive/80">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {status === 'success' && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Daten erfolgreich extrahiert und übernommen.
                </p>
                <p className="text-xs text-green-700">
                  Provider: {providerInfo} · {autoFilledFields.size} Felder vorbefüllt · Bitte prüfen Sie die Angaben.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Review Panel */}
        {showReview && extractedProfile && (
          <ReviewPanel
            profile={extractedProfile}
            warnings={warnings}
            onDismiss={() => setShowReview(false)}
          />
        )}

        {/* Form */}
        <CandidateForm
          formData={formData}
          onFieldChange={handleFieldChange}
          autoFilledFields={autoFilledFields}
          extractedProfile={extractedProfile}
        />
      </div>
    </div>
  );
}
