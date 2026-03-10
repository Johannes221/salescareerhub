'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { registerWithEmail, getIdToken } from '@salescareerhub/auth/client';
import { APP_CONFIG } from '@salescareerhub/config';
import { UserPlus, AlertCircle, Users, Building2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'company'>('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password);
      const token = await getIdToken();
      if (token) {
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role }),
        });
      }
      router.push('/dashboard');
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setError('Diese E-Mail-Adresse wird bereits verwendet.');
      } else if (err?.code === 'auth/weak-password') {
        setError('Das Passwort ist zu schwach.');
      } else {
        setError('Registrierung fehlgeschlagen. Bitte versuche es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-2">
            <span className="text-lg font-bold text-primary-foreground">SC</span>
          </div>
          <CardTitle className="text-2xl">Registrieren</CardTitle>
          <CardDescription>Erstelle dein kostenloses {APP_CONFIG.name} Konto</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ich bin...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${role === 'candidate' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                >
                  <Users className={`h-6 w-6 ${role === 'candidate' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === 'candidate' ? 'text-primary' : ''}`}>Kandidat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('company')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${role === 'company' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                >
                  <Building2 className={`h-6 w-6 ${role === 'company' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === 'company' ? 'text-primary' : ''}`}>Unternehmen</span>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">E-Mail</label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@beispiel.de" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Passwort</label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mind. 8 Zeichen" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Passwort bestätigen</label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wird registriert...' : 'Kostenlos registrieren'}
              {!loading && <UserPlus className="ml-2 h-4 w-4" />}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Bereits ein Konto?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">Anmelden</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
