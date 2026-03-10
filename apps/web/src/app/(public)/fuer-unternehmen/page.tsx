import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { APP_CONFIG } from '@salescareerhub/config';
import {
  Target, Shield, ArrowRight, CheckCircle, Zap, UserCheck,
  Monitor, FileText, MessageSquare, Clock,
} from 'lucide-react';

export default function FuerUnternehmenPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Euer nächster Top-Hire.<br />
            <span className="text-primary">Ohne Risiko. Ohne Retainer.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Wir sind ehemalige SaaS-Operator und besetzen eure GTM-Rollen mit geprüften Kandidaten – erfolgsbasiert, über unsere Plattform, in wenigen Tagen.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/kontakt"><Button size="lg">Gespräch vereinbaren <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link href="/ueber-uns"><Button size="lg" variant="outline">Warum wir?</Button></Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Warum SaaS-Teams mit uns arbeiten</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: UserCheck, title: 'Aus der Praxis', desc: 'Wir haben selbst als SDR, AE und im Revenue-Bereich gearbeitet. Wir bewerten Kandidaten, wie ein Hiring Manager es tut.' },
            { icon: Target, title: 'Nur SaaS-GTM', desc: 'Sales, CS, Marketing & RevOps – kein General Recruiting. Wir kennen jede Rolle, die wir besetzen.' },
            { icon: Shield, title: 'Erfolgsbasiert', desc: 'Kein Retainer, keine Vorabkosten. Ihr zahlt ausschließlich bei erfolgreichem Hire.' },
            { icon: Zap, title: 'Shortlist in Tagen', desc: 'Erste qualifizierte Profile innerhalb von 7–10 Tagen. Keine langen Suchphasen.' },
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

      {/* Platform / Cockpit */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Euer Recruiting-Cockpit</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kein E-Mail-Chaos, kein Papierkram. Verfolgt den gesamten Prozess auf unserer Plattform in Echtzeit.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Monitor, title: 'Live-Dashboard', desc: 'Alle Kandidaten, Status-Updates und Bewertungen auf einen Blick.' },
              { icon: FileText, title: 'Kandidaten-Briefings', desc: 'Strukturierte Profile mit unserer Einschätzung – kein Lebenslauf-Raten.' },
              { icon: MessageSquare, title: 'Direkter Austausch', desc: 'Feedback, Rollen-Sparring und Kommunikation an einem Ort.' },
              { icon: Clock, title: 'Echtzeit-Tracking', desc: 'Seht jederzeit, wo jeder Kandidat im Prozess steht.' },
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

      {/* Process */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-4">So funktioniert es</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Von der Bedarfsanalyse bis zur Einstellung – in vier klaren Schritten.</p>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Rollenbriefing', desc: 'Gemeinsame Schärfung des Rollenprofils und der Interview-Kriterien.' },
            { step: '02', title: 'Gezielte Ansprache', desc: 'Wir identifizieren passende Kandidat:innen aus unserem Netzwerk.' },
            { step: '03', title: 'Evaluierung & Interviews', desc: 'Vorauswahl, Briefings und aktive Unterstützung bei euren Interviews.' },
            { step: '04', title: 'Onboarding-Support', desc: 'Auch nach der Einstellung: Nachbetreuung und Marktfeedback.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">{item.step}</div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8">Was ihr bekommt</h2>
          <div className="space-y-4">
            {[
              'Nur geprüfte, persönlich bewertete Kandidaten – keine CV-Flut',
              'Erfolgsbasiert: Zahlung ausschließlich bei Hire',
              'Eigenes Cockpit mit Echtzeit-Überblick statt E-Mail-Chaos',
              'Strukturierte Kandidaten-Briefings mit unserer Einschätzung',
              'Rollen-Sparring und Markt-Insights vor der Suche',
              'Nachbetreuung auch nach der Einstellung',
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
          <h2 className="text-3xl font-bold mb-4">Bereit, euer Revenue Team aufzubauen?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Kein Risiko, keine Vorabkosten. Erzählt uns von eurer offenen Rolle.
          </p>
          <Link href="/kontakt">
            <Button size="lg" variant="secondary">
              Jetzt starten <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
