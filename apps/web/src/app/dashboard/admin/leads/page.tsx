'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Mail, Building2, Users, MessageSquare } from 'lucide-react';

const LEAD_TYPE_LABELS: Record<string, string> = {
  company_listing: 'Job-Listung', talent_network: 'Talent-Netzwerk', contact: 'Kontakt',
};
const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'Neu', contacted: 'Kontaktiert', converted: 'Konvertiert', archived: 'Archiviert',
};

export default function AdminLeadsPage() {
  const { dbUser } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/leads', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setLeads(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const updateLead = async (id: string, status: string) => {
    try {
      const token = await getIdToken();
      await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      await fetchLeads();
    } catch {}
  };

  if (dbUser?.role !== 'admin') return null;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-muted-foreground">Kontaktanfragen und Lead-Eingänge verwalten</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : leads.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Keine Leads vorhanden</h3>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead: any) => (
            <Card key={lead.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{lead.name}</h3>
                      <Badge variant="outline">{LEAD_TYPE_LABELS[lead.type] || lead.type}</Badge>
                      <Badge variant={lead.status === 'new' ? 'default' : lead.status === 'contacted' ? 'secondary' : lead.status === 'converted' ? 'success' : 'outline'}>
                        {LEAD_STATUS_LABELS[lead.status] || lead.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p>{lead.email}{lead.phone ? ` · ${lead.phone}` : ''}</p>
                      {lead.company && <p className="flex items-center gap-1"><Building2 className="h-3 w-3" />{lead.company}</p>}
                      {lead.message && <p className="flex items-start gap-1 mt-1"><MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />{lead.message}</p>}
                      <p className="text-xs">{formatRelativeDate(lead.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {lead.status === 'new' && (
                      <Button size="sm" variant="outline" onClick={() => updateLead(lead.id, 'contacted')}>Kontaktiert</Button>
                    )}
                    {lead.status === 'contacted' && (
                      <Button size="sm" variant="outline" onClick={() => updateLead(lead.id, 'converted')}>Konvertiert</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => updateLead(lead.id, 'archived')}>Archivieren</Button>
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
