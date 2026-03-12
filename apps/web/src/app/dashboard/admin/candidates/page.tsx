'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getIdToken } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Briefcase, Eye, EyeOff, ArrowRight, Download } from 'lucide-react';

export default function AdminCandidatesPage() {
  const { dbUser } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [salesMotion, setSalesMotion] = useState('');
  const [industry, setIndustry] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [minDealSize, setMinDealSize] = useState('');

  const fetchCandidates = useCallback(async () => {
    try {
      const token = await getIdToken();
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      if (salesMotion) params.set('salesMotion', salesMotion);
      if (industry) params.set('industry', industry);
      if (minExperience) params.set('minExperience', minExperience);
      if (minDealSize) params.set('minDealSize', minDealSize);
      const res = await fetch(`/api/admin/candidates?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setCandidates(data.data || []); }
    } catch {} finally { setLoading(false); }
  }, [search, role, salesMotion, industry, minExperience, minDealSize]);

  useEffect(() => { void fetchCandidates(); }, [fetchCandidates]);

  const exportCandidates = async () => {
    const token = await getIdToken();
    const params = new URLSearchParams({ format: 'csv' });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (salesMotion) params.set('salesMotion', salesMotion);
    if (industry) params.set('industry', industry);
    if (minExperience) params.set('minExperience', minExperience);
    if (minDealSize) params.set('minDealSize', minDealSize);
    const res = await fetch(`/api/admin/candidates?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
    const csv = await res.text();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'candidate-pipeline.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (dbUser?.role !== 'admin') return null;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kandidaten</h1>
        <p className="text-muted-foreground">{candidates.length} Kandidatenprofile</p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="relative xl:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kandidat suchen..." className="pl-9" />
        </div>
        <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Rolle" />
        <Input value={salesMotion} onChange={(e) => setSalesMotion(e.target.value)} placeholder="Sales Motion" />
        <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" />
        <div className="grid grid-cols-2 gap-3">
          <Input value={minExperience} onChange={(e) => setMinExperience(e.target.value)} placeholder="Min. Jahre" type="number" min={0} />
          <Input value={minDealSize} onChange={(e) => setMinDealSize(e.target.value)} placeholder="Min. Deal Size" type="number" min={0} />
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <Button variant="outline" onClick={exportCandidates}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setSearch('');
            setRole('');
            setSalesMotion('');
            setIndustry('');
            setMinExperience('');
            setMinDealSize('');
          }}
        >
          Filter zurücksetzen
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
      ) : (
        <div className="space-y-2">
          {candidates.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{c.firstName} {c.lastName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{c.email}</span>
                      {c.currentRole && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{c.currentRole}</span>}
                      {c.yearsOfExperience ? <span>{c.yearsOfExperience} Jahre</span> : null}
                      {c.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.openToWork && <Badge variant="success" className="text-xs">Open to Work</Badge>}
                    {c.seniority && <Badge variant="outline" className="text-xs">{c.seniority}</Badge>}
                    {c.averageDealSize ? <Badge variant="secondary" className="text-xs">{c.averageDealSize.toLocaleString('de-DE')} € Deal Size</Badge> : null}
                    {c.visibleToRecruiters ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <Link href={`/dashboard/admin/candidates/${c.id}`} className="inline-flex items-center text-xs font-medium text-primary hover:underline">
                      Details
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
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
