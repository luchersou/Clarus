import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentAnalysesCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-8 w-16" />
      </CardHeader>

      <CardContent>
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-2.5">
              <Skeleton className="size-9 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
