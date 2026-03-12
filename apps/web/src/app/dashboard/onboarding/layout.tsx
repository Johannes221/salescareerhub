'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { dbUser, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-muted-foreground">Wird geladen...</div>
      </div>
    );
  }

  if (!dbUser) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Minimal top bar */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">SC</span>
            </div>
            <span className="text-sm font-semibold text-foreground">SalesCareerHub</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-gray-100 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
