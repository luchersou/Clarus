import { getAnalyses } from "@/lib/api/analyses";
import { AnalysesListClient } from "./analyses-list-client";

interface AnalysesListProps {
  documentId?: string;
}

export async function AnalysesList({ documentId }: AnalysesListProps) {
  const analyses = await getAnalyses(documentId);
  return <AnalysesListClient initialAnalyses={analyses} documentId={documentId} />;
}