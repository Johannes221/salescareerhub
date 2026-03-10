import React from 'react';
import { APP_CONFIG } from '@salescareerhub/config';

export default function ImpressumPage() {
  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Impressum</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Angaben gemäß § 5 TMG</h2>
        <p>{APP_CONFIG.name}<br />Musterstraße 1<br />10115 Berlin</p>
        <h2 className="text-xl font-semibold text-foreground">Kontakt</h2>
        <p>E-Mail: {APP_CONFIG.contact.email}</p>
        <h2 className="text-xl font-semibold text-foreground">Haftungsausschluss</h2>
        <p>Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
        <p className="text-xs mt-8">Dies ist ein Platzhalter. Das vollständige Impressum wird vor dem Launch erstellt.</p>
      </div>
    </div>
  );
}
