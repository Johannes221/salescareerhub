'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getIdToken } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { Camera, Loader2, Trash2, User as UserIcon } from 'lucide-react';

function getInitials(name?: string | null) {
  const normalized = String(name || '').trim();
  if (!normalized) return 'P';
  const parts = normalized.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'P';
}

export function ProfileAvatarUploader({
  imageUrl,
  name,
  compact = false,
  onChange,
}: {
  imageUrl?: string | null;
  name?: string | null;
  compact?: boolean;
  onChange?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Bitte lade ein JPG-, PNG- oder WebP-Bild hoch.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Das Profilbild darf maximal 5 MB groß sein.');
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const token = await getIdToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/candidate/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Profilbild konnte nicht hochgeladen werden.');
      }

      setSuccess('Profilbild aktualisiert.');
      onChange?.();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Profilbild konnte nicht hochgeladen werden.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemove = async () => {
    setError('');
    setSuccess('');
    setRemoving(true);

    try {
      const token = await getIdToken();
      const response = await fetch('/api/candidate/avatar', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Profilbild konnte nicht entfernt werden.');
      }

      setSuccess('Profilbild entfernt.');
      onChange?.();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Profilbild konnte nicht entfernt werden.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className={cn('flex gap-4', compact ? 'items-center' : 'items-start')}>
        <div className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted text-foreground',
          compact ? 'h-20 w-20' : 'h-24 w-24',
        )}>
          {imageUrl ? (
            <img src={imageUrl} alt={name || 'Profilbild'} className="h-full w-full object-cover" />
          ) : (
            <span className={cn('font-semibold', compact ? 'text-xl' : 'text-2xl')}>{getInitials(name)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-sm font-semibold">Optionales Profilbild</p>
            <p className="text-xs leading-5 text-muted-foreground">
              Ein freundliches Bild macht dein Profil persönlicher. Unterstützt werden JPG, PNG und WebP bis 5 MB.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || removing}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {imageUrl ? 'Bild ändern' : 'Bild hochladen'}
            </Button>
            {imageUrl ? (
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-muted-foreground"
                onClick={handleRemove}
                disabled={uploading || removing}
              >
                {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Entfernen
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {success ? <p className="text-xs text-primary">{success}</p> : null}
      {!imageUrl && !error && !success ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <UserIcon className="h-3.5 w-3.5" />
          <span>Du kannst diesen Schritt jederzeit überspringen und später ergänzen.</span>
        </div>
      ) : null}
    </div>
  );
}
