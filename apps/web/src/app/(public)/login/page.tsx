'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { loginWithApple, loginWithEmail, loginWithGoogle, syncCurrentUser } from '@/lib/auth/client';
import { APP_CONFIG, COMPANY_MEMBER_ROLES, COMPANY_MEMBER_ROLE_LABELS, type CompanyMemberRole } from '@/lib/config';
import { Apple, Building2, Chrome, LogIn, AlertCircle, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'company'>('candidate');
  const [companyRole, setCompanyRole] = useState<CompanyMemberRole>(COMPANY_MEMBER_ROLES.OWNER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const syncSocialUser = async (displayName?: string | null) => {
    await syncCurrentUser({
      role,
      companyRole: role === 'company' ? companyRole : undefined,
      displayName: displayName || undefined,
    });
    await refreshUser();
    router.push('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      await syncCurrentUser({
        role,
        companyRole: role === 'company' ? companyRole : undefined,
      });
      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Email login failed:', err);
      if (err?.code === 'auth/invalid-credential') {
        setError('E-Mail oder Passwort ist falsch.');
      } else if (err?.code === 'auth/too-many-requests') {
        setError('Zu viele Anmeldeversuche. Bitte versuche es später erneut.');
      } else {
        setError(typeof err?.message === 'string' ? err.message : 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError('');
    setSocialLoading(provider);
    try {
      const credential = provider === 'google' ? await loginWithGoogle() : await loginWithApple();
      await syncSocialUser(credential.user.displayName);
    } catch (err: any) {
      if (err?.code === 'auth/cancelled-popup-request') {
        return;
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setError('Anmeldung abgebrochen.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Das Login-Popup wurde blockiert. Bitte erlaube Popups für diese Seite.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Diese Domain ist in Firebase Authentication noch nicht freigeschaltet.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setError(`Der ${provider === 'google' ? 'Google' : 'Apple'}-Login ist in Firebase noch nicht aktiviert.`);
      } else if (err?.code === 'auth/network-request-failed') {
        setError('Netzwerkfehler bei der Verbindung zu Firebase.');
      } else {
        console.error(`${provider} login failed:`, err);
        setError(typeof err?.message === 'string' ? err.message : `${provider === 'google' ? 'Google' : 'Apple'}-Login fehlgeschlagen. Bitte versuche es erneut.`);
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
              <label className="text-sm font-medium">Rolle für ersten Social-Login</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${role === 'candidate' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                >
                  <Users className={`h-6 w-6 ${role === 'candidate' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === 'candidate' ? 'text-primary' : ''}`}>Kandidat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('company')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${role === 'company' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                >
                  <Building2 className={`h-6 w-6 ${role === 'company' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === 'company' ? 'text-primary' : ''}`}>Unternehmen</span>
                </button>
              </div>
            </div>
            {role === 'company' && (
              <div className="space-y-2">
                <label htmlFor="company-role" className="text-sm font-medium">Unternehmensrolle</label>
                <select
                  id="company-role"
                  value={companyRole}
                  onChange={(e) => setCompanyRole(e.target.value as CompanyMemberRole)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.values(COMPANY_MEMBER_ROLES).map((value) => (
                    <option key={value} value={value}>
                      {COMPANY_MEMBER_ROLE_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">E-Mail</label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
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
                autoComplete="current-password"
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
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">oder mit</span>
              </div>
            </div>
            <div className="grid w-full gap-2">
              <Button type="button" variant="outline" className="w-full" disabled={socialLoading !== null} onClick={() => handleSocialLogin('google')}>
                <Chrome className="mr-2 h-4 w-4" />
                {socialLoading === 'google' ? 'Google wird geöffnet...' : 'Mit Google anmelden'}
              </Button>
              <Button type="button" variant="outline" className="w-full" disabled={socialLoading !== null} onClick={() => handleSocialLogin('apple')}>
                <Apple className="mr-2 h-4 w-4" />
                {socialLoading === 'apple' ? 'Apple wird geöffnet...' : 'Mit Apple anmelden'}
              </Button>
            </div>
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
