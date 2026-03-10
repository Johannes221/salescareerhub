import React from 'react';
import Link from 'next/link';
import { APP_CONFIG } from '@salescareerhub/config';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Für Kandidaten</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs" className="hover:text-foreground transition-colors">Jobs durchsuchen</Link></li>
              <li><Link href="/gehaelter" className="hover:text-foreground transition-colors">Gehaltsübersicht</Link></li>
              <li><Link href="/rankings" className="hover:text-foreground transition-colors">Unternehmens-Rankings</Link></li>
              <li><Link href="/guides" className="hover:text-foreground transition-colors">Karriere-Guides</Link></li>
              <li><Link href="/registrieren" className="hover:text-foreground transition-colors">Kostenlos registrieren</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Für Unternehmen</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/fuer-unternehmen" className="hover:text-foreground transition-colors">Kostenlos Job listen</Link></li>
              <li><Link href="/fuer-unternehmen" className="hover:text-foreground transition-colors">Recruiting-Service</Link></li>
              <li><Link href="/kontakt" className="hover:text-foreground transition-colors">Kontakt aufnehmen</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Plattform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/ueber-uns" className="hover:text-foreground transition-colors">Über uns</Link></li>
              <li><Link href="/kontakt" className="hover:text-foreground transition-colors">Kontakt</Link></li>
              <li><Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link></li>
              <li><Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">{APP_CONFIG.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Die spezialisierte Plattform für Software Sales Karrieren im DACH-Raum.
            </p>
            <p className="text-sm text-muted-foreground">
              {APP_CONFIG.contact.email}
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
            <Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
