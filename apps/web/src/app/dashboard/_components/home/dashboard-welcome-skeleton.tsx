import { Skeleton } from "@/components/ui/skeleton";

export function DashboardWelcomeSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8" aria-hidden="true">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-8 w-64 md:h-9 md:w-80" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  );
}
