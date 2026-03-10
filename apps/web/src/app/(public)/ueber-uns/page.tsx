import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@salescareerhub/config';
import { Target, Users, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function UeberUnsPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Über {APP_CONFIG.name}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Wir sind die spezialisierte Plattform für Software Sales Karrieren im DACH-Raum. Mehr Transparenz, bessere Matches, persönliche Begleitung.
        </p>
      </div>

      <div className="prose prose-lg max-w-none mb-12">
        <h2 className="text-2xl font-bold">Unsere Mission</h2>
        <p className="text-muted-foreground">
          Der Software Sales Markt im DACH-Raum ist intransparent. Gehaltsinformationen sind schwer zugänglich, Unternehmensbewertungen aus Sales-Perspektive existieren kaum, und die meisten Jobbörsen behandeln Sales als Nebenkategorie. Das ändern wir.
        </p>
        <p className="text-muted-foreground">
          {APP_CONFIG.name} verbindet Career Intelligence mit persönlichem Recruiting. Wir glauben, dass bessere Informationen zu besseren Karriereentscheidungen führen – für Kandidaten und Unternehmen.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {[
          { icon: Target, title: 'Spezialisierung', desc: 'Wir konzentrieren uns ausschließlich auf Software Sales im DACH-Raum. Das macht uns besser als jede generische Jobbörse.' },
          { icon: Shield, title: 'Transparenz', desc: 'Gehaltsdaten, Unternehmensbewertungen und ehrliche Insights – für informierte Karriereentscheidungen.' },
          { icon: Users, title: 'Persönlich', desc: 'Kein anonymes Massenrecruiting. Wir kennen unsere Kandidaten und begleiten sie persönlich.' },
          { icon: TrendingUp, title: 'Datengetrieben', desc: 'Rankings, Salary Insights und Marktdaten helfen bei der richtigen Entscheidung.' },
        ].map((item) => (
          <div key={item.title} className="flex gap-4">
            <item.icon className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Bereit loszulegen?</h2>
        <p className="text-muted-foreground mb-6">Egal ob Kandidat oder Unternehmen – der Start ist kostenlos.</p>
        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Link href="/registrieren"><Button size="lg">Kostenlos registrieren <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          <Link href="/kontakt"><Button size="lg" variant="outline">Kontakt aufnehmen</Button></Link>
        </div>
      </div>
    </div>
  );
}
