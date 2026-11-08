import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalysesListSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="flex-row items-center gap-3 px-4 py-3.5">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="size-7" />
        </Card>
      ))}
    </div>
  );
}
