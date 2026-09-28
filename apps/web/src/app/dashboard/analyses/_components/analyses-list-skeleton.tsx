import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalysesListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="hidden h-3 w-28 sm:block" />
              <Skeleton className="size-9" />
              <Skeleton className="size-4" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}