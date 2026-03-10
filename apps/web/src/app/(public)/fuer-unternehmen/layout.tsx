import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Für Unternehmen – Jobs kostenlos listen',
  description: 'Listen Sie Ihre Software Sales Positionen kostenlos auf der spezialisierten Plattform. Qualifizierte Kandidaten, persönliches Screening, optionale Recruiting-Begleitung.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
