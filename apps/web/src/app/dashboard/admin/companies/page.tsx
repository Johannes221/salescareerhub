'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRelativeDate } from '@salescareerhub/utils';
import { getIdToken } from '@salescareerhub/auth/client';
import { Building2, Search, Shield, CheckCircle, XCircle, Star, MapPin } from 'lucide-react';

export default function AdminCompaniesPage() {
  const { dbUser } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/companies', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setCompanies(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const toggleVerified = async (id: string, isVerified: boolean) => {
    try {
      const token = await getIdToken();
      await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, isVerified: !isVerified }),
      });
      await fetchCompanies();
    } catch {}
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const token = await getIdToken();
      await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, isFeatured: !isFeatured }),
      });
      await fetchCompanies();
    } catch {}
  };

  const filtered = companies.filter((c: any) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (dbUser?.role !== 'admin') return null;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Unternehmen verwalten</h1>
        <p className="text-muted-foreground">{companies.length} Unternehmen registriert</p>
      </div>
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Unternehmen suchen..." className="pl-9" />
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((company: any) => (
            <Card key={company.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{company.name}</p>
                        {company.isVerified && <Shield className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {company.industry && <span>{company.industry}</span>}
                        {company.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.city}</span>}
                        <span>{formatRelativeDate(company.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {company.isFeatured && <Badge>Featured</Badge>}
                    <Button size="sm" variant="outline" onClick={() => toggleVerified(company.id, company.isVerified)}>
                      {company.isVerified ? <XCircle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                      {company.isVerified ? 'Unverifiziert' : 'Verifizieren'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleFeatured(company.id, company.isFeatured)}>
                      <Star className={`h-4 w-4 ${company.isFeatured ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                    </Button>
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
