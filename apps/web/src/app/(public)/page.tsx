import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG } from '@salescareerhub/config';
import {
  Search, Building2, TrendingUp, Users, Star, ArrowRight,
  Briefcase, BarChart3, Shield, Target, Award, Zap,
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              Spezialisiert auf Software Sales im DACH-Raum
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Deine Karriere im{' '}
              <span className="text-primary">Software Sales</span>
              {' '}startet hier
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              {APP_CONFIG.description}. Transparente Gehälter, verifizierte Unternehmen
              und persönliche Recruiting-Begleitung.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  <Search className="mr-2 h-5 w-5" />
                  Jobs entdecken
                </Button>
              </Link>
              <Link href="/fuer-unternehmen">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                  <Building2 className="mr-2 h-5 w-5" />
                  Job kostenlos listen
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-12 mx-auto max-w-2xl">
            <form action="/jobs" method="GET" className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  name="search"
                  placeholder="Jobtitel, Rolle oder Unternehmen..."
                  className="w-full h-12 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" size="lg">Suchen</Button>
            </form>
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section className="container py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: 'Spezialisiert',
              desc: 'Fokus auf Software Sales Rollen – SDR bis VP Sales. Keine generischen Stellenanzeigen.',
            },
            {
              icon: Shield,
              title: 'Transparent & Verifiziert',
              desc: 'Echte Gehaltsdaten, Unternehmens-Bewertungen und verifizierte Arbeitgeber im DACH-Raum.',
            },
            {
              icon: Zap,
              title: 'Persönliche Begleitung',
              desc: 'Kein anonymes Massenrecruiting. Wir screenen, beraten und begleiten dich persönlich.',
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

      {/* Featured Jobs Preview */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Aktuelle Jobs</h2>
            <p className="text-muted-foreground mt-1">Handverlesene Software Sales Positionen</p>
          </div>
          <Link href="/jobs">
            <Button variant="ghost">
              Alle Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Enterprise Account Executive', company: 'TechCorp GmbH', location: 'München', remote: 'Hybrid', salary: '80.000 – 120.000 €', ote: '140.000 – 200.000 €' },
            { title: 'SDR – DACH Region', company: 'CloudScale AG', location: 'Berlin', remote: 'Remote', salary: '45.000 – 55.000 €', ote: '65.000 – 80.000 €' },
            { title: 'Head of Sales DACH', company: 'DataFlow Solutions', location: 'Zürich', remote: 'Hybrid', salary: '120.000 – 150.000 €', ote: '200.000 – 280.000 €' },
            { title: 'Mid-Market AE', company: 'SaaSify GmbH', location: 'Hamburg', remote: 'Vor Ort', salary: '65.000 – 85.000 €', ote: '110.000 – 150.000 €' },
            { title: 'Sales Manager', company: 'SecureNet AG', location: 'Wien', remote: 'Hybrid', salary: '90.000 – 110.000 €', ote: '160.000 – 200.000 €' },
            { title: 'BDR – Outbound', company: 'AI Analytics GmbH', location: 'Frankfurt', remote: 'Remote', salary: '42.000 – 52.000 €', ote: '60.000 – 75.000 €' },
          ].map((job, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary">{job.remote}</Badge>
                </div>
                <h3 className="font-semibold mb-1">{job.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{job.company} · {job.location}</p>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-muted-foreground">Base: {job.salary}</span>
                  <span className="font-medium text-primary">OTE: {job.ote}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Top Companies */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Top Unternehmen</h2>
              <p className="text-muted-foreground mt-1">Bestbewertete Software Sales Organisationen</p>
            </div>
            <Link href="/rankings">
              <Button variant="ghost">
                Alle Rankings <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'TechCorp GmbH', rating: 4.5, reviews: 23, industry: 'Enterprise SaaS', verified: true },
              { name: 'CloudScale AG', rating: 4.3, reviews: 18, industry: 'Cloud Infrastructure', verified: true },
              { name: 'DataFlow Solutions', rating: 4.1, reviews: 12, industry: 'Data & Analytics', verified: false },
            ].map((company, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{company.name}</h3>
                        {company.verified && <Shield className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{company.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-semibold">{company.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({company.reviews} Bewertungen)</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Salary Insights Preview */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Gehaltsübersicht</h2>
            <p className="text-muted-foreground mt-1">Aktuelle Gehaltsdaten für Software Sales im DACH-Raum</p>
          </div>
          <Link href="/gehaelter">
            <Button variant="ghost">
              Alle Gehälter <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { role: 'SDR', base: '42.000 – 55.000 €', ote: '60.000 – 80.000 €' },
            { role: 'Account Executive', base: '65.000 – 90.000 €', ote: '110.000 – 160.000 €' },
            { role: 'Enterprise AE', base: '85.000 – 130.000 €', ote: '150.000 – 250.000 €' },
            { role: 'Head of Sales', base: '110.000 – 160.000 €', ote: '180.000 – 300.000 €' },
          ].map((item, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{item.role}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base</span>
                    <span>{item.base}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OTE</span>
                    <span className="font-medium text-primary">{item.ote}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Deutschland · 2024</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works – Candidates */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">So funktioniert es für Kandidaten</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Kein anonymes Bewerben. Wir begleiten dich persönlich durch den gesamten Prozess.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Profil erstellen', desc: 'Erstelle dein Kandidatenprofil mit deinen Zielen und Erfahrungen.' },
              { step: '2', title: 'Jobs entdecken', desc: 'Durchsuche spezialisierte Software Sales Positionen.' },
              { step: '3', title: 'Interesse bekunden', desc: 'Zeige Interesse an spannenden Positionen – wir melden uns bei dir.' },
              { step: '4', title: 'Persönliche Begleitung', desc: 'Wir screenen, beraten und begleiten dich bis zum Vertragsangebot.' },
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

      {/* How it Works – Companies */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-4">So funktioniert es für Unternehmen</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Listen Sie Ihre Sales-Positionen kostenlos und erreichen Sie qualifizierte Kandidaten.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Kostenlos registrieren', desc: 'Erstellen Sie Ihr Unternehmensprofil in wenigen Minuten.' },
            { step: '2', title: 'Jobs veröffentlichen', desc: 'Listen Sie Ihre Software Sales Positionen – kostenlos und gezielt.' },
            { step: '3', title: 'Kandidaten erhalten', desc: 'Wir screenen und empfehlen passende, qualifizierte Kandidaten.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="h-12 w-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/fuer-unternehmen">
            <Button size="lg">
              Jetzt kostenlos Job listen <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit für den nächsten Karriereschritt?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Registriere dich kostenlos und erhalte Zugang zu exklusiven Software Sales Positionen im DACH-Raum.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/registrieren">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Kostenlos registrieren
              </Button>
            </Link>
            <Link href="/kontakt">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Kontakt aufnehmen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Preview */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Karriere-Guides</h2>
            <p className="text-muted-foreground mt-1">Tipps und Insights für deine Sales-Karriere</p>
          </div>
          <Link href="/guides">
            <Button variant="ghost">
              Alle Guides <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Gehaltsverhandlung im Software Sales', type: 'Guide', excerpt: 'So verhandelst du dein OTE optimal – von der Vorbereitung bis zum Abschluss.' },
            { title: 'Vom SDR zum Enterprise AE', type: 'Karriere-Guide', excerpt: 'Der typische Karrierepfad im Software Sales und wie du ihn beschleunigst.' },
            { title: 'DACH Sales Markt 2024', type: 'Marktreport', excerpt: 'Aktuelle Trends, Gehaltsentwicklungen und die gefragtesten Sales-Rollen.' },
          ].map((post, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <Badge variant="outline" className="mb-3">{post.type}</Badge>
                <h3 className="font-semibold mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
