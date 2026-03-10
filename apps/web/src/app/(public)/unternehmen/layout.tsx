import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unternehmen – Software Sales Arbeitgeber',
  description: 'Software Sales Arbeitgeber im DACH-Raum entdecken – verifizierte Unternehmen mit Bewertungen, Benefits und offenen Stellen.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
