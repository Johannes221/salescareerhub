'use client';

import React from 'react';

interface PrivacyNoticeProps {
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
}

export function PrivacyNotice({ accepted, onAcceptChange }: PrivacyNoticeProps) {
  return (
    <div className="rounded-md border bg-muted/30 px-4 py-3">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <p>
            Mit dem Upload bestätige ich, dass meine Bewerbungsdaten zum Zweck der automatischen
            Vorbefüllung verarbeitet werden.
          </p>
          <ul className="mt-1.5 space-y-0.5 list-disc pl-4">
            <li>Der Lebenslauf wird nur zur automatischen Vorbefüllung verarbeitet.</li>
            <li>Die Datei wird nicht dauerhaft gespeichert.</li>
            <li>Ich prüfe die erkannten Daten vor der Weiterverwendung.</li>
          </ul>
          <p className="mt-1.5">
            Weitere Informationen finden Sie in unserer{' '}
            <a href="/datenschutz" className="text-primary underline hover:text-primary/80">
              Datenschutzerklärung
            </a>.
          </p>
        </div>
      </label>
    </div>
  );
}
