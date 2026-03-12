'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/header';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { dbUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isOnboarding = pathname?.startsWith('/dashboard/onboarding');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Wird geladen...</div>
      </div>
    );
  }

  if (!dbUser) {
    router.push('/login');
    return null;
  }

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1 py-8">
        <div className="flex gap-8">
          <DashboardSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
