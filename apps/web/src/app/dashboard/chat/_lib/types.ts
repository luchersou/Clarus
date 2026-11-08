export interface Source {
  documentName: string;
  page: number;
  confidence: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}
