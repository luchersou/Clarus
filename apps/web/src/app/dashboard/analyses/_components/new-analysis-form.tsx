import { getAnalysisQuota } from "@/lib/api/analyses";
import { getDocuments } from "@/lib/api/documents";
import { NewAnalysisFormClient } from "./new-analysis-form-client";

export async function NewAnalysisForm() {
  const [documents, quota] = await Promise.all([getDocuments(), getAnalysisQuota()]);
  const readyDocuments = documents.filter(
    (doc: { status: string }) => doc.status === "PROCESSED",
  );

  return <NewAnalysisFormClient documents={readyDocuments} quota={quota} />;
}