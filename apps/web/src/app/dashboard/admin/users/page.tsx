'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COMPANY_MEMBER_ROLES, COMPANY_MEMBER_ROLE_LABELS, ROLE_LABELS } from '@/lib/config';
import { formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Users, Search, Shield, Mail, UserCog, Ban, CheckCircle } from 'lucide-react';

const ROLES = ['admin', 'company', 'candidate', 'recruiter'] as const;
const COMPANY_ROLES = Object.values(COMPANY_MEMBER_ROLES) as string[];

export default function AdminUsersPage() {
  const { dbUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        setCompanies(data.meta?.companies || []);
      }
    } catch {} finally { setLoading(false); }
  };

  const updateUser = async (id: string, updates: Record<string, any>) => {
    try {
      const token = await getIdToken();
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, ...updates }),
      });
      await fetchUsers();
    } catch {}
  };

  const filtered = users.filter((u: any) =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  if (dbUser?.role !== 'admin') return null;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Nutzerverwaltung</h1>
          <p className="text-muted-foreground">{users.length} Nutzer registriert</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nutzer suchen..." className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user: any) => (
            <Card key={user.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${user.isActive ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                      <Users className={`h-4 w-4 ${user.isActive ? 'text-primary' : 'text-destructive'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.displayName || user.email}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />{user.email} · {formatRelativeDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => updateUser(user.id, { role: e.target.value })}
                      disabled={user.id === dbUser?.id}
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                    {user.role === 'company' && (
                      <>
                        <select
                          value={user.managedCompanyId || user.company?.id || ''}
                          onChange={(e) => updateUser(user.id, { managedCompanyId: e.target.value })}
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                        >
                          <option value="">Eigene Company</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={user.companyRole || COMPANY_MEMBER_ROLES.OWNER}
                          onChange={(e) => updateUser(user.id, { companyRole: e.target.value })}
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                        >
                          {COMPANY_ROLES.map((value) => (
                            <option key={value} value={value}>
                              {COMPANY_MEMBER_ROLE_LABELS[value as keyof typeof COMPANY_MEMBER_ROLE_LABELS]}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                      disabled={user.id === dbUser?.id}
                      title={user.isActive ? 'Deaktivieren' : 'Aktivieren'}
                    >
                      {user.isActive
                        ? <Ban className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        : <CheckCircle className="h-4 w-4 text-muted-foreground hover:text-green-600" />
                      }
                    </Button>
                    {!user.isActive && <Badge variant="destructive">Inaktiv</Badge>}
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
