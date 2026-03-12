'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectFilterProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  placeholder,
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const displayText =
    selected.length === 0
      ? placeholder || label
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label || selected[0]
        : `${selected.length} ausgewählt`;

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-lg border bg-background px-3 text-sm transition-colors',
          'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring/20',
          selected.length > 0 && 'border-primary/30 bg-primary/5',
          open && 'ring-2 ring-ring/20'
        )}
      >
        <span className={cn('truncate', selected.length === 0 && 'text-muted-foreground')}>
          {displayText}
        </span>
        <ChevronDown className={cn('ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[200px] rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="max-h-[240px] overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors',
                    'hover:bg-accent',
                    isSelected && 'bg-primary/5 font-medium'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                      isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="border-t mt-1 pt-1">
              <button
                type="button"
                onClick={() => onChange([])}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
              >
                <X className="h-3 w-3" />
                Auswahl zurücksetzen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ActiveFilterChips({
  filters,
  labels,
  onRemove,
  onClearAll,
}: {
  filters: Record<string, string[]>;
  labels: Record<string, Record<string, string>>;
  onRemove: (group: string, value: string) => void;
  onClearAll: () => void;
}) {
  const allChips = Object.entries(filters).flatMap(([group, values]) =>
    values.map((value) => ({
      group,
      value,
      label: labels[group]?.[value] || value,
    }))
  );

  if (allChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {allChips.map((chip) => (
        <span
          key={`${chip.group}-${chip.value}`}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.group, chip.value)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
      >
        Alle entfernen
      </button>
    </div>
  );
}
