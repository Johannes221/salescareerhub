export type DailySeriesPoint = {
  date: string;
  label: string;
  value: number;
};

export function getAnalyticsWindowStart(days = 7) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (days - 1));
  return date;
}

export function buildDailySeries(entries: Array<{ createdAt: Date | string }>, days = 7): DailySeriesPoint[] {
  const start = getAnalyticsWindowStart(days);
  const buckets = new Map<string, number>();

  for (let i = 0; i < days; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, value]) => {
    const parsed = new Date(date);
    return {
      date,
      label: parsed.toLocaleDateString('de-DE', { weekday: 'short' }),
      value,
    };
  });
}
