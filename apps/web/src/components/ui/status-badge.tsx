'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  interest_expressed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  screening: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  shortlisted: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  forwarded: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  interview_1: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  interview_2: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  offer: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  hired: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  withdrawn: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  action_required: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
};

const STATUS_LABELS: Record<string, string> = {
  interest_expressed: 'Beworben',
  screening: 'In Prüfung',
  shortlisted: 'Vorausgewählt',
  forwarded: 'Weitergeleitet',
  interview_1: 'Erstgespräch',
  interview_2: 'Fachgespräch',
  offer: 'Angebot',
  hired: 'Eingestellt',
  rejected: 'Absage',
  withdrawn: 'Zurückgezogen',
  active: 'Aktiv',
  pending: 'Ausstehend',
  action_required: 'Handlung nötig',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, label, showDot = true, size = 'sm', className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const displayLabel = label || STATUS_LABELS[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        style.bg,
        style.text,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />}
      {displayLabel}
    </span>
  );
}
