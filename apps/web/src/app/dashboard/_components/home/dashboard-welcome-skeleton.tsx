import { Skeleton } from "@/components/ui/skeleton";

export function DashboardWelcomeSkeleton() {
  return (
    <div
      className="rounded-sm border bg-card p-6 shadow-sm md:p-8"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-8 w-64 md:h-9 md:w-80" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-2/3 max-w-sm" />
          </div>
        </div>

        <div className="flex w-full max-w-44 shrink-0 flex-col gap-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}