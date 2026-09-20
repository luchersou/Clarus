import { getDashboardSummary } from "@/lib/api/dashboard";
import { DashboardMetricsClient } from "./dashboard-metrics-client";

export async function DashboardMetrics() {
  const summary = await getDashboardSummary();

  return (
    <DashboardMetricsClient
      documentsCount={summary.documentsCount}
      documentsReadyCount={summary.documentsByStatus?.PROCESSED ?? 0}
      analysesPendingCount={summary.analysesPendingCount}
    />
  );
}