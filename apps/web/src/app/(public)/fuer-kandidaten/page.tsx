import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search, Shield, TrendingUp, ArrowRight, CheckCircle, BarChart3, Star } from 'lucide-react';

export default function FuerKandidatenPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Deine Karriere im<br /><span className="text-primary">Software Sales</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Transparente Gehälter, ehrliche Bewertungen und persönliche Recruiting-Begleitung für deine nächste Sales-Rolle.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/registrieren"><Button size="lg">Kostenlos registrieren <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link href="/jobs"><Button size="lg" variant="outline">Jobs entdecken</Button></Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { icon: Search, title: 'Spezialisierte Jobs', desc: 'Nur Software Sales Rollen im DACH-Raum – von SDR bis VP Sales.' },
            { icon: TrendingUp, title: 'Gehaltsdaten', desc: 'Aktuelle Salary Benchmarks für jede Rolle und Seniority.' },
            { icon: Star, title: 'Unternehmensbewertungen', desc: 'Ehrliche Reviews von Sales-Profis über ihre Arbeitgeber.' },
            { icon: Shield, title: 'Persönliche Begleitung', desc: 'Wir screenen und begleiten dich – kein anonymes Massenrecruiting.' },
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
              { step: '1', title: 'Profil erstellen', desc: 'Registriere dich und erstelle dein Sales-Profil.' },
              { step: '2', title: 'Jobs entdecken', desc: 'Durchsuche spezialisierte Software Sales Positionen.' },
              { step: '3', title: 'Interesse bekunden', desc: 'Zeige Interesse an spannenden Rollen.' },
              { step: '4', title: 'Begleitung erhalten', desc: 'Wir screenen, beraten und begleiten dich bis zum Angebot.' },
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
              'Zugang zu exklusiven Software Sales Positionen im DACH-Raum',
              'Transparente Gehaltsdaten für informierte Entscheidungen',
              'Ehrliche Unternehmensbewertungen von Sales-Profis',
              'Persönliche Begleitung durch den gesamten Bewerbungsprozess',
              'Kein anonymes Bewerben – wir kennen dich und deine Ziele',
              'Kostenlos und unverbindlich',
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
    </>
  );
}
