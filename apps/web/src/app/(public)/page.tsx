'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG } from '@salescareerhub/config';
import {
  ArrowRight, Shield, Target, Zap, CheckCircle, Users,
  Monitor, Clock, Award, ChevronDown, ChevronUp, Briefcase,
  BarChart3, UserCheck, Headphones, FileText, MessageSquare,
} from 'lucide-react';

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        className="flex w-full items-center justify-between py-5 text-left font-semibold hover:text-primary transition-colors"
        onClick={() => setOpen(!open)}
      >
        {q}
        {open ? <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />}
      </button>
      {open && <p className="pb-5 text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              Kein General Recruiting. 100 % SaaS-GTM.
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Wir vermitteln nicht.{' '}
              <span className="text-primary">Wir bauen Revenue Teams.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              Wir kommen aus Sales, CS und Revenue – nicht aus dem Recruiting.
              Deshalb suchen wir anders: schneller, gezielter und mit echtem Verständnis für SaaS-GTM-Rollen.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kontakt">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Jetzt Gespräch vereinbaren
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/ueber-uns">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                  Warum wir?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* USP Section – 4 Differentiators */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Vier Gründe, warum SaaS-Teams mit uns arbeiten</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Wir sind keine Generalisten. Wir sind GTM-Recruiting-Spezialisten mit operativer SaaS-Erfahrung.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: UserCheck,
              title: 'Operative SaaS-Erfahrung',
              desc: 'Wir haben selbst in SaaS-Teams gearbeitet – als SDR, AE und im Revenue-Bereich. Wir verstehen, was zählt.',
            },
            {
              icon: Target,
              title: '100 % Fokus auf SaaS-GTM',
              desc: 'Sales, CS, Marketing & RevOps – kein General Recruiting. Wir besetzen nur Rollen, die wir wirklich verstehen.',
            },
            {
              icon: Zap,
              title: 'Schnelle Ergebnisse',
              desc: 'Keine langen Suchphasen, kein CV-Raten. Erste qualifizierte Profile innerhalb weniger Tage.',
            },
            {
              icon: Shield,
              title: 'Erfolg statt Retainer',
              desc: 'Ihr zahlt nur bei erfolgreichem Hire. Kein Risiko, volle Transparenz. Keine Vorabkosten.',
            },
          ].map((usp) => (
            <Card key={usp.title} className="border-0 shadow-none bg-muted/50">
              <CardContent className="pt-6">
                <usp.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{usp.title}</h3>
                <p className="text-muted-foreground text-sm">{usp.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table: Traditional vs Us */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Was uns unterscheidet</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4 text-destructive">Traditionelles Recruiting</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    'Generalist ohne Branchenkenntnis',
                    'Fokus auf Lebenslauf-Keywords',
                    'Lange Suchphasen, hohe CV-Raten',
                    'Retainer-Modelle, Zahlung vorab',
                    'Kommunikation per E-Mail-Chaos',
                    'Ungeprüfte Kandidatenprofile',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4 text-primary">Unser Ansatz</h3>
                <ul className="space-y-3 text-sm">
                  {[
                    'Operative SaaS-Erfahrung aus der Praxis',
                    'Bewertung nach echtem Potenzial',
                    'Shortlist in 7–10 Tagen',
                    'Erfolgsbasiert – ihr zahlt nur bei Hire',
                    'Eigene Plattform / Cockpit statt E-Mails',
                    'Jeder Kandidat persönlich geprüft',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* GTM Roles We Fill */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Welche GTM-Rollen wir besetzen</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Strukturiert nach klaren Rollenbereichen entlang des Go-To-Market – von operativen Rollen bis zur Revenue-Verantwortung.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Briefcase,
              area: 'Sales (New Business)',
              goal: 'Pipeline aufbauen und Umsatz generieren.',
              roles: ['SDR / BDR', 'Account Executive (SMB, MM & Enterprise)', 'Sales Leadership (Head / Director / VP)', 'CRO'],
            },
            {
              icon: Headphones,
              area: 'Customer Success',
              goal: 'Time-to-Value, Nutzung und Bindung steigern.',
              roles: ['Account Manager', 'Customer Success Manager', 'CS Leadership'],
            },
            {
              icon: BarChart3,
              area: 'Marketing',
              goal: 'Nachfrage erzeugen und Pipeline skalieren.',
              roles: ['Demand / Growth Marketing', 'Product Marketing', 'Marketing Leadership'],
            },
            {
              icon: Monitor,
              area: 'RevOps',
              goal: 'Prozesse, Systeme und Daten für planbares Wachstum.',
              roles: ['RevOps Manager', 'CRM / Sales Ops', 'RevOps Leadership'],
            },
          ].map((cat) => (
            <Card key={cat.area}>
              <CardContent className="pt-6">
                <cat.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{cat.area}</h3>
                <p className="text-xs text-muted-foreground mb-3">{cat.goal}</p>
                <ul className="space-y-1">
                  {cat.roles.map((r, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Platform / Cockpit Section */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Euer Recruiting-Cockpit</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kein E-Mail-Chaos, keine Excel-Listen. Ihr bekommt eine eigene Plattform, auf der ihr den gesamten Recruiting-Prozess in Echtzeit verfolgt.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Monitor, title: 'Live-Dashboard', desc: 'Alle Kandidaten, Status-Updates und Bewertungen auf einen Blick – jederzeit zugänglich.' },
              { icon: FileText, title: 'Kandidaten-Briefings', desc: 'Strukturierte Profile mit unserer Einschätzung – kein Lebenslauf-Raten.' },
              { icon: MessageSquare, title: 'Direkter Austausch', desc: 'Kommunikation, Feedback und Rollen-Sparring an einem Ort.' },
              { icon: Clock, title: 'Echtzeit-Tracking', desc: 'Seht in Echtzeit, wo jeder Kandidat im Prozess steht.' },
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

      {/* How it Works */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-4">So funktioniert es</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Von der Bedarfsanalyse bis zur Einstellung – in vier klaren Schritten.
        </p>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Rollenbriefing & Bedarfsanalyse', desc: 'Gemeinsame Schärfung des Rollenprofils, Must-haves vs. Nice-to-haves und Interview-Kriterien.' },
            { step: '02', title: 'Gezielte Ansprache', desc: 'Mit unserem Netzwerk identifizieren wir die passenden Kandidat:innen. Shortlist in 7–10 Tagen.' },
            { step: '03', title: 'Evaluierung & Interviews', desc: 'Vorauswahl, Kandidaten-Briefings und aktive Unterstützung bei euren Interviews.' },
            { step: '04', title: 'Onboarding & Nachbetreuung', desc: 'Auch nach der Einstellung bleiben wir in Kontakt und geben Marktfeedback.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Häufig gestellte Fragen</h2>
          <div className="bg-background rounded-lg border p-6">
            <FAQItem
              q="Was unterscheidet euch von anderen Recruiting-Agenturen?"
              a="Wir sind keine klassischen Recruiter. Jeder bei uns hat selbst in SaaS-Unternehmen gearbeitet – als SDR, Account Executive oder im Revenue-Bereich. Dadurch verstehen wir eure Rollen aus erster Hand und können Kandidaten nach echtem Potenzial bewerten, nicht nur nach Keywords im Lebenslauf."
            />
            <FAQItem
              q="Was bedeutet erfolgsbasiert – zahle ich wirklich nur bei Hire?"
              a="Ja, zu 100 %. Wir arbeiten ohne Retainer und ohne Vorabkosten. Ihr zahlt ausschließlich, wenn wir euch erfolgreich einen Kandidaten vermittelt haben, der bei euch anfängt. Kein Risiko, volle Transparenz."
            />
            <FAQItem
              q="Wie schnell bekomme ich erste Kandidaten?"
              a="In der Regel erhaltet ihr innerhalb von 7–10 Tagen eine erste Shortlist mit qualifizierten Profilen. Wir arbeiten mit einem bestehenden Netzwerk aus geprüften SaaS-Professionals und können daher schnell liefern."
            />
            <FAQItem
              q="Bekomme ich ungeprüfte Lebensläufe zugeschickt?"
              a="Nein. Jeder Kandidat wird von uns persönlich geprüft und bewertet, bevor wir ihn euch vorstellen. Ihr bekommt strukturierte Briefings mit unserer Einschätzung – keine ungeprüften CVs."
            />
            <FAQItem
              q="Was ist das Recruiting-Cockpit?"
              a="Unser Cockpit ist eine eigene Plattform, auf der ihr den gesamten Prozess verfolgen könnt: Kandidaten-Status, Briefings, Feedback und Kommunikation – alles an einem Ort. Kein E-Mail-Chaos, kein Papierkram."
            />
            <FAQItem
              q="Welche Rollen besetzt ihr?"
              a="Wir fokussieren uns auf GTM-Rollen in SaaS-Unternehmen: Sales (SDR bis CRO), Customer Success, Marketing und RevOps. Von der operativen Ebene bis zum C-Level."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit, euer Revenue Team aufzubauen?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Kein Risiko, keine Vorabkosten. Erzählt uns von eurer offenen Rolle – wir liefern die passenden Kandidaten.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/kontakt">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Gespräch vereinbaren <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/ueber-uns">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Mehr über uns
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
