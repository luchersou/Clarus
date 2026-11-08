import { Skeleton } from "@/components/ui/skeleton";

export function NewAnalysisFormSkeleton() {
  return (
    <div className="rounded-xl border bg-card" aria-hidden="true">
      <div className="space-y-2 border-b px-5 py-4 md:px-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {Array.from({ length: 2 }).map((_, column) => (
          <div key={column} className="space-y-4 px-5 py-5 md:px-6">
            <div className="flex items-start gap-3">
              <Skeleton className="size-6 rounded-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, row) => (
                <Skeleton key={row} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t px-5 py-4 md:px-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}
