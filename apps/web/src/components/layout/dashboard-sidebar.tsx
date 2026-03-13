'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Briefcase, Users, Building2, Star, BarChart3, FileText, Settings, Shield,
  TrendingUp, MessageSquare, BookOpen, Mail, Activity, Cog, Plus,
  Menu, X,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const companyNav: NavItem[] = [
  { href: '/dashboard/company', label: 'Übersicht', icon: BarChart3 },
  { href: '/dashboard/company/jobs', label: 'Jobs verwalten', icon: Briefcase },
  { href: '/dashboard/company/jobs/neu', label: 'Job erstellen', icon: Plus },
  { href: '/dashboard/company/bewerbungen', label: 'Bewerbungen', icon: FileText },
  { href: '/dashboard/company/profil', label: 'Unternehmensprofil', icon: Building2 },
  { href: '/dashboard/company/einstellungen', label: 'Einstellungen', icon: Settings },
];

const adminNav: NavItem[] = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/admin/users', label: 'Nutzer', icon: Users },
  { href: '/dashboard/admin/companies', label: 'Unternehmen', icon: Building2 },
  { href: '/dashboard/admin/candidates', label: 'Kandidaten', icon: Users },
  { href: '/dashboard/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/admin/applications', label: 'Bewerbungen', icon: FileText },
  { href: '/dashboard/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/admin/salary', label: 'Salary Data', icon: TrendingUp },
  { href: '/dashboard/admin/rankings', label: 'Rankings', icon: BarChart3 },
  { href: '/dashboard/admin/content', label: 'Content', icon: BookOpen },
  { href: '/dashboard/admin/leads', label: 'Leads', icon: Mail },
  { href: '/dashboard/admin/logs', label: 'Logs', icon: Activity },
  { href: '/dashboard/admin/settings', label: 'Einstellungen', icon: Cog },
];

export function DashboardSidebar() {
  const { dbUser } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = dbUser?.role === 'admin' ? adminNav : companyNav;

  const roleLabel = dbUser?.role === 'admin' ? 'Admin' : 'Unternehmen';
  const RoleIcon = dbUser?.role === 'admin' ? Shield : Building2;

  const isActive = (href: string) => {
    if (href === `/dashboard/${dbUser?.role}` || href === '/dashboard/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <nav className="space-y-0.5">
      <div className="flex items-center gap-2 mb-4 px-3">
        <RoleIcon className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">{roleLabel}</span>
      </div>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
            isActive(item.href)
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <Button variant="outline" size="sm" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-4 w-4 mr-2" /> : <Menu className="h-4 w-4 mr-2" />}
          Navigation
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden mb-4 p-4 border rounded-lg bg-background">
          {sidebarContent}
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
