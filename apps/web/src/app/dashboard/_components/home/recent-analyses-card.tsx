import { getDashboardSummary } from "@/lib/api/dashboard";
import { RecentAnalysesCardClient } from "./recent-analyses-card-client";

export async function RecentAnalysesCard() {
  const summary = await getDashboardSummary();

  return (
    <RecentAnalysesCardClient
      analyses={summary.recentAnalyses}
      hasDocuments={summary.documentsCount > 0}
    />
  );
}