'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { REVIEW_DIMENSION_LABELS } from '@/lib/config';
import { getIdToken } from '@/lib/auth/client';
import { Star, ArrowLeft, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export default function ReviewPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const router = useRouter();
  const { dbUser } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);

  const [scores, setScores] = useState<Record<string, number>>({
    compensation: 0, quotaRealism: 0, leadQuality: 0, careerOpportunities: 0,
    productMarketFit: 0, management: 0, culture: 0, workLifeBalance: 0,
  });
  const [reviewText, setReviewText] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [roleAtCompany, setRoleAtCompany] = useState('');

  const fetchCompany = useCallback(async () => {
    try {
      const res = await fetch(`/api/companies/${slug}`);
      if (res.ok) { const data = await res.json(); setCompany(data.data); }
    } catch {} finally { setLoading(false); }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchCompany();
  }, [slug, fetchCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!dbUser) { router.push('/login'); return; }
    if (!gdprConsent) { setError('Bitte stimme der Datenverarbeitung zu.'); return; }

    const filledScores = Object.values(scores).filter((s) => s > 0);
    if (filledScores.length < 4) { setError('Bitte bewerte mindestens 4 Dimensionen.'); return; }

    setSubmitting(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ companyId: company.id, ...scores, reviewText, pros, cons, roleAtCompany, gdprConsent }),
      });
      if (res.ok) { setSubmitted(true); }
      else { const data = await res.json(); setError(data.error || 'Fehler beim Speichern'); }
    } catch { setError('Fehler beim Speichern'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="container py-8 max-w-2xl"><div className="h-96 bg-muted animate-pulse rounded-lg" /></div>;

  if (!company) return (
    <div className="container py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Unternehmen nicht gefunden</h1>
      <Link href="/unternehmen"><Button>Alle Unternehmen</Button></Link>
    </div>
  );

  if (submitted) return (
    <div className="container py-16 text-center max-w-md mx-auto">
      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Bewertung eingereicht!</h1>
      <p className="text-muted-foreground mb-4">Deine Bewertung wird von unserem Team geprüft und innerhalb von 24 Stunden freigeschaltet.</p>
      <Link href={`/unternehmen/${slug}`}><Button>Zurück zum Unternehmen</Button></Link>
    </div>
  );

  if (!dbUser) return (
    <div className="container py-16 text-center max-w-md mx-auto">
      <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Anmeldung erforderlich</h1>
      <p className="text-muted-foreground mb-4">Melde dich an, um eine Bewertung abzugeben.</p>
      <Link href="/login"><Button>Anmelden</Button></Link>
    </div>
  );

  return (
    <div className="container py-8 max-w-2xl">
      <Link href={`/unternehmen/${slug}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Zurück zu {company.name}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{company.name} bewerten</h1>
        <p className="text-muted-foreground">Teile deine Erfahrungen mit der Sales-Organisation</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bewertungsdimensionen</CardTitle>
            <CardDescription>Bewerte von 1 (schlecht) bis 5 (ausgezeichnet). Mindestens 4 Dimensionen bewerten.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(REVIEW_DIMENSION_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium">{label}</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button key={val} type="button" onClick={() => setScores({ ...scores, [key]: val })}
                      className="p-1">
                      <Star className={`h-5 w-5 transition-colors ${val <= (scores[key] || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Deine Erfahrung</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Deine Rolle dort</label>
              <Input value={roleAtCompany} onChange={(e) => setRoleAtCompany(e.target.value)} placeholder="z.B. Account Executive" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bewertungstext</label>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4}
                placeholder="Beschreibe deine Erfahrung bei diesem Unternehmen..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-600">Pro</label>
                <textarea value={pros} onChange={(e) => setPros(e.target.value)} rows={3}
                  placeholder="Was hat dir gefallen?"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-red-600">Contra</label>
                <textarea value={cons} onChange={(e) => setCons(e.target.value)} rows={3}
                  placeholder="Was könnte besser sein?"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={gdprConsent} onChange={(e) => setGdprConsent(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded border-gray-300" id="gdpr-consent" />
              <label htmlFor="gdpr-consent" className="text-xs text-muted-foreground">
                <Shield className="h-3 w-3 inline mr-1 text-blue-500" />
                Ich stimme der Verarbeitung meiner Bewertung gemäß Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) zu.
                Die Bewertung wird moderiert und kann nach Freischaltung öffentlich angezeigt werden.
                Ich kann meine Einwilligung jederzeit über die Kontoeinstellungen widerrufen.
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/unternehmen/${slug}`}><Button type="button" variant="outline">Abbrechen</Button></Link>
          <Button type="submit" disabled={submitting || !gdprConsent}>
            {submitting ? 'Wird eingereicht...' : 'Bewertung einreichen'}
          </Button>
        </div>
      </form>
    </div>
  );
}
