'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertTriangle className="h-20 w-20 text-destructive mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-2">Ein Fehler ist aufgetreten</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Etwas ist schiefgelaufen. Bitte versuche es erneut oder kontaktiere uns, falls das Problem weiterhin besteht.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Erneut versuchen</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>Zur Startseite</Button>
        </div>
      </div>
    </div>
  );
}
