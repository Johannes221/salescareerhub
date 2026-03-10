import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-lg border p-6 space-y-3">
      <Skeleton className="h-5 w-1/3" />
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 p-3">
        {[...Array(cols)].map((_, i) => <Skeleton key={i} className="h-4 flex-1" />)}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border-t">
          {[...Array(cols)].map((_, j) => <Skeleton key={j} className="h-4 flex-1" />)}
        </div>
      ))}
    </div>
  );
}

function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-7 w-12" />
          </div>
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonList, SkeletonStats };
