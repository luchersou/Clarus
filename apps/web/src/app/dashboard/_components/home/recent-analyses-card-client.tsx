import Link from "next/link";
import { CalendarClock, ChevronRight, FileSearch, GitCompare, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AnalysisStatusBadge } from "@/app/dashboard/analyses/_components/analysis-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

interface RecentAnalysis {
  id: string;
  documentId: string;
  type: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

interface RecentAnalysesCardClientProps {
  analyses: RecentAnalysis[];
  documentNames: Record<string, string>;
  hasDocuments: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  SUMMARY: { label: "Summary", icon: FileSearch },
  EXTRACT_VALUES: { label: "Extract values", icon: ListChecks },
  DEADLINES: { label: "Deadlines", icon: CalendarClock },
  COMPARE: { label: "Comparison", icon: GitCompare },
};

export function RecentAnalysesCardClient({
  analyses,
  documentNames,
  hasDocuments,
}: RecentAnalysesCardClientProps) {
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
          <div className="flex flex-col items-center rounded-lg border border-dashed p-8 text-center">
            <FileSearch className="size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No analyses yet</p>
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
                <Link href={hasDocuments ? "/dashboard/analyses" : "/dashboard/documents"} />
              }
            >
              {hasDocuments ? "Run your first analysis" : "Upload your first document"}
            </Button>
          </div>
        ) : (
          <ul className="-mx-2 space-y-1">
            {analyses.map((analysis) => {
              const type = TYPE_CONFIG[analysis.type] ?? {
                label: analysis.type,
                icon: FileSearch,
              };
              const documentName = documentNames[analysis.documentId] ?? "Deleted document";

              return (
                <li key={analysis.id}>
                  <Link
                    href={`/dashboard/analyses?documentId=${analysis.documentId}`}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2.5 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                      <type.icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{type.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {documentName} &middot; {formatRelativeTime(analysis.createdAt)}
                      </p>
                    </div>
                    <AnalysisStatusBadge status={analysis.status} />
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
