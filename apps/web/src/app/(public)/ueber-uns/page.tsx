import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { APP_CONFIG } from '@/lib/config';
import {
  ArrowRight, CheckCircle, Briefcase, Building2, Award, Globe,
} from 'lucide-react';

export default function UeberUnsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 text-center max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Ich rekrutiere Software-Sales-Rollen,{' '}
            <span className="text-primary">weil ich sie selbst gemacht habe.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hier erfahrt ihr, wer hinter {APP_CONFIG.name} steckt – und warum das einen Unterschied für euch macht.
          </p>
        </div>
      </section>

      {/* Founder Section – narrative, not CV */}
      <section className="container py-16 max-w-5xl">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          {/* Photo */}
          <div className="md:col-span-2 flex justify-center">
            <div className="relative w-64 h-80 rounded-2xl overflow-hidden bg-muted shadow-lg">
              <Image
                src="/api/media/founder-photo"
                alt="Johannes Schartl – Gründer von SalesCareerHub"
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  // Fallback to static image if database fails
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/Johannes1.jpg";
                }}
              />
            </div>
          </div>

          {/* Bio – narrative framing */}
          <div className="md:col-span-3">
            <h2 className="text-2xl font-bold mb-1">Johannes Schartl</h2>
            <p className="text-primary font-semibold mb-6">Gründer – {APP_CONFIG.name}</p>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Ich habe den Software-Vertrieb von der Pike auf kennengelernt. Als SDR, Junior AE und Account Executive habe ich in verschiedenen SaaS-Unternehmen gearbeitet – von Startups mit fünf Leuten im Sales-Team bis hin zu Enterprise-Zyklen mit sechsstelligen Deals.
              </p>
              <p>
                Diese Stationen haben mir verschiedene Perspektiven gegeben: Ich weiß, wie sich ein SDR-Alltag anfühlt, was ein Mid-Market-AE an einem guten Produkt braucht, und welche Dynamiken in Enterprise-Sales-Organisationen herrschen. Dazu kommen Erfahrungen aus dem Consulting-Bereich – unter anderem bei KPMG – wo ich gelernt habe, strukturiert zu analysieren, sauber zu arbeiten und komplexe Projekte zu steuern.
              </p>
              <p>
                Irgendwann habe ich gemerkt: Die meisten Recruiter, die Software-Sales-Rollen besetzen, verstehen die Rolle nicht. Sie wissen nicht, wie ein guter Discovery Call klingt, was den Unterschied zwischen einem guten und einem großartigen AE ausmacht, oder warum ein Candidate eigentlich wirklich wechseln will. Das hat mich frustriert – auf beiden Seiten des Tisches.
              </p>
              <p className="font-medium text-foreground">
                Deshalb gibt es {APP_CONFIG.name}: Eine Recruiting-Agentur, die ausschließlich Software-Sales-Rollen besetzt – geführt von jemandem, der diese Welt kennt und Kandidaten danach beurteilt, ob sie wirklich in die Rolle passen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Erfahrungsbereiche – geframed, kein CV-Copy */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-4">Wo ich herkomme</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Meine Erfahrung spannt sich über verschiedene Unternehmensgrößen, Verkaufsmodelle und Branchen – und genau das macht den Unterschied beim Recruiting.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Briefcase,
                title: 'Startup & Scale-up Sales',
                desc: 'Ich habe in jungen SaaS-Unternehmen den Vertrieb mit aufgebaut – als einer der ersten im Team, mit direktem Einfluss auf Prozesse, Messaging und Teamstruktur.',
              },
              {
                icon: Building2,
                title: 'Enterprise & Mid-Market',
                desc: 'Komplexe Sales-Cycles, mehrere Stakeholder, lange Entscheidungswege – ich kenne die Anforderungen, die Enterprise-Rollen an Kandidaten stellen.',
              },
              {
                icon: Globe,
                title: 'Internationale Märkte',
                desc: 'Sales-Expansion in verschiedene europäische Märkte, inklusive Teamaufbau über Ländergrenzen hinweg. Ich verstehe, worauf es bei internationalem Hiring ankommt.',
              },
              {
                icon: Award,
                title: 'Big-4-Consulting & Prozesse',
                desc: 'Meine Zeit bei KPMG hat mir beigebracht, strukturiert zu arbeiten, Prozesse zu durchdenken und komplexe Anforderungen sauber aufzubereiten – Skills, die im Recruiting Gold wert sind.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-4 rounded-lg bg-background">
                <item.icon className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Was ich anbiete */}
      <section className="container py-16 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-8">Was ich euch biete</h2>
        <div className="space-y-4">
          {[
            'Persönliche Beratung durch jemanden, der Software-Sales-Rollen aus eigener Erfahrung kennt',
            'Ausschließlich vorqualifizierte Kandidaten – jedes Profil kommt mit meiner persönlichen Einschätzung',
            'Rein erfolgsbasiert: keine Vorabkosten, kein Retainer, keine versteckten Gebühren',
            'Eigene Plattform (Cockpit) statt E-Mail-Chaos – ihr behaltet jederzeit den Überblick',
            'Fokus ausschließlich auf Software Sales – vom SDR bis zum CRO',
            'Ehrliches Sparring zu Rollenprofilen, Marktlage und realistischen Erwartungen',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Klingt nach dem richtigen Ansatz?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Erzählt mir von eurer offenen Rolle – ich sage euch ehrlich, ob und wie ich helfen kann. Unverbindlich, ohne Kosten.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/kontakt">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Gespräch vereinbaren <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
