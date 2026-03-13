import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Für Kandidaten – Software Sales Karriere',
  description: 'Persönliche Recruiting-Begleitung für Einsteiger, Quereinsteiger und erfahrene Kandidaten im Software Sales – vertraulich, individuell und kostenlos für Bewerber.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
