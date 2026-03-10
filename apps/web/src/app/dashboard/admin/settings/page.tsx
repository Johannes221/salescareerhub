'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { APP_CONFIG } from '@salescareerhub/config';
import { Cog, Globe, Shield, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  const { dbUser } = useAuth();
  if (dbUser?.role !== 'admin') return null;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">Plattform-Konfiguration</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" /> Plattform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{APP_CONFIG.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">URL</span><span className="font-medium">{APP_CONFIG.url}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Locale</span><span className="font-medium">{APP_CONFIG.locale}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Kontakt</span><span className="font-medium">{APP_CONFIG.contact.email}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" /> DSGVO</CardTitle>
            <CardDescription>Datenschutz-Konfiguration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Audit-Logging</span><span className="font-medium text-green-600">Aktiv</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Datenexport (Art. 15)</span><span className="font-medium text-green-600">Aktiv</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Datenlöschung (Art. 17)</span><span className="font-medium text-green-600">Aktiv</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Consent-Tracking</span><span className="font-medium text-green-600">Aktiv</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5" /> System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Datenbank</span><span className="font-medium">MongoDB (Prisma)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Auth</span><span className="font-medium">Firebase Authentication</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Storage</span><span className="font-medium">Firebase Storage</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Framework</span><span className="font-medium">Next.js 14 (App Router)</span></div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
