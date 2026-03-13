'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  BriefcaseBusiness,
  BarChart3,
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  PenLine,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

const TABS = [
  { key: 'reports', label: 'Gehaltsreports', icon: BarChart3 },
  { key: 'trends', label: 'Sales Trends', icon: TrendingUp },
  { key: 'tips', label: 'Karriere Tipps', icon: BookOpen },
  { key: 'contribute', label: 'Report beitragen', icon: PenLine },
] as const;

type TabKey = (typeof TABS)[number]['key'];
type ReportMode = 'general' | 'job';

const SALARY_DATA = [
  { role: 'SDR', base: '38.000 – 48.000 €', ote: '52.000 – 65.000 €', median: '58.000 €' },
  { role: 'BDR', base: '40.000 – 52.000 €', ote: '58.000 – 72.000 €', median: '64.000 €' },
  { role: 'Account Executive', base: '55.000 – 75.000 €', ote: '80.000 – 120.000 €', median: '95.000 €' },
  { role: 'Mid-Market AE', base: '65.000 – 85.000 €', ote: '100.000 – 140.000 €', median: '115.000 €' },
  { role: 'Enterprise AE', base: '80.000 – 110.000 €', ote: '130.000 – 200.000 €', median: '160.000 €' },
  { role: 'Sales Manager', base: '75.000 – 100.000 €', ote: '110.000 – 160.000 €', median: '130.000 €' },
  { role: 'Head of Sales', base: '90.000 – 130.000 €', ote: '140.000 – 220.000 €', median: '175.000 €' },
  { role: 'VP Sales', base: '120.000 – 180.000 €', ote: '180.000 – 300.000 €', median: '230.000 €' },
];

const TREND_ARTICLES = [
  {
    id: '1',
    title: 'Gehaltsentwicklung im SaaS Sales 2025',
    excerpt: 'Die OTE-Benchmarks im DACH-Raum sind im Vergleich zum Vorjahr um 8% gestiegen, besonders im Enterprise-Segment.',
    category: 'Gehaltsreport',
    readingTime: 6,
    date: '2025-02-15',
  },
  {
    id: '2',
    title: 'Remote Sales: Neue Normalität oder Rückgang?',
    excerpt: 'Wie sich die Remote-Quote in Sales Teams verändert hat und welche Unternehmen zurück ins Büro gehen.',
    category: 'Markt Update',
    readingTime: 4,
    date: '2025-01-28',
  },
  {
    id: '3',
    title: 'Enterprise Sales: Die gefragtesten Skills 2025',
    excerpt: 'MEDDPICC, Value Selling und Multi-Threading sind die Top-Skills, die Enterprise AEs jetzt brauchen.',
    category: 'Hiring Trend',
    readingTime: 5,
    date: '2025-01-10',
  },
  {
    id: '4',
    title: 'Interview Benchmarks: So viele Runden sind üblich',
    excerpt: 'Daten aus 500+ Sales-Bewerbungen zeigen: 3-4 Runden sind Standard, 5+ Runden eher Enterprise.',
    category: 'Interview Guide',
    readingTime: 3,
    date: '2024-12-20',
  },
  {
    id: '5',
    title: 'OTE-Entwicklung nach Region: DACH im Vergleich',
    excerpt: 'Schweiz weiterhin am Spitzenplatz, Deutschland holt auf – Österreich wächst am schnellsten.',
    category: 'Gehaltsreport',
    readingTime: 7,
    date: '2024-12-05',
  },
];

const CAREER_TIPS = [
  {
    id: '1',
    title: 'Vom SDR zum AE: Der optimale Karrierepfad',
    excerpt: 'Wie du den Wechsel planst, welche Skills du aufbauen solltest und wann der richtige Zeitpunkt ist.',
    readingTime: 8,
  },
  {
    id: '2',
    title: 'Gehaltsverhandlung im Sales: Taktiken die funktionieren',
    excerpt: 'Datenbasierte Strategien für deine nächste OTE-Verhandlung – von erfahrenen Sales Leaders.',
    readingTime: 5,
  },
  {
    id: '3',
    title: 'Sales Case Study meistern: Vorbereitung und Durchführung',
    excerpt: 'Die häufigsten Case-Study-Formate und wie du dich optimal darauf vorbereitest.',
    readingTime: 6,
  },
];

const ROLE_OPTIONS = [
  'SDR', 'BDR', 'Account Executive', 'Mid-Market AE', 'Enterprise AE',
  'Sales Manager', 'Head of Sales', 'VP Sales',
];

