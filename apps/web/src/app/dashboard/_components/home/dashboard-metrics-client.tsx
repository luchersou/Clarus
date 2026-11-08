import Link from "next/link";
import { FileText, Gauge, Hourglass } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisQuota } from "@/lib/api/analyses";
import { cn } from "@/lib/utils";

interface DashboardMetricsClientProps {
  documentsCount: number;
  documentsReadyCount: number;
  documentsProcessingCount: number;
  documentsFailedCount: number;
  analysesPendingCount: number;
  quota: AnalysisQuota | null;
}

interface MetricCardProps {
  label: string;
  icon: LucideIcon;
  href: string;
  children: React.ReactNode;
}

function MetricCard({ label, icon: Icon, href, children }: MetricCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-3 transition-shadow group-hover:ring-primary/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </CardTitle>
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        </CardHeader>
        <CardContent className="space-y-2">{children}</CardContent>
      </Card>
    </Link>
  );
}

export function DashboardMetricsClient({
  documentsCount,
  documentsReadyCount,
  documentsProcessingCount,
  documentsFailedCount,
  analysesPendingCount,
  quota,
}: DashboardMetricsClientProps) {
  const documentBreakdown = [
    { count: documentsReadyCount, label: "ready", dot: "bg-emerald-500" },
    { count: documentsProcessingCount, label: "processing", dot: "bg-amber-500" },
    { count: documentsFailedCount, label: "failed", dot: "bg-destructive" },
  ].filter((item) => item.count > 0);

  const quotaPercent =
    quota && quota.limit > 0 ? Math.min(100, (quota.used / quota.limit) * 100) : 0;
  const quotaReached = quota !== null && quota.remaining === 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3" aria-label="Workspace totals">
      <MetricCard label="Documents" icon={FileText} href="/dashboard/documents">
        <p className="text-3xl font-bold tabular-nums">{documentsCount}</p>
        {documentBreakdown.length > 0 ? (
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {documentBreakdown.map((item) => (
              <li key={item.label} className="flex items-center gap-1.5">
                <span aria-hidden="true" className={cn("size-1.5 rounded-full", item.dot)} />
                {item.count} {item.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No documents uploaded yet</p>
        )}
      </MetricCard>

      <MetricCard label="Analyses running" icon={Hourglass} href="/dashboard/analyses">
        <p className="text-3xl font-bold tabular-nums">{analysesPendingCount}</p>
        <p className="text-xs text-muted-foreground">
          {analysesPendingCount > 0
            ? "Results appear here once they finish"
            : "Nothing in the queue right now"}
        </p>
      </MetricCard>

      <MetricCard label="Analyses today" icon={Gauge} href="/dashboard/analyses">
        {quota ? (
          <>
            <p className="text-3xl font-bold tabular-nums">
              {quota.used}
              <span className="text-base font-medium text-muted-foreground">
                {" "}/ {quota.limit}
              </span>
            </p>
            <div
              role="progressbar"
              aria-label="Daily analyses used"
              aria-valuemin={0}
              aria-valuemax={quota.limit}
              aria-valuenow={quota.used}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width]",
                  quotaReached ? "bg-destructive" : "bg-primary",
                )}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {quotaReached ? "Daily limit reached" : `${quota.remaining} left today`}
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl font-bold text-muted-foreground">&ndash;</p>
            <p className="text-xs text-muted-foreground">Quota unavailable right now</p>
          </>
        )}
      </MetricCard>
    </div>
  );
}
