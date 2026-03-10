import React from 'react';
import { APP_CONFIG } from '@salescareerhub/config';

export default function DatenschutzPage() {
  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Stand: {new Date().toLocaleDateString('de-DE')}</p>
        <h2 className="text-xl font-semibold text-foreground">1. Verantwortlicher</h2>
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist der Betreiber von {APP_CONFIG.name}.</p>
        <h2 className="text-xl font-semibold text-foreground">2. Erhebung und Speicherung personenbezogener Daten</h2>
        <p>Wir erheben personenbezogene Daten, wenn Sie sich registrieren, ein Profil erstellen, sich auf Jobs bewerben oder unser Kontaktformular nutzen.</p>
        <h2 className="text-xl font-semibold text-foreground">3. Zweck der Datenverarbeitung</h2>
        <p>Ihre Daten werden ausschließlich zur Bereitstellung unserer Plattform-Dienste, zur Vermittlung zwischen Kandidaten und Unternehmen sowie zur Kommunikation mit Ihnen verwendet.</p>
        <h2 className="text-xl font-semibold text-foreground">4. Ihre Rechte</h2>
        <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten. Kontaktieren Sie uns unter {APP_CONFIG.contact.email}.</p>
        <p className="text-xs mt-8">Dies ist ein Platzhalter. Die vollständige Datenschutzerklärung wird vor dem Launch erstellt.</p>
      </div>
    </div>
  );
}
