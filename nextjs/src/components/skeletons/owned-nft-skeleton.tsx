import { Skeleton } from "@/components/atoms/skeleton";

export function OwnedNftSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/10 bg-white/5 overflow-hidden"
          >
            {/* Image Skeleton */}
            <Skeleton className="w-full aspect-square" />

            {/* Content Skeleton */}
            <div className="p-3 space-y-2">
              <Skeleton className="h-5 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="pt-2 border-t border-white/10">
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
