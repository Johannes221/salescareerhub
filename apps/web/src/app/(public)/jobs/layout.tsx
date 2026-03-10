import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software Sales Jobs im DACH-Raum',
  description: 'Spezialisierte Software Sales Positionen – SDR, Account Executive, Enterprise AE, Head of Sales und mehr. Transparente Gehälter und persönliche Recruiting-Begleitung.',
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
