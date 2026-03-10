'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, Users, Building2, Star, BarChart3, FileText, Settings, Shield,
  TrendingUp, MessageSquare, BookOpen, Mail, Activity, Cog,
} from 'lucide-react';

export default function AdminDashboard() {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0, totalJobs: 0, pendingJobs: 0, totalCompanies: 0,
    totalCandidates: 0, totalApplications: 0, pendingReviews: 0, totalLeads: 0,
  });

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) { const data = await res.json(); setStats(data.data || stats); }
    } catch {}
  };

  const sidebarItems = [
    { href: '/dashboard/admin', label: 'Dashboard', icon: BarChart3, active: true },
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

  if (dbUser?.role !== 'admin') {
    return (
      <div className="container py-16 text-center">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Zugriff verweigert</h1>
        <p className="text-muted-foreground">Du hast keinen Zugriff auf den Admin-Bereich.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="flex items-center gap-2 mb-4 px-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Admin</span>
          </div>
          <nav className="space-y-0.5">
            {sidebarItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${item.active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <item.icon className="h-4 w-4" />{item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Plattform-Übersicht und Verwaltung</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Nutzer', value: stats.totalUsers, icon: Users, color: 'text-blue-600' },
              { label: 'Unternehmen', value: stats.totalCompanies, icon: Building2, color: 'text-green-600' },
              { label: 'Kandidaten', value: stats.totalCandidates, icon: Users, color: 'text-purple-600' },
              { label: 'Jobs (gesamt)', value: stats.totalJobs, icon: Briefcase, color: 'text-yellow-600' },
              { label: 'Jobs (pending)', value: stats.pendingJobs, icon: Briefcase, color: 'text-orange-600' },
              { label: 'Bewerbungen', value: stats.totalApplications, icon: FileText, color: 'text-indigo-600' },
              { label: 'Pending Reviews', value: stats.pendingReviews, icon: Star, color: 'text-red-600' },
              { label: 'Leads', value: stats.totalLeads, icon: Mail, color: 'text-teal-600' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Schnellzugriff</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Link href="/dashboard/admin/jobs"><Button variant="outline" size="sm" className="w-full justify-start"><Briefcase className="mr-2 h-4 w-4" />Jobs verwalten</Button></Link>
                <Link href="/dashboard/admin/applications"><Button variant="outline" size="sm" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" />Bewerbungen</Button></Link>
                <Link href="/dashboard/admin/companies"><Button variant="outline" size="sm" className="w-full justify-start"><Building2 className="mr-2 h-4 w-4" />Unternehmen</Button></Link>
                <Link href="/dashboard/admin/candidates"><Button variant="outline" size="sm" className="w-full justify-start"><Users className="mr-2 h-4 w-4" />Kandidaten</Button></Link>
                <Link href="/dashboard/admin/reviews"><Button variant="outline" size="sm" className="w-full justify-start"><Star className="mr-2 h-4 w-4" />Reviews prüfen</Button></Link>
                <Link href="/dashboard/admin/leads"><Button variant="outline" size="sm" className="w-full justify-start"><Mail className="mr-2 h-4 w-4" />Leads ansehen</Button></Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Agency-Management</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Kandidaten screenen, weiterleiten und Bewerbungsprozesse steuern.</p>
                <div className="space-y-2">
                  <Link href="/dashboard/admin/applications">
                    <Button size="sm" className="w-full">Kandidaten-Pipeline öffnen</Button>
                  </Link>
                  <p className="text-xs text-muted-foreground text-center">Bewerbungen prüfen · Kandidaten weiterleiten · Fit-Score vergeben</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
