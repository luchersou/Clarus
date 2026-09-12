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
  RAG_DOCUMENT_UPLOADED: "rag.document-uploaded",
  DOCUMENTS_DOCUMENT_EMBEDDED: "documents.document-embedded",
  RAG_ANALYSIS_REQUESTED: "rag.analysis-requested",
  ANALYSIS_ANALYSIS_COMPLETED: "analysis.analysis-completed",
} as const;

export const RPC_ROUTING_KEYS = {
  DOCUMENTS_LIST: "documents.list",
  DOCUMENTS_GET_BY_ID: "documents.get-by-id",
  DOCUMENTS_DELETE: "documents.delete",
  ANALYSES_REQUEST: "analyses.request",
  ANALYSES_LIST_BY_DOCUMENT: "analyses.list-by-document",
  ANALYSES_GET_BY_ID: "analyses.get-by-id",
} as const;

export const RPC_QUEUES = {
  DOCUMENTS_LIST: "documents.rpc.list",
  DOCUMENTS_GET_BY_ID: "documents.rpc.get-by-id",
  DOCUMENTS_DELETE: "documents.rpc.delete",
  ANALYSES_REQUEST: "analyses.rpc.request",
  ANALYSES_LIST_BY_DOCUMENT: "analyses.rpc.list-by-document",
  ANALYSES_GET_BY_ID: "analyses.rpc.get-by-id",
} as const;