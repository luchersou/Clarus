import { getDocuments } from "@/lib/api/documents";
import { ChatShell } from "./_components/chat-shell";

export default async function ChatPage() {
  // The chat still works without names: source cards fall back to a generic label.
  const documents: { id: string; fileName: string }[] = await getDocuments().catch(() => []);
  const documentNames = Object.fromEntries(documents.map((doc) => [doc.id, doc.fileName]));

  return <ChatShell documentNames={documentNames} />;
}
