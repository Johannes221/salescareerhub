import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { APP_CONFIG } from '@salescareerhub/config';
import { Building2, Users, Target, Shield, ArrowRight, CheckCircle, Zap } from 'lucide-react';

export default function FuerUnternehmenPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Software Sales Positionen<br />
            <span className="text-primary">kostenlos listen</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Erreichen Sie qualifizierte Sales-Kandidaten im DACH-Raum. Kostenlose Job-Listung, optionale Recruiting-Begleitung.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/registrieren"><Button size="lg">Jetzt kostenlos starten <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link href="/kontakt"><Button size="lg" variant="outline">Recruiting-Beratung anfragen</Button></Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Warum {APP_CONFIG.name}?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: 'Spezialisiert auf Sales', desc: 'Keine generische Jobbörse. Wir sprechen ausschließlich Software Sales Kandidaten an – SDR bis VP Sales.' },
            { icon: Shield, title: 'Qualität statt Masse', desc: 'Wir screenen alle Kandidaten, bevor sie weitergeleitet werden. Sie erhalten nur passende, qualifizierte Profile.' },
            { icon: Zap, title: 'Kostenlos starten', desc: 'Job-Listung ist kostenlos. Zahlen Sie nur für Premium-Features oder unseren White-Glove Recruiting-Service.' },
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

      <section className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">So funktioniert es</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">In drei einfachen Schritten zu qualifizierten Sales-Kandidaten.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: '1', title: 'Registrieren', desc: 'Erstellen Sie Ihr Unternehmensprofil in wenigen Minuten.' },
              { step: '2', title: 'Job veröffentlichen', desc: 'Beschreiben Sie Ihre Sales-Position – wir prüfen und schalten frei.' },
              { step: '3', title: 'Kandidaten erhalten', desc: 'Wir screenen und empfehlen passende Kandidaten direkt an Sie.' },
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
          <h2 className="text-3xl font-bold text-center mb-8">Was Sie bekommen</h2>
          <div className="space-y-4">
            {[
              'Kostenlose Job-Listung auf der spezialisierten Plattform',
              'Zugang zu qualifizierten Software Sales Kandidaten im DACH-Raum',
              'Persönliches Screening aller Interessenten durch unser Team',
              'Optionale White-Glove Recruiting-Begleitung',
              'Unternehmensprofil mit Bewertungen und Arbeitgeber-Branding',
              'Transparente Salary-Benchmarks für faire Angebote',
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
