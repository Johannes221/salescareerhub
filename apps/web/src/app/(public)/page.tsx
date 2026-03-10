'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG } from '@/lib/config';
import {
  ArrowRight, Shield, Target, Zap, CheckCircle,
  Monitor, Clock, ChevronDown, ChevronUp, Briefcase,
  UserCheck, FileText, MessageSquare, TrendingUp,
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              Spezialisiert auf Software Sales
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Dein Sales-Hire.{' '}
              <span className="text-primary">Von jemandem, der die Rolle kennt.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              Ich habe selbst als SDR und Account Executive in SaaS-Startups und Enterprises gearbeitet.
              Heute finde ich genau diese Profile für euer Team – ohne Vorabkosten, über eine eigene Plattform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kontakt">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Unverbindlich sprechen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/ueber-uns">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                  Über mich & den Ansatz
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Warum anders */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Warum {APP_CONFIG.name} anders funktioniert</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ich war auf beiden Seiten – als Kandidat und als Teil von Sales-Teams, die schnell wachsen mussten. Daraus ist ein anderer Recruiting-Ansatz entstanden.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: UserCheck,
              title: 'Echte Sales-Erfahrung',
              desc: 'Ich habe selbst als SDR und AE gearbeitet – in Startups, im Mid-Market und im Enterprise-Umfeld. Ich weiß, worauf es ankommt.',
            },
            {
              icon: Target,
              title: 'Nur Software Sales',
              desc: 'Kein Marketing, kein IT, kein Allround-Recruiting. Ich konzentriere mich auf das, was ich wirklich kenne: Software-Sales-Rollen.',
            },
            {
              icon: Shield,
              title: 'Nur bei Erfolg',
              desc: 'Kein Retainer, keine Vorabkosten. Ihr zahlt erst, wenn jemand anfängt. So einfach, so fair.',
            },
            {
              icon: Zap,
              title: 'Schnell & vorqualifiziert',
              desc: 'Keine Flut an Lebensläufen. Ich stelle euch nur Kandidaten vor, die ich persönlich geprüft und für passend halte.',
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

      {/* Rollen */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Welche Rollen ich besetze</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mein Fokus liegt auf Software-Sales-Positionen entlang der gesamten Karriereleiter – vom Einstieg bis zum C-Level.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Briefcase,
                segment: 'Operative Rollen',
                roles: ['Sales Development Representative (SDR / BDR)', 'Account Executive (SMB & Mid-Market)', 'Enterprise Account Executive'],
              },
              {
                icon: TrendingUp,
                segment: 'Leadership',
                roles: ['Team Lead Sales', 'Head of Sales', 'VP Sales / Director Sales'],
              },
              {
                icon: Target,
                segment: 'Strategisch',
                roles: ['Chief Revenue Officer (CRO)', 'Sales Engineer / Pre-Sales', 'Partner & Channel Manager'],
              },
            ].map((cat) => (
              <Card key={cat.segment}>
                <CardContent className="pt-6">
                  <cat.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-3">{cat.segment}</h3>
                  <ul className="space-y-2">
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
        </div>
      </section>

      {/* Plattform */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Alles an einem Ort – euer Recruiting-Cockpit</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Statt endloser E-Mail-Ketten und verstreuter Dokumente bekommt ihr Zugang zu einer Plattform, die den gesamten Prozess bündelt.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Monitor, title: 'Dashboard', desc: 'Status aller Kandidaten, nächste Schritte und Zeitplan – alles auf einen Blick.' },
              { icon: FileText, title: 'Vorqualifizierte Profile', desc: 'Jeder Kandidat kommt mit meiner schriftlichen Einschätzung – nicht als blanker Lebenslauf.' },
              { icon: MessageSquare, title: 'Kommunikation gebündelt', desc: 'Feedback, Rückfragen und Abstimmungen direkt in der Plattform statt in verschiedenen Threads.' },
              { icon: Clock, title: 'Voller Überblick', desc: 'Ihr seht jederzeit, wo im Prozess jeder Kandidat steht – ohne nachfragen zu müssen.' },
            ].map((feat) => (
              <div key={feat.title} className="flex gap-4 p-4 rounded-lg bg-muted/50">
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
      <section className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Wie eine Zusammenarbeit abläuft</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Klar strukturiert, ohne Overhead. Ihr sagt mir, wen ihr sucht – ich kümmere mich um den Rest.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Kennenlernen & Briefing', desc: 'Wir besprechen die Rolle, das Team und was wirklich zählt – fachlich und kulturell.' },
              { step: '02', title: 'Kandidaten-Suche', desc: 'Ich spreche gezielt passende Sales-Profile an und prüfe sie persönlich, bevor ich sie vorstelle.' },
              { step: '03', title: 'Vorstellung & Interviews', desc: 'Ihr bekommt vorqualifizierte Kandidaten mit meiner Einschätzung und Interview-Empfehlungen.' },
              { step: '04', title: 'Begleitung bis zum Start', desc: 'Ich unterstütze bei Verhandlung, Absage-Handling und bleibe auch nach dem Start in Kontakt.' },
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
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Häufig gestellte Fragen</h2>
          <div className="bg-muted/50 rounded-lg border p-6">
            <FAQItem
              q="Warum sollte ich mit einer One-Person-Agentur arbeiten?"
              a="Weil ihr direkt mit jemandem sprecht, der eure Rollen aus eigener Erfahrung kennt. Kein Briefing-Stille-Post über drei Ebenen, kein Junior-Recruiter, der Google-Ergebnisse weiterleitet. Ich spreche eure Sprache, weil ich selbst im Software Sales gearbeitet habe – vom SDR bis zum Enterprise AE."
            />
            <FAQItem
              q="Was heißt erfolgsbasiert konkret?"
              a="Ihr zahlt erst, wenn ein Kandidat unterschrieben hat und anfängt. Vorher entstehen keine Kosten – kein Retainer, keine Anzahlung, keine Projektpauschale. Wenn es nicht passt, zahlt ihr nichts."
            />
            <FAQItem
              q="Bekomme ich einfach einen Stapel Lebensläufe?"
              a="Nein. Ich stelle euch nur Kandidaten vor, die ich vorher persönlich gesprochen und für eure Rolle als passend eingeschätzt habe. Dazu bekommt ihr ein ausführliches Briefing mit meiner Bewertung – kein Copy-Paste aus LinkedIn."
            />
            <FAQItem
              q="Was ist das Recruiting-Cockpit?"
              a="Eine Plattform, über die ihr den gesamten Prozess verfolgt – Kandidaten, Status, Briefings, Kommunikation. Alles gebündelt, statt in E-Mails verstreut. Ihr behaltet jederzeit den Überblick."
            />
            <FAQItem
              q="Welche Rollen deckt ihr ab?"
              a="Ausschließlich Software-Sales-Positionen: SDR, BDR, Account Executive, Sales Leadership bis CRO, Sales Engineer und Partner Management. Keine Marketing-, CS- oder IT-Rollen."
            />
            <FAQItem
              q="Wie schnell geht das?"
              a="Erste qualifizierte Profile bekommt ihr in der Regel innerhalb weniger Tage nach dem Briefing. Die genaue Dauer hängt natürlich von der Rolle und euren Anforderungen ab – aber Schnelligkeit ist ein zentraler Anspruch."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Eure nächste Sales-Hire beginnt mit einem Gespräch.</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Kein Pitch, kein Vertrag. Erzählt mir von eurer offenen Rolle – und ich sage euch ehrlich, ob und wie ich helfen kann.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/kontakt">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Gespräch vereinbaren <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/ueber-uns">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Mehr über mich
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
