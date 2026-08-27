export default function StratCardSkeleton() {
  return (
    <div className="bg-surface-container/60 tactical-glass flex flex-col justify-between overflow-hidden rounded-lg border border-white/5 p-5 shadow-lg">
      <div>
        {/* Header Skeleton */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-surface-variant/40 h-5 w-16 animate-pulse rounded" />
            <div className="bg-surface-variant/40 h-5 w-14 animate-pulse rounded" />
          </div>
          <div className="bg-surface-variant/40 h-4 w-12 animate-pulse rounded" />
        </div>

        {/* Title and Description */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="bg-surface-variant/60 h-6 w-3/4 animate-pulse rounded" />
          <div className="bg-surface-variant/30 h-4 w-full animate-pulse rounded" />
          <div className="bg-surface-variant/30 h-4 w-2/3 animate-pulse rounded" />
        </div>

        {/* Metrics/Badges */}
        <div className="mt-5 flex flex-wrap gap-2">
          <div className="bg-surface-variant/40 h-6 w-20 animate-pulse rounded-full" />
          <div className="bg-surface-variant/40 h-6 w-20 animate-pulse rounded-full" />
          <div className="bg-surface-variant/40 h-6 w-24 animate-pulse rounded-full" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-surface-variant/50 h-7 w-7 animate-pulse rounded-full" />
          <div className="flex flex-col gap-1">
            <div className="bg-surface-variant/40 h-3 w-20 animate-pulse rounded" />
            <div className="bg-surface-variant/30 h-2.5 w-14 animate-pulse rounded" />
          </div>
        </div>
        <div className="bg-surface-variant/50 h-8 w-28 animate-pulse rounded" />
      </div>
    </div>
  );
}
