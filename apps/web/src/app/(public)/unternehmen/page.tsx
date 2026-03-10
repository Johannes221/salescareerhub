'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, Shield, Star, Search, MapPin } from 'lucide-react';

export default function UnternehmenPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data.data || []);
    } catch {} finally { setLoading(false); }
  };

  const filtered = companies.filter((c: any) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Unternehmen</h1>
        <p className="text-muted-foreground">Software Sales Arbeitgeber im DACH-Raum</p>
      </div>
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Unternehmen suchen..." className="pl-9" />
      </div>
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
