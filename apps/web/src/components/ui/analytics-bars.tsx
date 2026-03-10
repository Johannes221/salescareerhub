import { cn } from '@/lib/utils';

type AnalyticsPoint = {
  label: string;
  value: number;
};

type AnalyticsBarsProps = {
  points: AnalyticsPoint[];
  className?: string;
  barClassName?: string;
  valueLabel?: string;
};

export function AnalyticsBars({ points, className, barClassName, valueLabel }: AnalyticsBarsProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className={cn('grid grid-cols-7 gap-2', className)}>
      {points.map((point) => {
        const height = Math.max((point.value / maxValue) * 100, point.value > 0 ? 14 : 6);

        return (
          <div key={point.label} className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-medium text-muted-foreground">{point.value}{valueLabel ? ` ${valueLabel}` : ''}</span>
            <div className="flex h-28 w-full items-end justify-center rounded-md bg-muted/40 px-1 py-1">
              <div
                className={cn('w-full rounded-sm bg-primary/80 transition-all', barClassName)}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}
