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
            Dein nächster Schritt im<br /><span className="text-primary">Software Sales</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Ich bin kein klassischer Recruiter – ich komme selbst aus dem Software-Vertrieb. Deshalb verstehe ich, was du suchst, und verbinde dich mit Unternehmen, die wirklich zu dir passen.
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
            { icon: UserCheck, title: 'Jemand, der deine Rolle kennt', desc: 'Ich habe selbst als SDR und Account Executive gearbeitet. Ich verstehe, worauf es bei einem Wechsel wirklich ankommt.' },
            { icon: Target, title: 'Nur passende Rollen', desc: 'Ich stelle dir nur Positionen vor, die zu deiner Erfahrung und deinen Zielen passen – keine Massenvorschläge.' },
            { icon: Shield, title: 'Vertraulich & persönlich', desc: 'Dein aktueller Arbeitgeber erfährt nichts. Ich lerne dich erst kennen, bevor ich dich irgendwo vorstelle.' },
            { icon: Zap, title: 'Kurze Wege', desc: 'Direkter Draht zum Hiring Manager. Kein wochenlanges Warten auf Feedback oder nächste Schritte.' },
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
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Kein anonymes Bewerben. Ich begleite dich persönlich durch den gesamten Prozess.</p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Profil anlegen', desc: 'Registriere dich und teile mir deine Erfahrung und Ziele mit.' },
              { step: '02', title: 'Persönliches Gespräch', desc: 'Ich lerne dich kennen – deine Stärken, was du suchst und wohin du willst.' },
              { step: '03', title: 'Gezielte Vorstellung', desc: 'Ich stelle dir nur Rollen vor, die wirklich zu deinem Profil und deinen Zielen passen.' },
              { step: '04', title: 'Begleitung bis zum Start', desc: 'Ich bereite dich auf Interviews vor, unterstütze bei der Verhandlung und bleibe auch danach in Kontakt.' },
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
              'Zugang zu Software-Sales-Positionen, die nicht überall ausgeschrieben sind',
              'Beratung durch jemanden, der die Rolle selbst gemacht hat',
              'Persönliche Begleitung durch den gesamten Bewerbungsprozess',
              'Ehrliche Einschätzung zu Rolle, Unternehmen und Gehaltsrahmen',
              'Vertraulich – dein aktueller Arbeitgeber erfährt nichts',
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
          <h2 className="text-3xl font-bold mb-4">Bereit für deinen nächsten Schritt?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Lass uns unverbindlich sprechen – ich sage dir ehrlich, was gerade möglich ist.
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
