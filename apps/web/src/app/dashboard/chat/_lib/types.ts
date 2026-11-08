// What rag-service sends in the `sources` event: one entry per document page, best match first.
export interface RawSource {
  documentId: string;
  page: number;
  confidence: number;
}

// A source ready to display, with the file name resolved on the web side.
export interface Source extends RawSource {
  documentName: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: RawSource[];
}

// A message as the UI renders it, after source names were resolved.
export interface DisplayMessage extends Omit<ChatMessage, "sources"> {
  sources?: Source[];
}
