'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Activity, Shield } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
  interest_expressed: 'Interesse bekundet',
  data_processing: 'Datenverarbeitung (DSGVO)',
  application_updated: 'Bewerbung aktualisiert',
  profile_updated: 'Profil aktualisiert',
  company_profile_updated: 'Unternehmensprofil aktualisiert',
  job_created: 'Job erstellt',
  admin_job_updated: 'Job (Admin) aktualisiert',
  review_approved: 'Review genehmigt',
  review_rejected: 'Review abgelehnt',
  gdpr_data_export: 'DSGVO Datenexport',
  gdpr_data_deletion_requested: 'DSGVO Löschung angefordert',
  gdpr_data_deletion_completed: 'DSGVO Löschung abgeschlossen',
  document_uploaded: 'Dokument hochgeladen',
  document_deleted: 'Dokument gelöscht',
};

export default function AdminLogsPage() {
  const { dbUser } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setLogs(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  if (dbUser?.role !== 'admin') return null;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Alle Aktionen und Datenverarbeitungen auf der Plattform</p>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(10)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
      ) : logs.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Keine Logs vorhanden</h3>
        </CardContent></Card>
      ) : (
        <div className="space-y-1">
          {logs.map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 py-2 px-3 rounded hover:bg-muted/50 text-sm border-b last:border-0">
              <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${log.action.startsWith('gdpr') ? 'bg-blue-500' : log.action.includes('delete') ? 'bg-red-500' : 'bg-green-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{ACTION_LABELS[log.action] || log.action}</span>
                  <Badge variant="outline" className="text-xs">{log.entity}</Badge>
                  {log.action.startsWith('gdpr') && <Shield className="h-3 w-3 text-blue-500" />}
                </div>
                {log.details && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{log.details}</p>}
              </div>
              <div className="text-xs text-muted-foreground shrink-0 text-right">
                <p>{formatRelativeDate(log.createdAt)}</p>
                {log.user?.email && <p className="text-xs">{log.user.email}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
