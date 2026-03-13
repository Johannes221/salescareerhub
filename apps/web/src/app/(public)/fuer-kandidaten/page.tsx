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
            Dein Einstieg oder nächster Schritt im<br /><span className="text-primary">Software Sales</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Ob du bereits im Vertrieb arbeitest oder erst in Software Sales einsteigen willst: Ich begleite dich persönlich zu Rollen, die zu deinem Profil passen. Für dich kostenlos – im Erfolgsfall zahlt das einstellende Unternehmen.
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
            { icon: UserCheck, title: 'Auch für Einsteiger & Quereinsteiger', desc: 'Du musst nicht schon im Software Sales gearbeitet haben. Motivation, Kommunikation und Lernbereitschaft zählen genauso.' },
            { icon: Target, title: 'Nur passende Rollen', desc: 'Ich gleiche nicht nur Titel ab, sondern schaue auf dein Profil, deine Stärken und dein Entwicklungspotenzial.' },
            { icon: Shield, title: 'Vertraulich & persönlich', desc: 'Dein aktueller Arbeitgeber erfährt nichts. Ich lerne dich erst kennen, bevor ich dich irgendwo vorstelle.' },
            { icon: Zap, title: 'Kostenlos für dich', desc: 'Für Bewerber entstehen keine Vorabkosten. Die Zusammenarbeit wird erst im Erfolgsfall vom Unternehmen vergütet.' },
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
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Kein Massenbewerben. Wir schauen zuerst, wo du stehst – vom Quereinstieg bis zum nächsten Karriereschritt.</p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Profil anlegen', desc: 'Teile mir deine Erfahrung, Stärken und Ziele mit – auch wenn du noch keine direkte Sales-Erfahrung hast.' },
              { step: '02', title: 'Persönliches Gespräch', desc: 'Ich lerne dich kennen – deine Stärken, was du suchst und wohin du willst.' },
              { step: '03', title: 'Gezielte Vorstellung', desc: 'Du wirst nur für Rollen vorgestellt, die zu deinem Level, deiner Motivation und deinem Entwicklungspfad passen.' },
              { step: '04', title: 'Begleitung bis zum Start', desc: 'Ich unterstütze dich bei Interviews, Feedback und Verhandlung und bleibe bis zum Einstieg an deiner Seite.' },
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
              'Orientierung für Einstieg, Quereinstieg oder den nächsten Karriereschritt im Software Sales',
              'Zugang zu Software-Sales-Positionen, die nicht überall ausgeschrieben sind',
              'Beratung durch jemanden, der die Rolle selbst gemacht hat',
              'Persönliche Begleitung durch den gesamten Bewerbungsprozess',
              'Ehrliche Einschätzung zu Rolle, Unternehmen und Gehaltsrahmen',
              'Vertraulich – dein aktueller Arbeitgeber erfährt nichts',
              'Kostenlos für dich – das Unternehmen zahlt nur im Erfolgsfall',
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
          <h2 className="text-3xl font-bold mb-4">Bereit für Einstieg oder Wechsel?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Lass uns unverbindlich sprechen – ich sage dir ehrlich, welche Rollen gerade zu deinem Profil und deinem Level passen.
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
