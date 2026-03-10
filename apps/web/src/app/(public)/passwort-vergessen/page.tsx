'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { resetPassword } from '@salescareerhub/auth/client';
import { APP_CONFIG } from '@salescareerhub/config';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') setError('Kein Konto mit dieser E-Mail-Adresse gefunden.');
      else setError('Fehler beim Senden. Bitte versuche es erneut.');
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh] py-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">E-Mail gesendet!</h2>
            <p className="text-muted-foreground mb-4">Wir haben dir einen Link zum Zurücksetzen deines Passworts an <strong>{email}</strong> gesendet.</p>
            <Link href="/login"><Button variant="outline">Zurück zum Login</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-2">
            <Mail className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Passwort vergessen?</CardTitle>
          <CardDescription>Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">E-Mail</label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@beispiel.de" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wird gesendet...' : 'Link senden'}
            </Button>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Zurück zum Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
