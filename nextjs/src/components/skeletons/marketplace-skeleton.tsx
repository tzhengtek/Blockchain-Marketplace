import { Skeleton } from "@/components/atoms/skeleton";

export function MarketplaceSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0f] via-[#111122] to-[#0b0b0f] p-8">
      {/* Header Skeleton */}
      <Skeleton className="h-10 w-64 mb-8" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/10 bg-white/5 overflow-hidden"
          >
            {/* Image Skeleton */}
            <Skeleton className="w-full aspect-square" />

            {/* Content Skeleton */}
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
