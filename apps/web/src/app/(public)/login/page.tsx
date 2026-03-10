'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { loginWithEmail } from '@salescareerhub/auth/client';
import { APP_CONFIG } from '@salescareerhub/config';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential') {
        setError('E-Mail oder Passwort ist falsch.');
      } else if (err?.code === 'auth/too-many-requests') {
        setError('Zu viele Anmeldeversuche. Bitte versuche es später erneut.');
      } else {
        setError('Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
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
          <CardTitle className="text-2xl">Anmelden</CardTitle>
          <CardDescription>Melde dich bei {APP_CONFIG.name} an</CardDescription>
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
              <label htmlFor="email" className="text-sm font-medium">E-Mail</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@beispiel.de"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Passwort</label>
                <Link href="/passwort-vergessen" className="text-sm text-primary hover:underline">
                  Vergessen?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
              {!loading && <LogIn className="ml-2 h-4 w-4" />}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Noch kein Konto?{' '}
              <Link href="/registrieren" className="text-primary hover:underline font-medium">
                Jetzt registrieren
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
