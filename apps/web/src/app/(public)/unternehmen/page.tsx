'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { COUNTRIES, COMPANY_SIZES, FUNDING_STAGES, FUNDING_STAGE_LABELS } from '@salescareerhub/config';
import { Building2, Shield, Star, Search, MapPin, Filter, X } from 'lucide-react';

export default function UnternehmenPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ country: '', employeeCount: '', fundingStage: '', verifiedOnly: false });

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data.data || []);
    } catch {} finally { setLoading(false); }
  };

  const filtered = companies.filter((c: any) => {
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) && !c.industry?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.country && c.country !== filters.country) return false;
    if (filters.employeeCount && c.employeeCount !== filters.employeeCount) return false;
    if (filters.fundingStage && c.fundingStage !== filters.fundingStage) return false;
    if (filters.verifiedOnly && !c.isVerified) return false;
    return true;
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Unternehmen</h1>
        <p className="text-muted-foreground">Software Sales Arbeitgeber im DACH-Raum</p>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Unternehmen suchen..." className="pl-9" />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />Filter
        </Button>
      </div>
      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/50 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Land</label>
            <select value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="w-full h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">Alle</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Größe</label>
            <select value={filters.employeeCount} onChange={(e) => setFilters({ ...filters, employeeCount: e.target.value })}
              className="w-full h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">Alle</option>
              {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} MA</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Funding</label>
            <select value={filters.fundingStage} onChange={(e) => setFilters({ ...filters, fundingStage: e.target.value })}
              className="w-full h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">Alle</option>
              {FUNDING_STAGES.map((f) => <option key={f} value={f}>{FUNDING_STAGE_LABELS[f]}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={filters.verifiedOnly} onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })} className="rounded" />
              Nur Verifizierte
            </label>
          </div>
          <div className="col-span-full">
            <Button variant="ghost" size="sm" onClick={() => setFilters({ country: '', employeeCount: '', fundingStage: '', verifiedOnly: false })}>
              <X className="h-4 w-4 mr-1" /> Filter zurücksetzen
            </Button>
          </div>
        </div>
      )}
      <p className="text-sm text-muted-foreground mb-4">{filtered.length} Unternehmen</p>
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Unternehmen gefunden</h3>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company: any) => (
            <Link key={company.id} href={`/unternehmen/${company.slug}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{company.name}</h3>
                        {company.isVerified && <Shield className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{company.industry}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {company.city && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{company.city}, {company.country}</span>}
                    {company.employeeCount && <Badge variant="outline" className="text-xs">{company.employeeCount} MA</Badge>}
                    {company.isFeatured && <Badge className="text-xs">Featured</Badge>}
                  </div>
                  {company.description && <p className="text-sm text-muted-foreground line-clamp-2">{company.description}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
