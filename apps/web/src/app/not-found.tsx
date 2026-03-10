import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <FileQuestion className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-4">Seite nicht gefunden</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/"><Button>Zur Startseite</Button></Link>
          <Link href="/jobs"><Button variant="outline">Jobs entdecken</Button></Link>
        </div>
      </div>
    </div>
  );
}
