'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getIdToken } from '@salescareerhub/auth/client';
import { Trophy, Star, Shield, RefreshCw } from 'lucide-react';

export default function AdminRankingsPage() {
  const { dbUser } = useAuth();
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchRankings(); }, []);

  const fetchRankings = async () => {
    try {
      const res = await fetch('/api/rankings');
      if (res.ok) { const data = await res.json(); setRankings(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const generateRankings = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/rankings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`${data.generated || 0} Rankings für ${data.period} generiert`);
        await fetchRankings();
      } else {
        setMessage(data.error || 'Generierung fehlgeschlagen');
      }
    } catch {
      setMessage('Generierung fehlgeschlagen');
    } finally {
      setGenerating(false);
    }
  };

  if (dbUser?.role !== 'admin') return null;

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rankings verwalten</h1>
          <p className="text-muted-foreground">{rankings.length} Ranking-Einträge</p>
        </div>
        <Button onClick={generateRankings} disabled={generating}>
          <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generiere...' : 'Jetzt generieren'}
        </Button>
      </div>

      {message && (
        <div className="mb-4 rounded-md border px-3 py-2 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
      ) : rankings.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Keine Rankings vorhanden</h3>
          <p className="text-sm text-muted-foreground mt-1">Rankings werden aus Bewertungsdaten generiert.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {rankings.map((r: any, idx: number) => (
            <Card key={r.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{r.company?.name || 'Unternehmen'}</p>
                        {r.isVerified && <Shield className="h-3 w-3 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{r.country} · {r.period} · {r.reviewCount} Reviews</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><span className="text-sm font-bold">{r.avgRating?.toFixed(1)}</span></div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold">{r.overallScore}</span>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
