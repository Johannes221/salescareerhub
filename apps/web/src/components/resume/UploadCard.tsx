'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface UploadCardProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  hasExistingData: boolean;
  onDemoExtract?: () => void;
}

export function UploadCard({ onFileSelected, isLoading, hasExistingData, onDemoExtract }: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setFileError(null);

      if (file.type !== 'application/pdf') {
        setFileError('Nur PDF-Dateien sind erlaubt.');
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`Die Datei ist zu groß. Maximale Größe: ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }

      setSelectedFileName(file.name);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [validateAndSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  return (
    <Card className="border-2 border-dashed transition-colors duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          Lebenslauf hochladen
        </CardTitle>
        <CardDescription>
          Laden Sie Ihren Lebenslauf als PDF hoch, um das Formular automatisch vorzubefüllen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            isLoading && 'pointer-events-none opacity-60',
          )}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Lebenslauf wird analysiert...</p>
              <p className="text-xs text-muted-foreground">Dies kann einige Sekunden dauern.</p>
            </div>
          ) : (
            <>
              <svg className="mb-3 h-10 w-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <p className="mb-1 text-sm font-medium">PDF hierher ziehen oder klicken zum Auswählen</p>
              <p className="text-xs text-muted-foreground">Maximal {MAX_FILE_SIZE_MB} MB, nur PDF</p>
              {selectedFileName && !fileError && (
                <p className="mt-2 text-xs text-primary font-medium">{selectedFileName}</p>
              )}
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={isLoading}
            aria-label="PDF-Lebenslauf hochladen"
          />
        </div>

        {fileError && (
          <div className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {fileError}
          </div>
        )}

        {hasExistingData && !isLoading && (
          <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            Achtung: Ein erneuter Upload überschreibt die bereits eingetragenen Formulardaten.
          </div>
        )}

        {onDemoExtract && !isLoading && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onDemoExtract}
              disabled={isLoading}
              className="text-xs"
            >
              Demo-Daten laden (ohne Upload)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
