'use client';

import React, { useEffect, useState } from 'react';
import { CandidateOnboardingFlow } from '@/components/candidate-onboarding-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getIdToken } from '@/lib/auth/client';

type MetricsForm = {
  averageDealSize: string;
  largestDealClosed: string;
  averageSalesCycle: string;
  salesMotionExperience: string;
  industriesExperience: string;
  territorySize: string;
};

const INITIAL_STATE: MetricsForm = {
  averageDealSize: '',
  largestDealClosed: '',
  averageSalesCycle: '',
  salesMotionExperience: '',
  industriesExperience: '',
  territorySize: '',
};

export default function CandidateProfilePage() {
  const [form, setForm] = useState<MetricsForm>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const token = await getIdToken();
        const res = await fetch('/api/candidate/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;
        const payload = await res.json();
        const profile = payload.profile || {};

        setForm({
          averageDealSize: profile.averageDealSize ? String(profile.averageDealSize) : '',
          largestDealClosed: profile.largestDealClosed ? String(profile.largestDealClosed) : '',
          averageSalesCycle: profile.averageSalesCycle ? String(profile.averageSalesCycle) : '',
          salesMotionExperience: profile.salesMotionExperience || '',
          industriesExperience: Array.isArray(profile.industriesExperience) ? profile.industriesExperience.join(', ') : '',
          territorySize: profile.territorySize || '',
        });
      } catch {
      } finally {
        setLoading(false);
      }
    };

    void loadMetrics();
  }, []);

  const updateField = (field: keyof MetricsForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const token = await getIdToken();
      const res = await fetch('/api/candidate/profile/metrics', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          averageDealSize: form.averageDealSize,
          largestDealClosed: form.largestDealClosed,
          averageSalesCycle: form.averageSalesCycle,
          salesMotionExperience: form.salesMotionExperience,
          industriesExperience: form.industriesExperience
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
          territorySize: form.territorySize,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setError(payload?.error || 'Sales Metrics konnten nicht gespeichert werden');
        return;
      }

      setMessage('Sales Metrics wurden gespeichert.');
    } catch {
      setError('Sales Metrics konnten nicht gespeichert werden');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CandidateOnboardingFlow entryPoint="profile" />

      <Card>
        <CardHeader>
          <CardTitle>Sales Metrics</CardTitle>
          <CardDescription>
            Pflege Deal Size, Sales Cycle, Industries und Sales Motion für bessere Matching-Qualität.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[...Array(6)].map((_, index) => <div key={index} className="h-12 rounded-md bg-muted animate-pulse" />)}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Average Deal Size (€)</label>
                  <input
                    value={form.averageDealSize}
                    onChange={(e) => updateField('averageDealSize', e.target.value)}
                    type="number"
                    min={0}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Largest Deal Closed (€)</label>
                  <input
                    value={form.largestDealClosed}
                    onChange={(e) => updateField('largestDealClosed', e.target.value)}
                    type="number"
                    min={0}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Average Sales Cycle (Tage)</label>
                  <input
                    value={form.averageSalesCycle}
                    onChange={(e) => updateField('averageSalesCycle', e.target.value)}
                    type="number"
                    min={0}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Territory Size</label>
                  <input
                    value={form.territorySize}
                    onChange={(e) => updateField('territorySize', e.target.value)}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    placeholder="z. B. DACH oder Named Accounts"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Sales Motion Experience</label>
                  <input
                    value={form.salesMotionExperience}
                    onChange={(e) => updateField('salesMotionExperience', e.target.value)}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    placeholder="z. B. SMB, Mid-Market, Enterprise"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Industries Experience</label>
                  <textarea
                    value={form.industriesExperience}
                    onChange={(e) => updateField('industriesExperience', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="SaaS, FinTech, Cyber Security"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {message && <p className="text-sm text-green-700">{message}</p>}

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Wird gespeichert...' : 'Sales Metrics speichern'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
