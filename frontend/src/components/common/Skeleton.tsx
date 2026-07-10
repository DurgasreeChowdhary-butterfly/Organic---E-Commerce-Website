import clsx from "clsx";

/** Simple pulsing placeholder block used while dummy data "loads". */
export default function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-xl bg-beige/70", className)} />;
}

/** Grid of card-shaped skeletons, matching ProductGrid's layout. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-white p-4 shadow-soft">
          <Skeleton className="aspect-square rounded-2xl mb-3" />
          <Skeleton className="h-3 w-1/3 mb-2" />
          <Skeleton className="h-4 w-4/5 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <Skeleton className="h-9 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Row-shaped skeletons for admin tables / list pages. */
export function TableRowsSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-beige/60">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
