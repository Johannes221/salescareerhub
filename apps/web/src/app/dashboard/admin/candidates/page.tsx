'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatRelativeDate } from '@salescareerhub/utils';
import { getIdToken } from '@salescareerhub/auth/client';
import { Users, Search, MapPin, Briefcase, Eye, EyeOff } from 'lucide-react';

export default function AdminCandidatesPage() {
  const { dbUser } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/candidates', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setCandidates(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const filtered = candidates.filter((c: any) =>
    !search || `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (dbUser?.role !== 'admin') return null;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kandidaten</h1>
        <p className="text-muted-foreground">{candidates.length} Kandidatenprofile</p>
      </div>
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kandidat suchen..." className="pl-9" />
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{c.firstName} {c.lastName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{c.email}</span>
                      {c.currentRole && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{c.currentRole}</span>}
                      {c.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.openToWork && <Badge variant="success" className="text-xs">Open to Work</Badge>}
                    {c.seniority && <Badge variant="outline" className="text-xs">{c.seniority}</Badge>}
                    {c.visibleToRecruiters ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
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