const SENIORITY_OPTIONS = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Director', 'VP'];
const COUNTRY_OPTIONS = ['Deutschland', 'Österreich', 'Schweiz'];
const WORK_MODEL_OPTIONS = ['Remote', 'Hybrid', 'Vor Ort'];
const COMPANY_SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '5000+'];
const JOB_REFERENCE_OPTIONS = ['Aktuelle Stelle', 'Laufender Bewerbungsprozess', 'Erhaltenes Angebot', 'Vergleich mit konkreter Ausschreibung'];

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('reports');
  const [contributeMode, setContributeMode] = useState<ReportMode>('general');
  const [contributeForm, setContributeForm] = useState({
    role: '',
    seniority: '',
    country: '',
    region: '',
    baseSalary: '',
    ote: '',
    variableComp: '',
    companySize: '',
    workModel: '',
    yearsExperience: '',
    industry: '',
    comment: '',
    referenceType: '',
    referenceJobTitle: '',
    referenceContext: '',
    referenceEmployerStage: '',
  });
  const [submitState, setSubmitState] = useState({ loading: false, success: false, error: '' });

  const resetContributeForm = () => ({
    role: '',
    seniority: '',
    country: '',
    region: '',
    baseSalary: '',
    ote: '',
    variableComp: '',
    companySize: '',
    workModel: '',
    yearsExperience: '',
    industry: '',
    comment: '',
    referenceType: '',
    referenceJobTitle: '',
    referenceContext: '',
    referenceEmployerStage: '',
  });

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState({ loading: true, success: false, error: '' });
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitState({ loading: false, success: true, error: '' });
    setContributeForm(resetContributeForm());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground mt-1">Gehälter, Trends und Karriere-Tipps für Sales Professionals</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Ø Base Salary (AE)" value="65.000 €" change="+5%" />
            <MetricCard label="Ø OTE (AE)" value="105.000 €" change="+8%" />
            <MetricCard label="Ø OTE (Enterprise)" value="160.000 €" change="+12%" />
            <MetricCard label="Reports eingereicht" value="847" />
          </div>

          {/* Summary text */}
          <div className="rounded-xl border bg-background p-5">
            <h3 className="font-semibold mb-2">Gehaltsübersicht DACH 2025</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Die Vergütung im B2B SaaS Sales steigt weiter. Besonders Enterprise-Rollen profitieren von der hohen Nachfrage.
              Remote-Positionen zahlen im Schnitt 5-10% weniger als Vor-Ort-Rollen, bieten aber höhere Flexibilität.
              Die Schweiz bleibt mit 20-30% höheren OTEs der bestbezahlte Markt in der DACH-Region.
            </p>
          </div>

          {/* Salary table */}
          <div className="rounded-xl border bg-background overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold">OTE Benchmarks nach Rolle</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Basierend auf Daten aus dem DACH-Raum, 2024/2025</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Rolle</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Base Salary</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">OTE Range</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Median OTE</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {SALARY_DATA.map((row) => (
                    <tr key={row.role} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium">{row.role}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.base}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.ote}</td>
                      <td className="px-5 py-3 font-semibold text-primary">{row.median}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bar chart visualization */}
          <div className="rounded-xl border bg-background p-5">
            <h3 className="font-semibold mb-4">Median OTE nach Rolle</h3>
            <div className="space-y-3">
              {SALARY_DATA.map((row) => {
                const value = parseInt(row.median.replace(/[^0-9]/g, ''));
                const maxValue = 230000;
                const pct = (value / maxValue) * 100;
                return (
                  <div key={row.role} className="flex items-center gap-3">
                    <span className="w-32 text-sm text-muted-foreground truncate shrink-0">{row.role}</span>
                    <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/80 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-24 text-right shrink-0">{row.median}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid gap-4">
          {TREND_ARTICLES.map((article) => (
            <article key={article.id} className="group rounded-xl border bg-background p-5 hover:shadow-md hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readingTime} Min. Lesezeit
                    </span>
                    <span>{new Date(article.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40 mt-1 shrink-0" />
              </div>
            </article>
          ))}
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CAREER_TIPS.map((tip) => (
            <article key={tip.id} className="group rounded-xl border bg-background p-5 hover:shadow-md hover:border-primary/20 transition-all">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{tip.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">{tip.excerpt}</p>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Clock className="h-3 w-3" />{tip.readingTime} Min. Lesezeit
              </p>
            </article>
          ))}

          {/* CTA card */}
          <div className="rounded-xl border border-dashed bg-muted/20 p-5 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium mb-1">Mehr Tipps bald verfügbar</p>
            <p className="text-xs text-muted-foreground">Wir arbeiten an weiteren Karriere-Guides für Sales Professionals.</p>
          </div>
        </div>
      )}

      {activeTab === 'contribute' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="rounded-[28px] border bg-background p-6 shadow-sm lg:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Salary Intelligence</p>
              <h2 className="mt-2 text-xl font-semibold">Gehaltsreport einreichen</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Teile anonym deine Vergütung und hilf anderen Sales Professionals mit realistischeren Benchmarks.
              </p>
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-2">
              <ContributionModeCard
                title="Allgemeiner Report"
                description="Für deine aktuelle oder letzte Rolle, unabhängig von einer konkreten Stelle."
                active={contributeMode === 'general'}
                icon={BarChart3}
                onClick={() => setContributeMode('general')}
              />
              <ContributionModeCard
                title="Stellenbezogener Report"
                description="Wenn sich dein Gehalt direkt auf eine konkrete Rolle, Ausschreibung oder ein Angebot bezieht."
                active={contributeMode === 'job'}
                icon={BriefcaseBusiness}
                onClick={() => setContributeMode('job')}
              />
            </div>

            {submitState.success ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Vielen Dank!</h3>
                <p className="text-sm text-muted-foreground mb-4">Dein Report wurde erfolgreich eingereicht.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSubmitState({ loading: false, success: false, error: '' });
                    setContributeForm(resetContributeForm());
                  }}
                >
                  Weiteren Report einreichen
                </Button>
              </div>
            ) : (
              <form onSubmit={handleContributeSubmit} className="space-y-5">
                {contributeMode === 'job' && (
                  <div className="rounded-3xl border border-border/70 bg-muted/20 p-4">
                    <div className="mb-4">
                      <p className="text-sm font-semibold">Stellenbezug</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Gib an, worauf sich der Report konkret bezieht, damit Benchmarks später kontextbezogen ausgewertet werden können.
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormSelect
                        label="Bezug *"
                        value={contributeForm.referenceType}
                        onChange={(v) => setContributeForm((p) => ({ ...p, referenceType: v }))}
                        options={JOB_REFERENCE_OPTIONS}
                        required
                      />
                      <FormField
                        label="Jobtitel / Stelle *"
                        value={contributeForm.referenceJobTitle}
                        onChange={(v) => setContributeForm((p) => ({ ...p, referenceJobTitle: v }))}
                        placeholder="z. B. Enterprise AE DACH"
                        required
                      />
                      <FormField
                        label="Kontext / Firma"
                        value={contributeForm.referenceContext}
                        onChange={(v) => setContributeForm((p) => ({ ...p, referenceContext: v }))}
                        placeholder="z. B. Series B SaaS, HealthTech"
                      />
                      <FormField
                        label="Phase / Anlass"
                        value={contributeForm.referenceEmployerStage}
                        onChange={(v) => setContributeForm((p) => ({ ...p, referenceEmployerStage: v }))}
                        placeholder="z. B. Erstangebot oder finaler Prozess"
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FormSelect
                    label="Aktuelle Rolle *"
                    value={contributeForm.role}
                    onChange={(v) => setContributeForm((p) => ({ ...p, role: v }))}
                    options={ROLE_OPTIONS}
                    required
                  />
                  <FormSelect
                    label="Seniorität *"
                    value={contributeForm.seniority}
                    onChange={(v) => setContributeForm((p) => ({ ...p, seniority: v }))}
                    options={SENIORITY_OPTIONS}
                    required
                  />
                  <FormSelect
                    label="Land *"
                    value={contributeForm.country}
                    onChange={(v) => setContributeForm((p) => ({ ...p, country: v }))}
                    options={COUNTRY_OPTIONS}
                    required
                  />
                  <FormField
                    label="Stadt / Region"
                    value={contributeForm.region}
                    onChange={(v) => setContributeForm((p) => ({ ...p, region: v }))}
                    placeholder="z.B. München"
                  />
                  <FormField
                    label="Base Salary (€) *"
                    value={contributeForm.baseSalary}
                    onChange={(v) => setContributeForm((p) => ({ ...p, baseSalary: v }))}
                    type="number"
                    required
                  />
                  <FormField
                    label="OTE (€) *"
                    value={contributeForm.ote}
                    onChange={(v) => setContributeForm((p) => ({ ...p, ote: v }))}
                    type="number"
                    required
                  />
                  <FormField
                    label="Variable Komponente (€)"
                    value={contributeForm.variableComp}
                    onChange={(v) => setContributeForm((p) => ({ ...p, variableComp: v }))}
                    type="number"
                  />
                  <FormSelect
                    label="Unternehmensgröße"
                    value={contributeForm.companySize}
                    onChange={(v) => setContributeForm((p) => ({ ...p, companySize: v }))}
                    options={COMPANY_SIZE_OPTIONS}
                  />
                  <FormSelect
                    label="Arbeitsmodell *"
                    value={contributeForm.workModel}
                    onChange={(v) => setContributeForm((p) => ({ ...p, workModel: v }))}
                    options={WORK_MODEL_OPTIONS}
                    required
                  />
                  <FormField
                    label="Jahre Erfahrung *"
                    value={contributeForm.yearsExperience}
                    onChange={(v) => setContributeForm((p) => ({ ...p, yearsExperience: v }))}
                    type="number"
                    required
                  />
                  <FormField
                    label="Branche"
                    value={contributeForm.industry}
                    onChange={(v) => setContributeForm((p) => ({ ...p, industry: v }))}
                    placeholder="z.B. SaaS, FinTech"
                    className="md:col-span-2 xl:col-span-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Kommentar (optional)</label>
                  <textarea
                    value={contributeForm.comment}
                    onChange={(e) => setContributeForm((p) => ({ ...p, comment: e.target.value }))}
                    rows={4}
                    className="w-full rounded-2xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder={contributeMode === 'job' ? 'Zusätzliche Hinweise zur konkreten Stelle oder zum Angebot...' : 'Zusätzliche Hinweise zu deiner Vergütung...'}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/50 p-4">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <FileText className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                    <span>
                      Deine Angaben werden anonym gespeichert und ausschließlich für aggregierte Gehaltsstatistiken verwendet.
                      Es werden keine personenbezogenen Daten veröffentlicht.
                    </span>
                  </div>
                  <Button type="submit" disabled={submitState.loading} className="w-full sm:w-auto">
                    {submitState.loading ? 'Wird eingereicht...' : 'Report einreichen'}
                  </Button>
                </div>

                {submitState.error && (
                  <p className="text-sm text-destructive">{submitState.error}</p>
                )}
              </form>
            )}
          </div>

          <div className="space-y-4">
            <SidebarNoteCard
              title={contributeMode === 'general' ? 'Was ist enthalten?' : 'Warum stellenbezogen?'}
              icon={contributeMode === 'general' ? BarChart3 : BriefcaseBusiness}
            >
              <div className="space-y-2 text-sm text-muted-foreground">
                {contributeMode === 'general' ? (
                  <>
                    <p>Ideal für deine aktuelle oder letzte Rolle.</p>
                    <p>Hilft beim Aufbau belastbarer Benchmarks nach Rolle, Seniorität, Region und Setup.</p>
                  </>
                ) : (
                  <>
                    <p>Ideal, wenn dein Gehalt direkt an eine konkrete Stelle oder ein Angebot gekoppelt war.</p>
                    <p>So lassen sich Benchmarks künftig genauer an Jobtyp, Kontext und Prozessphase ausrichten.</p>
                  </>
                )}
              </div>
            </SidebarNoteCard>

            <SidebarNoteCard title="Anonym & aggregiert" icon={Users}>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Keine Veröffentlichung personenbezogener Daten.</p>
                <p>Nur aggregierte Auswertung nach Rolle, Region, Seniorität und Arbeitsmodell.</p>
              </div>
            </SidebarNoteCard>

            <div className="rounded-3xl border border-border/70 bg-background p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Dein Report</p>
              <div className="mt-4 space-y-3">
                <PreviewRow label="Modus" value={contributeMode === 'general' ? 'Allgemeiner Report' : 'Stellenbezogener Report'} />
                <PreviewRow label="Rolle" value={contributeForm.role || 'Noch nicht gewählt'} />
                <PreviewRow label="Region" value={[contributeForm.region, contributeForm.country].filter(Boolean).join(', ') || 'Noch nicht gewählt'} />
                <PreviewRow label="OTE" value={contributeForm.ote ? `${contributeForm.ote} €` : 'Noch nicht angegeben'} />
                {contributeMode === 'job' && (
                  <PreviewRow label="Stelle" value={contributeForm.referenceJobTitle || 'Noch nicht angegeben'} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, change }: { label: string; value: string; change?: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-xl font-bold">{value}</span>
        {change && (
          <span className="text-xs font-medium text-emerald-600">{change}</span>
        )}
      </div>
    </div>
  );
}

function ContributionModeCard({
  title,
  description,
  active,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left transition-all ${
        active
          ? 'border-primary/30 bg-primary/5 shadow-sm'
          : 'bg-background hover:border-primary/20 hover:bg-muted/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

function SidebarNoteCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 px-3 py-2.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
      >
        <option value="">Auswählen...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
