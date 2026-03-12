'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/config';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  TrendingUp,
  User,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Upload,
} from 'lucide-react';

const candidateNavItems = [
  { href: '/dashboard/candidate', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/candidate/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/candidate/bewerbungen', label: 'Bewerbungen', icon: FileText },
  { href: '/dashboard/candidate/insights', label: 'Insights', icon: TrendingUp },
  { href: '/dashboard/candidate/profil', label: 'Profil', icon: User },
];

export function CandidateNav() {
  const { dbUser, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dbUser) {
      fetch('/api/notifications')
        .then((r) => r.json())
        .then((d) => {
          setUnreadCount(d.unreadCount || 0);
          setNotifications((d.data || []).slice(0, 5));
        })
        .catch(() => {});
    }
  }, [dbUser]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const profileName = [dbUser?.candidateProfile?.firstName, dbUser?.candidateProfile?.lastName]
    .filter(Boolean)
    .join(' ');
  const displayName = profileName || dbUser?.displayName || dbUser?.email?.split('@')[0] || 'Profil';
  const displayEmail = dbUser?.candidateProfile?.email || dbUser?.email || '';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard/candidate" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">SC</span>
            </div>
            <span className="hidden font-semibold sm:inline-block text-base tracking-tight">
              {APP_CONFIG.name}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {candidateNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  isActive(item.href, item.exact)
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isActive(item.href, item.exact) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full translate-y-[13px]" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-[16px] rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <p className="text-sm font-semibold">Benachrichtigungen</p>
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">{unreadCount} ungelesen</span>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Keine neuen Benachrichtigungen</p>
                    </div>
                  ) : (
                    notifications.map((n: any) => (
                      <div
                        key={n.id}
                        className={cn(
                          'px-4 py-3 border-b last:border-b-0 transition-colors',
                          !n.isRead && 'bg-primary/3'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {!n.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className={cn('text-sm line-clamp-1', !n.isRead ? 'font-medium' : 'text-muted-foreground')}>
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  href="/dashboard/candidate/benachrichtigungen"
                  className="block px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-accent/50 border-t transition-colors"
                  onClick={() => setNotifOpen(false)}
                >
                  Alle anzeigen
                </Link>
              </div>
            )}
          </div>

          {/* User menu */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="hidden md:inline max-w-[100px] truncate">{displayName}</span>
              <ChevronDown className="h-3.5 w-3.5 hidden md:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/candidate/profil"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Profil
                  </Link>
                  <Link
                    href="/dashboard/candidate/dokumente"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    Dokumente
                  </Link>
                  <Link
                    href="/dashboard/candidate/einstellungen"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Einstellungen
                  </Link>
                </div>
                <div className="border-t py-1">
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-0.5">
            {candidateNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.href, item.exact)
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
