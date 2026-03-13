'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { loginWithApple, loginWithEmail, loginWithGoogle, logout, registerWithEmail, syncCurrentUser } from '@/lib/auth/client';
import { APP_CONFIG } from '@/lib/config';
import { Apple, Building2, Chrome, UserPlus, AlertCircle, Users } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'company'>('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const syncUser = async (displayName?: string | null) => {
    await syncCurrentUser({
      role,
      displayName: displayName || undefined,
    });

    await refreshUser();
    router.push('/dashboard');
  };

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
      await syncUser();
    } catch (err: any) {
      await logout().catch(() => undefined);
      if (err?.code === 'auth/email-already-in-use') {
        try {
          await loginWithEmail(email, password);
          await syncUser();
          return;
        } catch (loginErr: any) {
          if (loginErr?.code === 'auth/invalid-credential') {
            setError('Diese E-Mail ist bereits registriert. Bitte melde dich an oder verwende ein anderes Passwort.');
          } else {
            setError('Diese E-Mail ist bereits registriert. Bitte melde dich über die Login-Seite an.');
          }
        }
      } else if (err?.code === 'auth/weak-password') {
        setError('Das Passwort ist zu schwach.');
      } else {
        setError(typeof err?.message === 'string' ? err.message : 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'apple') => {
    setError('');
    setSocialLoading(provider);
    try {
      const credential = provider === 'google' ? await loginWithGoogle() : await loginWithApple();
      await syncUser(credential.user.displayName);
    } catch (err: any) {
      await logout().catch(() => undefined);
      if (err?.code === 'auth/cancelled-popup-request') {
        return;
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setError('Anmeldung abgebrochen.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Diese Domain ist in Firebase Authentication noch nicht freigeschaltet.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setError(`Der ${provider === 'google' ? 'Google' : 'Apple'}-Login ist in Firebase noch nicht aktiviert.`);
      } else {
        console.error(`${provider} registration failed:`, err);
        setError(typeof err?.message === 'string' ? err.message : `${provider === 'google' ? 'Google' : 'Apple'}-Registrierung fehlgeschlagen. Bitte versuche es erneut.`);
      }
    } finally {
      setSocialLoading(null);
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
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@beispiel.de" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Passwort</label>
              <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mind. 8 Zeichen" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Passwort bestätigen</label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wird registriert...' : 'Kostenlos registrieren'}
              {!loading && <UserPlus className="ml-2 h-4 w-4" />}
            </Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">oder mit</span>
              </div>
            </div>
            <div className="grid w-full gap-2">
              <Button type="button" variant="outline" className="w-full" disabled={socialLoading !== null} onClick={() => handleSocialRegister('google')}>
                <Chrome className="mr-2 h-4 w-4" />
                {socialLoading === 'google' ? 'Google wird geöffnet...' : 'Mit Google registrieren'}
              </Button>
              <Button type="button" variant="outline" className="w-full" disabled={socialLoading !== null} onClick={() => handleSocialRegister('apple')}>
                <Apple className="mr-2 h-4 w-4" />
                {socialLoading === 'apple' ? 'Apple wird geöffnet...' : 'Mit Apple registrieren'}
              </Button>
            </div>
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
