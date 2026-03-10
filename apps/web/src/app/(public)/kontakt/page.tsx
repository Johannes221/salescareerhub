'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { APP_CONFIG } from '@salescareerhub/config';
import { Send, CheckCircle } from 'lucide-react';

export default function KontaktPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '', type: 'contact' as string });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setSubmitted(true);
    } catch {} finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="container py-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Nachricht gesendet!</h1>
        <p className="text-muted-foreground">Wir melden uns schnellstmöglich bei dir.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Kontakt</h1>
        <p className="text-muted-foreground">Hast du Fragen? Wir freuen uns auf deine Nachricht.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-Mail *</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unternehmen</label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nachricht *</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wird gesendet...' : 'Nachricht senden'} <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
