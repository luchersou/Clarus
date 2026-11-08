import { getAnalyses } from "@/lib/api/analyses";
import { getDocuments } from "@/lib/api/documents";
import { AnalysesListClient } from "./analyses-list-client";

interface AnalysesListProps {
  documentId?: string;
}

export async function AnalysesList({ documentId }: AnalysesListProps) {
  const [analyses, documents] = await Promise.all([getAnalyses(documentId), getDocuments()]);

  const documentNames: Record<string, string> = Object.fromEntries(
    (documents as { id: string; fileName: string }[]).map((doc) => [doc.id, doc.fileName]),
  );

  return (
    <AnalysesListClient
      initialAnalyses={analyses}
      documentNames={documentNames}
      documentId={documentId}
    />
  );
}
