import { getAnalysisQuota } from "@/lib/api/analyses";
import { getDashboardSummary } from "@/lib/api/dashboard";
import { DashboardMetricsClient } from "./dashboard-metrics-client";

export async function DashboardMetrics() {
  const [summary, quota] = await Promise.all([getDashboardSummary(), getAnalysisQuota()]);
  const byStatus: Record<string, number> = summary.documentsByStatus ?? {};

  return (
    <DashboardMetricsClient
      documentsCount={summary.documentsCount}
      documentsReadyCount={byStatus.PROCESSED ?? 0}
      documentsProcessingCount={byStatus.UPLOADED ?? 0}
      documentsFailedCount={byStatus.FAILED ?? 0}
      analysesPendingCount={summary.analysesPendingCount}
      quota={quota}
    />
  );
}
