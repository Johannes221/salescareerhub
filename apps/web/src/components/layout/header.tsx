'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/lib/config';
import { Bell, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

const publicNav = [
  { href: '/fuer-unternehmen', label: 'Für Unternehmen' },
  { href: '/fuer-kandidaten', label: 'Für Kandidaten' },
  { href: '/ueber-uns', label: 'Über uns' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/kontakt', label: 'Kontakt' },
];

export function Header() {
  const { dbUser, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (dbUser) {
      fetch('/api/notifications').then(r => r.json()).then(d => setUnreadCount(d.unreadCount || 0)).catch(() => {});
    }
  }, [dbUser]);

  const getDashboardLink = () => {
    if (!dbUser) return '/login';
    switch (dbUser.role) {
      case 'admin': return '/dashboard/admin';
      case 'company': return '/dashboard/company';
      case 'candidate': return '/dashboard/candidate';
      default: return '/dashboard';
    }
  };

  const getNotificationLink = () => {
    if (!dbUser) {
      return '/login';
    }

    return `/dashboard/${dbUser.role === 'admin' ? 'admin' : dbUser.role === 'company' ? 'company' : 'candidate'}/benachrichtigungen`;
  };

  const navItems = !dbUser
    ? publicNav
    : dbUser.role === 'admin'
      ? [
        { href: '/dashboard/admin', label: 'Mein Bereich' },
        { href: '/dashboard/admin/users', label: 'Nutzer' },
        { href: '/dashboard/admin/jobs', label: 'Jobs' },
      ]
      : dbUser.role === 'company'
        ? [
          { href: '/dashboard/company', label: 'Mein Bereich' },
          { href: '/dashboard/company/jobs', label: 'Jobs' },
          { href: '/dashboard/company/profil', label: 'Profil' },
        ]
        : [
          { href: '/dashboard/candidate', label: 'Mein Bereich' },
          { href: '/jobs', label: 'Jobs' },
          { href: '/dashboard/candidate/bewerbungen', label: 'Bewerbungen' },
          { href: '/dashboard/candidate/profil', label: 'Profil' },
        ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">SC</span>
            </div>
            <span className="hidden font-bold sm:inline-block text-lg">
              {APP_CONFIG.name}
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : dbUser ? (
            <div className="flex items-center gap-1">
              <Link href={getDashboardLink()}>
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Mein Bereich</span>
                </Button>
              </Link>
              <Link href={getNotificationLink()}>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Abmelden</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Anmelden</Button>
              </Link>
              <Link href="/registrieren">
                <Button size="sm">Registrieren</Button>
              </Link>
            </div>
          )}

          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
