'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SENIORITY_LABELS } from '@salescareerhub/config';
import { formatCurrency } from '@salescareerhub/utils';
import { getIdToken } from '@salescareerhub/auth/client';
import { TrendingUp, Plus } from 'lucide-react';

export default function AdminSalaryPage() {
  const { dbUser } = useAuth();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInsights(); }, []);

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/salary');
      if (res.ok) { const data = await res.json(); setInsights(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  if (dbUser?.role !== 'admin') return null;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Salary Data</h1>
          <p className="text-muted-foreground">{insights.length} Gehaltsdatensätze</p>
        </div>
        {/* TODO: Add create form */}
        <Button disabled><Plus className="mr-2 h-4 w-4" />Neuer Eintrag</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
      ) : (
        <div className="space-y-2">
          {insights.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{s.role}</p>
                      <Badge variant="outline" className="text-xs">{SENIORITY_LABELS[s.seniority as keyof typeof SENIORITY_LABELS] || s.seniority}</Badge>
                      <Badge variant="secondary" className="text-xs">{s.country}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Base: {formatCurrency(s.baseSalaryMin)} – {formatCurrency(s.baseSalaryMax)} · OTE: {formatCurrency(s.oteMin)} – {formatCurrency(s.oteMax)} · {s.year}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Konfidenz: {Math.round(s.confidenceScore * 100)}%
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
