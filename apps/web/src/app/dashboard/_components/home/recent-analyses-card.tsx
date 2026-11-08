import { getDashboardSummary } from "@/lib/api/dashboard";
import { getDocuments } from "@/lib/api/documents";
import { RecentAnalysesCardClient } from "./recent-analyses-card-client";

interface DocumentName {
  id: string;
  fileName: string;
}

export async function RecentAnalysesCard() {
  const [summary, documents] = await Promise.all([getDashboardSummary(), getDocuments()]);

  const documentNames: Record<string, string> = Object.fromEntries(
    (documents as DocumentName[]).map((doc) => [doc.id, doc.fileName]),
  );

  return (
    <RecentAnalysesCardClient
      analyses={summary.recentAnalyses}
      documentNames={documentNames}
      hasDocuments={summary.documentsCount > 0}
    />
  );
}
