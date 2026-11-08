import { getDocuments } from "@/lib/api/documents";
import { RecentDocumentsCardClient, type RecentDocument } from "./recent-documents-card-client";

const RECENT_DOCUMENTS_LIMIT = 5;

export async function RecentDocumentsCard() {
  const documents: RecentDocument[] = await getDocuments();

  const recent = [...documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, RECENT_DOCUMENTS_LIMIT);

  return <RecentDocumentsCardClient documents={recent} total={documents.length} />;
}
