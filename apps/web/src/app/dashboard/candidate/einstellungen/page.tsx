'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getIdToken } from '@salescareerhub/auth/client';
import { Settings, Download, Trash2, AlertCircle, CheckCircle, Shield } from 'lucide-react';

export default function CandidateSettingsPage() {
  const { dbUser, logout } = useAuth();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    setExporting(true); setMessage('');
    try {
      const token = await getIdToken();
      const res = await fetch('/api/gdpr/export', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setExportData(data.data);
        // Auto-download as JSON
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `datenexport-${new Date().toISOString().split('T')[0]}.json`;
        a.click(); URL.revokeObjectURL(url);
        setMessage('Datenexport wurde heruntergeladen.');
      }
    } catch { setMessage('Fehler beim Export.'); } finally { setExporting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/gdpr/delete', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        await logout();
        router.push('/?deleted=true');
      } else { setMessage('Fehler bei der Löschung.'); }
    } catch { setMessage('Fehler bei der Löschung.'); } finally { setDeleting(false); }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">Konto- und Datenschutzeinstellungen</p>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-primary/10 text-primary text-sm mb-4">
          <CheckCircle className="h-4 w-4" /> {message}
        </div>
      )}

      {/* Account Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Settings className="h-5 w-5" /> Kontoinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <div><p className="text-sm font-medium">E-Mail</p><p className="text-sm text-muted-foreground">{dbUser?.email}</p></div>
          </div>
          <div className="flex justify-between items-center">
            <div><p className="text-sm font-medium">Rolle</p><p className="text-sm text-muted-foreground capitalize">{dbUser?.role}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* DSGVO Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" /> Datenschutz (DSGVO)</CardTitle>
          <CardDescription>Deine Rechte nach der Datenschutz-Grundverordnung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-sm mb-1">Datenauskunft (Art. 15 DSGVO)</h3>
            <p className="text-xs text-muted-foreground mb-3">Lade eine Kopie aller über dich gespeicherten personenbezogenen Daten herunter.</p>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />{exporting ? 'Wird exportiert...' : 'Daten exportieren'}
            </Button>
          </div>

          <div className="border rounded-lg p-4 border-destructive/30">
            <h3 className="font-medium text-sm mb-1 text-destructive">Konto und Daten löschen (Art. 17 DSGVO)</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Alle deine personenbezogenen Daten werden unwiderruflich gelöscht. Dies umfasst dein Profil, Bewerbungen, gespeicherte Jobs, Bewertungen und hochgeladene Dokumente.
            </p>
            {!confirmDelete ? (
              <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Konto löschen
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten gehen verloren.
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Wird gelöscht...' : 'Endgültig löschen'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Abbrechen</Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung/Vermittlung)</p>
            <p><strong>Speicherdauer:</strong> Bis zur Kontolöschung oder 2 Jahre nach letzter Aktivität</p>
            <p><strong>Kontakt:</strong> datenschutz@salescareerhub.de</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
