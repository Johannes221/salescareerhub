import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { APP_CONFIG } from '@salescareerhub/config';
import {
  Target, Users, Shield, TrendingUp, ArrowRight, CheckCircle,
  Briefcase, Building2, Award, GraduationCap, Globe,
} from 'lucide-react';

export default function UeberUnsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 text-center max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Wir kennen deine Welt.{' '}
            <span className="text-primary">Weil wir aus ihr kommen.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {APP_CONFIG.name} ist keine klassische Recruiting-Agentur. Wir sind ehemalige SaaS-Operator, die Recruiting so machen, wie wir es uns als Hiring Manager selbst gewünscht hätten.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="container py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none mb-12">
          <h2 className="text-2xl font-bold">Unsere Mission</h2>
          <p className="text-muted-foreground">
            Die meisten Recruiting-Agenturen verstehen SaaS nicht. Sie kennen den Unterschied zwischen einem SDR und einem BDR nicht, wissen nicht, was ein gutes Discovery Call aussieht, und bewerten Kandidaten nach Keywords statt nach echtem Potenzial.
          </p>
          <p className="text-muted-foreground">
            Wir haben selbst in SaaS-Teams gearbeitet – in Sales, Customer Success und Revenue. Wir wissen, was eine gute Hire ausmacht, weil wir diese Rollen selbst gelebt haben. {APP_CONFIG.name} verbindet operative Erfahrung mit modernem Recruiting: erfolgsbasiert, transparent und über eine eigene Plattform statt E-Mail-Chaos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Target, title: 'Spezialisiert auf SaaS-GTM', desc: 'Kein General Recruiting. Wir besetzen ausschließlich Sales, CS, Marketing und RevOps in SaaS-Unternehmen.' },
            { icon: Shield, title: 'Erfolgsbasiert & transparent', desc: 'Kein Retainer, keine Vorabkosten. Ihr zahlt nur bei erfolgreichem Hire – so einfach ist das.' },
            { icon: Users, title: 'Geprüfte Kandidaten', desc: 'Jeder Kandidat wird persönlich bewertet. Keine ungeprüften CVs, keine Masse – nur Qualität.' },
            { icon: TrendingUp, title: 'Plattform statt Papierkram', desc: 'Unser Cockpit gibt euch Echtzeit-Überblick über Kandidaten, Status und Bewertungen – alles an einem Ort.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <item.icon className="h-8 w-8 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Section */}
      <section className="bg-muted/50 py-16">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Der Gründer</h2>
          <div className="grid md:grid-cols-5 gap-8 items-start">
            {/* Photo */}
            <div className="md:col-span-2 flex justify-center">
              <div className="relative w-64 h-80 rounded-2xl overflow-hidden bg-muted shadow-lg">
                <Image
                  src="/images/founder.jpg"
                  alt="Gründer von SalesCareerHub"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Bio & CV */}
            <div className="md:col-span-3">
              <h3 className="text-2xl font-bold mb-2">Johan</h3>
              <p className="text-primary font-semibold mb-4">Founder & CEO – {APP_CONFIG.name}</p>
              <p className="text-muted-foreground mb-6">
                Bevor ich {APP_CONFIG.name} gegründet habe, habe ich selbst jahrelang in SaaS-Unternehmen gearbeitet – als SDR, Junior AE und Account Executive. Ich kenne die Herausforderungen auf beiden Seiten: als Kandidat, der eine passende Rolle sucht, und als Teil von Revenue-Teams, die schnell wachsen müssen. Genau diese Erfahrung bringe ich in jedes Mandat ein.
              </p>

              <h4 className="font-semibold mb-4 text-lg">Beruflicher Werdegang</h4>
              <div className="space-y-4">
                {[
                  {
                    role: 'Account Executive',
                    company: 'INTEGRTR',
                    period: '2025 – Heute',
                    detail: 'Hybrid HR-Landschaften (SAP HCM & SuccessFactors) – Enterprise SaaS Sales',
                    tags: ['SAP SuccessFactors', 'SaaS', 'Enterprise Sales'],
                  },
                  {
                    role: 'Account Executive → SDR → Junior AE',
                    company: 'NUNAMI',
                    period: '2023 – 2025',
                    detail: 'Revenue verdoppelt innerhalb von 18 Monaten (multiple six figures). Internationale Marktexpansion. Aufbau einer Sales-Organisation mit 2 SDRs.',
                    tags: ['HubSpot', 'SaaS', 'Sales Leadership', 'International'],
                  },
                  {
                    role: 'Consulting – Process Management',
                    company: 'Torsten Diemer Consulting',
                    period: '2022 – 2023',
                    detail: 'End-to-End Process Management, SaaS-Geschäftsmodelle für KMU, Bachelorarbeit zu Software-Rollouts.',
                    tags: ['SaaS', 'BPMN', 'Prozessmanagement'],
                  },
                  {
                    role: 'Consulting – Digital Compliance',
                    company: 'KPMG Deutschland',
                    period: '2021 – 2022',
                    detail: 'Interne Kontrollsysteme, SOC1/SOC2/BSI C5 Audits, S/4HANA-Implementierung.',
                    tags: ['Consulting', 'Compliance', 'SAP S/4HANA'],
                  },
                  {
                    role: 'Quality Assurance – Software',
                    company: 'zetVisions GmbH',
                    period: '2020 – 2021',
                    detail: 'Software-Qualitätssicherung in einem B2B-SaaS-Umfeld.',
                    tags: ['QA', 'Software', 'JIRA'],
                  },
                ].map((job, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary mt-1.5 shrink-0" />
                      {i < 4 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="font-semibold text-sm">{job.role}</p>
                      <p className="text-sm text-primary">{job.company} · {job.period}</p>
                      <p className="text-sm text-muted-foreground mt-1">{job.detail}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;Ich habe selbst erlebt, wie frustrierend es ist, mit Recruitern zu arbeiten, die SaaS nicht verstehen. Deshalb habe ich {APP_CONFIG.name} gegründet – eine Agentur, die von echten SaaS-Profis geführt wird und nur Kandidaten vorstellt, die wir selbst einstellen würden.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Founder-Led Matters */}
      <section className="container py-16 max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-4">Warum ein Gründer aus der Branche?</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Traditionelle Recruiter sprechen über SaaS. Wir haben es gelebt.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Briefcase,
              title: 'Operative Erfahrung',
              desc: 'Von SDR über AE bis Revenue-Verantwortung – wir haben die Rollen selbst ausgefüllt, die wir besetzen.',
            },
            {
              icon: Globe,
              title: 'Internationaler Blick',
              desc: 'Sales-Expansion in mehrere internationale Märkte – wir wissen, worauf es bei Cross-Border-Hiring ankommt.',
            },
            {
              icon: Award,
              title: 'Echte Ergebnisse',
              desc: 'Revenue verdoppelt, Sales-Orgs aufgebaut, Enterprise-Deals geschlossen – aus dieser Praxis heraus bewerten wir Kandidaten.',
            },
          ].map((item) => (
            <Card key={item.title} className="border-0 shadow-none bg-muted/50">
              <CardContent className="pt-6 text-center">
                <item.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit, mit echten SaaS-Profis zu arbeiten?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Kein Risiko, keine Vorabkosten. Erzählt uns von eurer offenen Rolle – wir liefern die passenden Kandidaten.
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
