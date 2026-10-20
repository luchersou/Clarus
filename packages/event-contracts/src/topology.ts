export const EXCHANGES = {
  EVENTS: "clarus.events",
  RPC: "clarus.rpc",
  DLX: "clarus.dlx",
} as const;

export const ROUTING_KEYS = {
  DOCUMENT_UPLOADED: "document.uploaded",
  DOCUMENT_EMBEDDED: "document.embedded",
  DOCUMENT_EMBEDDING_FAILED: "document.embedding_failed",
  DOCUMENT_DELETED: "document.deleted",
  ANALYSIS_REQUESTED: "analysis.requested",
  ANALYSIS_DOCUMENT_VALIDATED: "analysis.document_validated",
  ANALYSIS_REJECTED: "analysis.rejected",
  ANALYSIS_COMPLETED: "analysis.completed",
  ANALYSIS_FAILED: "analysis.failed",
} as const;

export const QUEUES = {
  RAG_DOCUMENT_UPLOADED: "rag.document-uploaded",
  DOCUMENTS_DOCUMENT_EMBEDDED: "documents.document-embedded",
  DOCUMENTS_DOCUMENT_EMBEDDING_FAILED: "documents.document-embedding-failed",
  DOCUMENTS_ANALYSIS_REQUESTED: "documents.analysis-requested",
  RAG_ANALYSIS_DOCUMENT_VALIDATED: "rag.analysis-document-validated",
  ANALYSIS_ANALYSIS_COMPLETED: "analysis.analysis-completed",
  ANALYSIS_ANALYSIS_FAILED: "analysis.analysis-failed",
  ANALYSIS_ANALYSIS_REJECTED: "analysis.analysis-rejected",
  ANALYSIS_DOCUMENT_DELETED: "analysis.document-deleted",
} as const;

export const RPC_ROUTING_KEYS = {
  DOCUMENTS_LIST: "documents.list",
  DOCUMENTS_GET_BY_ID: "documents.get-by-id",
  DOCUMENTS_DELETE: "documents.delete",
  ANALYSES_REQUEST: "analyses.request",
  ANALYSES_LIST: "analyses.list",
  ANALYSES_GET_BY_ID: "analyses.get-by-id",
  ANALYSES_DELETE: "analyses.delete",
  ANALYSES_QUOTA: "analyses.quota",
} as const;

export const RPC_QUEUES = {
  DOCUMENTS_LIST: "documents.rpc.list",
  DOCUMENTS_GET_BY_ID: "documents.rpc.get-by-id",
  DOCUMENTS_DELETE: "documents.rpc.delete",
  ANALYSES_REQUEST: "analyses.rpc.request",
  ANALYSES_LIST: "analyses.rpc.list",
  ANALYSES_GET_BY_ID: "analyses.rpc.get-by-id",
  ANALYSES_DELETE: "analyses.rpc.delete",
  ANALYSES_QUOTA: "analyses.rpc.quota",
} as const;