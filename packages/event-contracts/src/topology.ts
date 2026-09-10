export const EXCHANGES = {
  EVENTS: "clarus.events",
  RPC: "clarus.rpc",
  DLX: "clarus.dlx",
} as const;

export const ROUTING_KEYS = {
  DOCUMENT_UPLOADED: "document.uploaded",
  DOCUMENT_EMBEDDED: "document.embedded",
  DOCUMENT_EMBEDDING_FAILED: "document.embedding_failed",
  ANALYSIS_REQUESTED: "analysis.requested",
  ANALYSIS_COMPLETED: "analysis.completed",
  ANALYSIS_FAILED: "analysis.failed",
} as const;

export const QUEUES = {
  RAG_DOCUMENT_UPLOADED: "rag.document.uploaded",
  DOCUMENTOS_DOCUMENT_EMBEDDED: "documentos.document.embedded",
  RAG_ANALYSIS_REQUESTED: "rag.analysis.requested",
  ANALISES_ANALYSIS_COMPLETED: "analises.analysis.completed",
} as const;