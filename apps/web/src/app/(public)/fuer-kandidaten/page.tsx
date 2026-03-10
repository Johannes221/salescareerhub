import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, Shield, TrendingUp, ArrowRight, CheckCircle, Target, Zap } from 'lucide-react';

export default function FuerKandidatenPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Dein nächster Karriereschritt im<br /><span className="text-primary">SaaS Sales</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Wir sind keine klassischen Recruiter – wir kommen selbst aus dem SaaS-Vertrieb. Deshalb verstehen wir, was du suchst, und verbinden dich mit den besten Unternehmen.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/registrieren"><Button size="lg">Kostenlos registrieren <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link href="/jobs"><Button size="lg" variant="outline">Offene Positionen</Button></Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { icon: UserCheck, title: 'Berater aus der Praxis', desc: 'Dein Ansprechpartner hat selbst als SDR, AE oder im Revenue-Bereich gearbeitet – kein generischer Recruiter.' },
            { icon: Target, title: 'Passende Rollen', desc: 'Wir kennen die SaaS-GTM-Welt und matchen dich nur mit Positionen, die wirklich zu dir passen.' },
            { icon: Shield, title: 'Vertraulich & persönlich', desc: 'Kein anonymes Massenrecruiting. Wir lernen dich kennen und begleiten dich individuell.' },
            { icon: Zap, title: 'Schneller Prozess', desc: 'Kurze Wege, direkter Kontakt zum Hiring Manager. Kein wochenlanges Warten.' },
          ].map((item) => (
            <Card key={item.title} className="border-0 shadow-none bg-muted/50">
              <CardContent className="pt-6 text-center">
                <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">So funktioniert es</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Kein anonymes Bewerben. Wir begleiten dich persönlich.</p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Profil erstellen', desc: 'Registriere dich und teile uns deine Erfahrung und Ziele mit.' },
              { step: '02', title: 'Persönliches Gespräch', desc: 'Wir lernen dich kennen – deine Stärken, Wünsche und Karriereziele.' },
              { step: '03', title: 'Passende Rollen', desc: 'Wir stellen dir gezielt Positionen vor, die wirklich zu dir passen.' },
              { step: '04', title: 'Interview-Begleitung', desc: 'Wir bereiten dich vor, begleiten den Prozess und verhandeln mit dir.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Was du bekommst</h2>
          <div className="space-y-4">
            {[
              'Zugang zu exklusiven SaaS-GTM-Positionen – von SDR bis CRO',
              'Beratung durch ehemalige SaaS-Sales-Profis, die deine Welt kennen',
              'Persönliche Begleitung durch den gesamten Bewerbungsprozess',
              'Ehrliche Einschätzung zu Rollen, Unternehmen und Gehaltsrahmen',
              'Vertrauliche Behandlung – dein aktueller Arbeitgeber erfährt nichts',
              'Komplett kostenlos und unverbindlich für dich',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/registrieren"><Button size="lg">Jetzt kostenlos registrieren</Button></Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit für deinen nächsten Karriereschritt?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Lass dich von echten SaaS-Profis beraten – kostenlos und vertraulich.
          </p>
          <Link href="/registrieren">
            <Button size="lg" variant="secondary">
              Jetzt registrieren <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
