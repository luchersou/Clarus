import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

interface RecentAnalysis {
  id: string;
  type: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

interface RecentAnalysesCardClientProps {
  analyses: RecentAnalysis[];
  hasDocuments: boolean;
}

const STATUS_STYLES: Record<RecentAnalysis["status"], string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  COMPLETED: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
  FAILED: "border-destructive/30 bg-destructive/10 text-destructive",
};

const TYPE_LABEL: Record<string, string> = {
  SUMMARY: "Summary",
  EXTRACT_VALUES: "Extract values",
  DEADLINES: "Deadlines",
  COMPARE: "Comparison",
};

export function RecentAnalysesCardClient({ analyses, hasDocuments }: RecentAnalysesCardClientProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base">Recent analyses</CardTitle>
        <Button
          nativeButton={false}
          size="sm"
          variant="ghost"
          render={<Link href="/dashboard/analyses" />}
        >
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {analyses.length === 0 ? (
          <div className="flex flex-col items-center rounded-sm border border-dashed p-8 text-center">
            <p className="text-sm font-medium text-foreground">No analyses yet</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              {hasDocuments
                ? "Pick a document and run your first analysis."
                : "Upload a document first, then run your first analysis."}
            </p>
            <Button
              nativeButton={false}
              size="sm"
              className="mt-4"
              render={
                <Link
                  href={hasDocuments ? "/dashboard/analyses" : "/dashboard/documents"}
                />
              }
            >
              {hasDocuments ? "Run your first analysis" : "Upload your first document"}
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {TYPE_LABEL[analysis.type] ?? analysis.type}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(analysis.createdAt)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0", STATUS_STYLES[analysis.status])}
                >
                  {analysis.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}