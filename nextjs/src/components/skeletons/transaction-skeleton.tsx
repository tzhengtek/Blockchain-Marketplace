import { Skeleton } from "@/components/atoms/skeleton";

export function TransactionSkeleton() {
  return (
    <section className="p-8">
      {/* Header Skeleton */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute left-0">
          <Skeleton className="w-20 h-8" />
        </div>
        <Skeleton className="w-56 h-8" />
      </div>

      {/* Search Inputs Skeleton */}
      <div className="flex items-center gap-4 flex-wrap mb-8">
        <Skeleton className="w-[400px] h-10 rounded-lg" />
        <Skeleton className="w-[400px] h-10 rounded-lg" />
        <Skeleton className="w-[400px] h-10 rounded-lg" />
      </div>

      {/* Table Header Skeleton */}
      <div className="grid grid-cols-[180px_180px_180px_180px_180px_180px_180px_180px] items-center gap-x-[22px] font-semibold py-2.5 px-4 border-b-[3px] border-[#242936]">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20" />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[180px_180px_180px_180px_180px_180px_180px_180px] items-center gap-x-[22px] py-3.5 px-4 border-b border-[#242936] bg-transparent"
        >
          {Array.from({ length: 8 }).map((_, j) => (
            <Skeleton key={j} className="h-6 w-full rounded" />
          ))}
        </div>
      ))}

      {/* Pagination Skeleton */}
      <div className="flex gap-1.5 items-center justify-center mt-4 flex-wrap">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-md" />
        ))}
      </div>
    </section>
  );
}
