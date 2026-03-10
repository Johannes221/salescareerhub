import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gehaltsübersicht Software Sales',
  description: 'Aktuelle Gehaltsdaten für Software Sales Rollen im DACH-Raum – Base Salary und OTE für SDR, AE, Enterprise AE, Head of Sales und mehr.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
