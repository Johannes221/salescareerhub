'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@salescareerhub/utils';
import { validateFile } from '@/lib/gdpr';
import { getIdToken } from '@salescareerhub/auth/client';
import { FileText, Upload, Trash2, AlertCircle, CheckCircle, Shield } from 'lucide-react';

export default function CandidateDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/upload', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setDocuments(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(''); setSuccess('');

    const validation = validateFile(file, 'CV');
    if (!validation.valid) { setError(validation.error || 'Ungültige Datei'); return; }

    setUploading(true);
    try {
      // TODO: Upload to Firebase Storage first, get URL
      // For now, create a placeholder URL
      const fileUrl = `https://storage.placeholder.com/${Date.now()}-${file.name}`;

      const token = await getIdToken();
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl,
          fileType: file.type,
          fileSizeKb: Math.round(file.size / 1024),
          category: 'cv',
        }),
      });

      if (res.ok) {
        setSuccess('Dokument wurde hochgeladen');
        await fetchDocuments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Upload fehlgeschlagen');
      }
    } catch { setError('Upload fehlgeschlagen'); } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const token = await getIdToken();
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documentId }),
      });
      setDocuments(documents.filter((d: any) => d.id !== documentId));
      setSuccess('Dokument gelöscht');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Löschen fehlgeschlagen'); }
  };

  const CATEGORY_LABELS: Record<string, string> = { cv: 'Lebenslauf', cover_letter: 'Anschreiben', other: 'Sonstiges' };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dokumente</h1>
        <p className="text-muted-foreground">Lebenslauf und weitere Bewerbungsunterlagen verwalten</p>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4"><AlertCircle className="h-4 w-4" />{error}</div>}
      {success && <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-800 text-sm mb-4"><CheckCircle className="h-4 w-4" />{success}</div>}

      {/* Upload */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Upload className="h-5 w-5" />Dokument hochladen</CardTitle>
          <CardDescription>Nur PDF-Dateien, max. 10 MB</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">PDF-Datei hierher ziehen oder klicken zum Auswählen</p>
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleUpload} className="hidden" id="file-upload" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Wird hochgeladen...' : 'Datei auswählen'}
            </Button>
          </div>
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 mt-0.5 shrink-0 text-blue-500" />
            <span>Deine Dokumente werden gemäß DSGVO (Art. 6 Abs. 1 lit. b) verarbeitet und sicher gespeichert. Du kannst sie jederzeit löschen.</span>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hochgeladene Dokumente</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded" />)}</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Noch keine Dokumente hochgeladen.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{doc.fileName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[doc.category] || doc.category}</Badge>
                        <span>{doc.fileSizeKb ? `${Math.round(doc.fileSizeKb / 1024 * 10) / 10} MB` : ''}</span>
                        <span>{formatRelativeDate(doc.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
