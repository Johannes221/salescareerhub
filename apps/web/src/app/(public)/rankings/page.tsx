'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES } from '@salescareerhub/config';
import { Trophy, Star, Building2, Shield, TrendingUp } from 'lucide-react';

export default function RankingsPage() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('');

  useEffect(() => { fetchRankings(); }, [country]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const params = country ? `?country=${country}` : '';
      const res = await fetch(`/api/rankings${params}`);
      const data = await res.json();
      setRankings(data.data || []);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Unternehmens-Rankings</h1>
        <p className="text-muted-foreground">Die bestbewerteten Software Sales Organisationen im DACH-Raum</p>
      </div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setCountry('')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!country ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>Alle</button>
        {COUNTRIES.map((c) => (
          <button key={c} onClick={() => setCountry(c)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${country === c ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>{c}</button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Rankings verfügbar</h3>
          <p className="text-muted-foreground">Für diese Auswahl liegen noch keine Rankings vor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rankings.map((r: any, idx: number) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-6 py-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl shrink-0">
                  {idx + 1}
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{r.company?.name || 'Unternehmen'}</h3>
                      {r.isVerified && <Shield className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{r.country} · {r.reviewCount} Bewertungen</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{r.avgRating?.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Bewertung</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-lg">{r.overallScore}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
