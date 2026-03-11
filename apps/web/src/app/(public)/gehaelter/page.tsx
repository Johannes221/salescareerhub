'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { COUNTRIES, SENIORITY_LABELS } from '@/lib/config';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function GehaelterPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('');

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const params = country ? `?country=${country}` : '';
      const res = await fetch(`/api/salary${params}`);
      const data = await res.json();
      setInsights(data.data || []);
    } catch {} finally { setLoading(false); }
  }, [country]);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gehaltsübersicht Software Sales</h1>
        <p className="text-muted-foreground">Aktuelle Gehaltsdaten für Software Sales Rollen im DACH-Raum (2024)</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setCountry('')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!country ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>Alle</button>
        {COUNTRIES.map((c) => (
          <button key={c} onClick={() => setCountry(c)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${country === c ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Daten verfügbar</h3>
          <p className="text-muted-foreground">Für diese Auswahl liegen noch keine Gehaltsdaten vor.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight: any) => (
            <Card key={insight.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{insight.role}</CardTitle>
                  <Badge variant="outline">{SENIORITY_LABELS[insight.seniority as keyof typeof SENIORITY_LABELS] || insight.seniority}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.country}{insight.region ? ` · ${insight.region}` : ''}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Base Salary</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">{formatCurrency(insight.baseSalaryMedian)}</span>
                      <span className="text-xs text-muted-foreground">Median</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatCurrency(insight.baseSalaryMin)} – {formatCurrency(insight.baseSalaryMax)}</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">OTE (On-Target Earnings)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold text-primary">{formatCurrency(insight.oteMedian)}</span>
                      <span className="text-xs text-muted-foreground">Median</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatCurrency(insight.oteMin)} – {formatCurrency(insight.oteMax)}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Konfidenz: {Math.round(insight.confidenceScore * 100)}% · {insight.year}</span>
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
