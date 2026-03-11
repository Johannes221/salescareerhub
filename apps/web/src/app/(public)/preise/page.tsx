import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  X, Check, ArrowRight, Shield, Zap, Target,
  Mail, FileText, Users, Clock, LayoutDashboard,
  Percent, Calendar, Handshake, Signature, Wallet,
  Award, RefreshCw
} from 'lucide-react';

export default function PreisePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            <span>100% Performance-Based — Zero Risk</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl mb-6">
            Kein Retainer.<br />
            <span className="text-primary">Nur Erfolg zählt.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Warum vorab bezahlen, wenn das Ergebnis noch nicht steht? 
            Bei uns zahlst du erst, wenn dein neuer Sales-Profi unterschreibt — 
            aufgeteilt in sichere Raten mit voller Garantie.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/kontakt">
              <Button size="lg" className="text-lg px-8">
                Unverbindlich beraten lassen <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Vergleich Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Der Unterschied, der zählt</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Wir haben den Recruiting-Prozess neu gedacht — ohne die typischen Fallstricke traditioneller Agenturen.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Andere Agenturen */}
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold text-destructive">Traditionelle Agenturen</h3>
              </div>
              <div className="space-y-5">
                {[
                  { icon: Wallet, text: 'Monatlicher Retainer — Kosten ohne Garantie' },
                  { icon: FileText, text: 'CVs werden rübergeschossen, ohne echte Prüfung' },
                  { icon: Users, text: 'Fehlendes SaaS-Sales Fachwissen bei der Bewertung' },
                  { icon: Mail, text: 'Email-Chaos und dezentrale Dokumentenablage' },
                  { icon: Target, text: 'Keine Garantien — Risiko liegt komplett beim Kunden' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-destructive/60" />
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Unser Ansatz */}
          <Card className="border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">Unser Ansatz</h3>
              </div>
              <div className="space-y-5">
                {[
                  { icon: Percent, text: 'Nur erfolgsbasiert — Zahlung erst bei Vertragsabschluss' },
                  { icon: Target, text: 'Sorgfältige Prüfung und Qualifikation jedes Kandidaten' },
                  { icon: Award, text: 'Jahrelange SaaS-Sales Erfahrung in verschiedenen Rollen' },
                  { icon: LayoutDashboard, text: 'Zentrale Plattform als übersichtlicher Hub & Dashboard' },
                  { icon: Shield, text: 'Volle Garantie — bei Abbruch zahlst du nicht weiter' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-green-600/80" />
                      <span className="font-medium">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 9-Schritte Prozess */}
      <section className="bg-muted/30 py-24">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <RefreshCw className="h-4 w-4" />
              <span>Der Weg zu deinem neuen Sales-Profi</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">So funktioniert unsere Zusammenarbeit</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Von der ersten Idee bis zum erfolgreichen Hire — transparent, strukturiert und ohne Überraschungen.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Schritte 1-3: Vorbereitung */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400">Phase 1: Vorbereitung & Briefing</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: '01', title: 'Erstgespräch', desc: 'Wir lernen uns kennen und besprechen eure Bedürfnisse, Voraussetzungen und Erwartungen.', icon: Users, color: 'blue' },
                  { step: '02', title: 'Briefing', desc: 'Detaillierte Abstimmung der Rollenanforderungen, Teamfit und Unternehmenskultur.', icon: FileText, color: 'blue' },
                  { step: '03', title: 'Strategie', desc: 'Entwicklung der individuellen Suchstrategie und Zielkandidaten-Profil.', icon: Target, color: 'blue' },
                ].map((item) => (
                  <div key={item.step} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-background rounded-xl p-6 border border-border hover:border-blue-500/50 transition-colors h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`h-10 w-10 rounded-lg bg-${item.color}-500/15 flex items-center justify-center`}>
                          <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                        </div>
                        <span className="text-2xl font-bold text-muted-foreground/50">{item.step}</span>
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schritte 4-6: Ausführung */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-amber-700 dark:text-amber-400">Phase 2: Aktive Suche & Selektion</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: '04', title: 'Suche startet', desc: 'Ich beginne mit der aktiven Ansprache passender Kandidaten aus meinem Netzwerk und dem Markt.', icon: RefreshCw, color: 'amber' },
                  { step: '05', title: 'Interviews', desc: 'Erstgespräche und tiefe Qualifikationsprüfung durch meine SaaS-Sales-Expertise.', icon: Users, color: 'amber' },
                  { step: '06', title: 'Präsentation', desc: 'Ich präsentiere dir nur die passendsten, persönlich geprüften Kandidaten mit Einschätzung.', icon: Target, color: 'amber' },
                ].map((item) => (
                  <div key={item.step} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-background rounded-xl p-6 border border-border hover:border-amber-500/50 transition-colors h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`h-10 w-10 rounded-lg bg-${item.color}-500/15 flex items-center justify-center`}>
                          <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                        </div>
                        <span className="text-2xl font-bold text-muted-foreground/50">{item.step}</span>
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schritte 7-9: Finale & Pricing */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Phase 3: Entscheidung & Erfolgsbeteiligung</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: '07', title: 'Eure Prüfung', desc: 'Ihr führt finale Gespräche mit den vorgestellten Kandidaten und entscheidet euch.', icon: Users, color: 'green' },
                  { step: '08', title: 'Vertragsunterzeichnung', desc: 'Der Kandidat unterschreibt bei euch — der erfolgreiche Abschluss!', icon: Signature, color: 'green' },
                  { step: '09', title: 'Onboarding-Support', desc: 'Begleitung über die ersten Monate für erfolgreiches Onboarding und langfristigen Erfolg.', icon: Handshake, color: 'green' },
                ].map((item) => (
                  <div key={item.step} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-background rounded-xl p-6 border border-border hover:border-green-500/50 transition-colors h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`h-10 w-10 rounded-lg bg-${item.color}-500/15 flex items-center justify-center`}>
                          <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                        </div>
                        <span className="text-2xl font-bold text-muted-foreground/50">{item.step}</span>
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Struktur */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium mb-6">
            <Percent className="h-4 w-4" />
            <span>Risikofrei & Performance-Based</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Die Zahlung — in sicheren Raten</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Keine Vorauszahlung. Kein Retainer. Du zahlst erst, wenn der Kandidat bei dir unterschreibt — 
            aufgeteilt in drei Raten für maximale Sicherheit.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Rate 1 */}
            <Card className="border-2 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Signature className="h-8 w-8 text-primary" />
                </div>
                <div className="text-5xl font-bold text-primary mb-2">20%</div>
                <h3 className="text-lg font-semibold mb-2">Bei Unterschrift</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Zahlung fällig, sobald der Kandidat den Vertrag unterschreibt
                </p>
                <div className="text-xs text-primary font-medium bg-primary/10 rounded-full px-3 py-1 inline-block">
                  Milestone 1 — Start
                </div>
              </CardContent>
            </Card>

            {/* Rate 2 */}
            <Card className="border-2 border-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-amber-600" />
                </div>
                <div className="text-5xl font-bold text-amber-600 mb-2">30%</div>
                <h3 className="text-lg font-semibold mb-2">Nach 3 Monaten</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Zweite Rate nach erfolgreicher Einarbeitung und ersten Ergebnissen
                </p>
                <div className="text-xs text-amber-700 font-medium bg-amber-500/10 rounded-full px-3 py-1 inline-block">
                  Milestone 2 — Integration
                </div>
              </CardContent>
            </Card>

            {/* Rate 3 */}
            <Card className="border-2 border-green-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500"></div>
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-5xl font-bold text-green-600 mb-2">50%</div>
                <h3 className="text-lg font-semibold mb-2">Nach Probezeit</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Finale Zahlung nach erfolgreich bestandener Probezeit
                </p>
                <div className="text-xs text-green-700 font-medium bg-green-500/10 rounded-full px-3 py-1 inline-block">
                  Milestone 3 — Erfolg
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Garantie-Box */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Shield className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-2">
                    100% Risk-Free Garantie
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-4">
                    Sollte der Kandidat vor Abschluss der Zahlung abpringen, werden alle ausstehenden Zahlungen 
                    gestrichen. Du bezahlst nur für Kandidaten, die bleiben und performen. 
                    Das ist echtes Performance-Based Recruiting.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 dark:text-green-300">Kein Retainer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 dark:text-green-300">Keine versteckten Kosten</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 dark:text-green-300">Abbruch = keine weitere Zahlung</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* USP Zusammenfassung */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Warum Unternehmen uns wählen</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Percent, title: 'Success-Only', desc: 'Zahlung erst bei Vertragsabschluss — kein Retainer, kein Risiko.' },
              { icon: Target, title: 'SaaS-Expertise', desc: 'Jahrelange Erfahrung in Sales-Rollen — wir bewerten, was wir kennen.' },
              { icon: LayoutDashboard, title: 'Plattform', desc: 'Zentraler Hub statt Email-Chaos — alle Infos, alle Status, jederzeit.' },
              { icon: Shield, title: 'Garantie', desc: 'Bei Abbruch keine weiteren Zahlungen. Du zahlst nur für Erfolg.' },
            ].map((usp, i) => (
              <div key={i} className="bg-background rounded-xl p-6 border border-border text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <usp.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{usp.title}</h3>
                <p className="text-sm text-muted-foreground">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">Bereit für risikofreies Recruiting?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Lass uns über deine offene Sales-Rolle sprechen. Kein Verpflichtung, kein Retainer — 
            nur eine ehrliche Einschätzung, ob wir helfen können.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/kontakt">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Gespräch vereinbaren <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/fuer-unternehmen">
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground/30 hover:bg-primary-foreground/10">
                Mehr über unseren Ansatz
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
