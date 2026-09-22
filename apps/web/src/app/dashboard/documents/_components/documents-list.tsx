import { getDocuments } from "@/lib/api/documents";
import { DocumentsListClient } from "./documents-list-client";

export async function DocumentsList() {
  const documents = await getDocuments();
  return <DocumentsListClient documents={documents} />;
}