import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const STATUS_VARIANT: Record<RecentAnalysis["status"], "outline" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  COMPLETED: "outline",
  FAILED: "destructive",
};

const TYPE_LABEL: Record<string, string> = {
  SUMMARY: "Summary",
  EXTRACT_VALUES: "Extract values",
  DEADLINES: "Deadlines",
  COMPARE: "Comparison",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
                <Badge variant={STATUS_VARIANT[analysis.status]} className="shrink-0">
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