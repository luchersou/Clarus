import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NewAnalysisFormSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader>
        <CardTitle className="text-base">New analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>

        <Skeleton className="h-9 w-full sm:w-32" />
      </CardContent>
    </Card>
  );
}