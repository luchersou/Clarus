import { getDocuments } from "@/lib/api/documents";
import { NewAnalysisFormClient } from "./new-analysis-form-client";

export async function NewAnalysisForm() {
  const documents = await getDocuments();
  const readyDocuments = documents.filter(
    (doc: { status: string }) => doc.status === "PROCESSED",
  );

  return <NewAnalysisFormClient documents={readyDocuments} />;
}