'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardRedirect() {
  const { dbUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!dbUser) { router.push('/login'); return; }
    if (!dbUser.onboardingCompleted && dbUser.role !== 'admin') {
      router.push('/dashboard/onboarding');
      return;
    }
    switch (dbUser.role) {
      case 'admin': router.push('/dashboard/admin'); break;
      case 'company': router.push('/dashboard/company'); break;
      case 'candidate': router.push('/dashboard/candidate'); break;
      default: router.push('/login');
    }
  }, [dbUser, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-muted-foreground">Wird geladen...</div>
    </div>
  );
}
