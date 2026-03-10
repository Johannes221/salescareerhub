import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Für Kandidaten – Software Sales Karriere',
  description: 'Transparente Gehälter, ehrliche Bewertungen und persönliche Recruiting-Begleitung für deine nächste Software Sales Rolle im DACH-Raum.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
