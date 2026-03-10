import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { APP_CONFIG } from '@/lib/config';
import {
  Target, Shield, ArrowRight, CheckCircle, Zap, UserCheck,
  Monitor, FileText, MessageSquare, Clock,
} from 'lucide-react';

export default function FuerUnternehmenPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Eure nächste Sales-Hire.<br />
            <span className="text-primary">Ohne Vorabkosten. Ohne Kompromisse.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Ich besetze ausschließlich Software-Sales-Rollen – und ich kenne sie aus eigener Erfahrung. Ihr bekommt vorqualifizierte Kandidaten, die ich persönlich geprüft habe. Über eine eigene Plattform, nicht per E-Mail.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/kontakt"><Button size="lg">Unverbindlich sprechen <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link href="/ueber-uns"><Button size="lg" variant="outline">Über mich & den Ansatz</Button></Link>
          </div>
        </div>
      </section>

      {/* Warum */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Warum Unternehmen mit mir arbeiten</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: UserCheck, title: 'Ich kenne die Rollen', desc: 'Ich habe selbst als SDR und AE gearbeitet – in Startups und im Enterprise-Umfeld. Ich beurteile Kandidaten so, wie ein Hiring Manager es tun würde.' },
            { icon: Target, title: 'Nur Software Sales', desc: 'Kein Allround-Recruiting. Ich konzentriere mich ausschließlich auf das, was ich kenne: Software-Sales-Positionen.' },
            { icon: Shield, title: 'Zahlung nur bei Erfolg', desc: 'Keine Vorabkosten, kein Retainer. Ihr zahlt erst, wenn ein Kandidat bei euch anfängt.' },
            { icon: Zap, title: 'Vorqualifiziert, nicht vorsortiert', desc: 'Ihr bekommt keine Stapel an Lebensläufen. Jeder Kandidat kommt mit meiner persönlichen Einschätzung.' },
          ].map((item) => (
            <Card key={item.title} className="border-0 shadow-none bg-muted/50">
              <CardContent className="pt-6">
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Plattform / Cockpit */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Alles gebündelt – euer Recruiting-Cockpit</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Statt endloser Threads und verstreuter Dokumente bekommt ihr eine Plattform, auf der ihr den gesamten Prozess verfolgt.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Monitor, title: 'Dashboard', desc: 'Status aller Kandidaten, nächste Schritte und Zeitplan auf einen Blick.' },
              { icon: FileText, title: 'Kandidaten-Briefings', desc: 'Strukturierte Profile mit meiner Einschätzung – nicht einfach ein weitergeleiteter Lebenslauf.' },
              { icon: MessageSquare, title: 'Kommunikation', desc: 'Feedback und Abstimmungen direkt in der Plattform – ohne den Thread zu suchen.' },
              { icon: Clock, title: 'Überblick', desc: 'Ihr seht jederzeit, wo im Prozess jeder Kandidat steht – ohne nachfragen zu müssen.' },
            ].map((feat) => (
              <div key={feat.title} className="flex gap-4 p-4 rounded-lg bg-background">
                <feat.icon className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ablauf */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Wie eine Zusammenarbeit abläuft</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Klar strukturiert, kein Overhead. Ihr sagt mir, wen ihr sucht – ich kümmere mich um den Rest.</p>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Kennenlernen & Briefing', desc: 'Wir besprechen die Rolle, das Team und was wirklich zählt – fachlich und kulturell.' },
            { step: '02', title: 'Kandidaten-Suche', desc: 'Ich spreche passende Sales-Profile an und prüfe sie persönlich, bevor ich sie vorstelle.' },
            { step: '03', title: 'Vorstellung & Interviews', desc: 'Ihr bekommt vorqualifizierte Kandidaten mit meiner Einschätzung und konkreten Interview-Empfehlungen.' },
            { step: '04', title: 'Begleitung bis zum Start', desc: 'Ich unterstütze bei Verhandlung und Absage-Handling und bleibe auch nach dem Start in Kontakt.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">{item.step}</div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Was ihr bekommt */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8">Was ihr bekommt</h2>
          <div className="space-y-4">
            {[
              'Nur Kandidaten, die ich persönlich geprüft und für passend halte',
              'Zahlung rein erfolgsbasiert – erst bei unterschriebenem Vertrag',
              'Eigene Plattform statt E-Mail-Ping-Pong',
              'Schriftliche Einschätzung zu jedem Kandidaten mit konkreten Stärken und Risiken',
              'Ehrliches Sparring zum Rollenprofil und zu realistischen Markt-Erwartungen',
              'Begleitung über den Hire hinaus – weil gutes Onboarding zum Recruiting gehört',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/kontakt"><Button size="lg">Gespräch vereinbaren <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Eure nächste Sales-Hire beginnt mit einem Gespräch.</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Kein Pitch, kein Vertrag. Erzählt mir von eurer offenen Rolle – ich sage euch ehrlich, ob ich helfen kann.
          </p>
          <Link href="/kontakt">
            <Button size="lg" variant="secondary">
              Jetzt sprechen <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
