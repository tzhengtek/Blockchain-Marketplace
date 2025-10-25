import { Skeleton } from "@/components/atoms/skeleton";

export function NftSkeleton() {
  return (
    <div className="p-8">
      {/* Header Skeleton */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute left-0">
          <Skeleton className="w-20 h-8" />
        </div>
        <Skeleton className="w-48 h-8" />
      </div>

      {/* Search Input Skeleton */}
      <div className="flex items-center gap-4 flex-wrap mb-8">
        <Skeleton className="w-[400px] h-10 rounded-lg" />
      </div>

      {/* Table Header Skeleton */}
      <div className="grid grid-cols-[1fr_120px_1fr] items-center gap-x-[22px] font-semibold py-2.5 px-4 border-b-[3px] border-[#242936]">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Table Rows Skeleton */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_120px_1fr] items-center gap-x-[22px] py-3.5 px-4 border-b border-[#242936] bg-transparent"
        >
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-6 w-full rounded" />
        </div>
      ))}

      {/* Pagination Skeleton */}
      <div className="flex gap-1.5 items-center justify-center mt-4 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-md" />
        ))}
      </div>
    </div>
  );
}
