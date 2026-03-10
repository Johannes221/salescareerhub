import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Karriere-Guides & Insights',
  description: 'Tipps, Reports und Insights für deine Software Sales Karriere – Gehaltsverhandlung, Karrierepfad, Marktreports und mehr.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
