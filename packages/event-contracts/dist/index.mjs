// src/topology.ts
var EXCHANGES = {
  EVENTS: "clarus.events",
  RPC: "clarus.rpc",
  DLX: "clarus.dlx"
};
var ROUTING_KEYS = {
  DOCUMENT_UPLOADED: "document.uploaded",
  DOCUMENT_EMBEDDED: "document.embedded",
  DOCUMENT_EMBEDDING_FAILED: "document.embedding_failed",
  ANALYSIS_REQUESTED: "analysis.requested",
  ANALYSIS_COMPLETED: "analysis.completed",
  ANALYSIS_FAILED: "analysis.failed"
};
var QUEUES = {
  RAG_DOCUMENT_UPLOADED: "rag.document-uploaded",
  DOCUMENTS_DOCUMENT_EMBEDDED: "documents.document-embedded",
  DOCUMENTS_DOCUMENT_EMBEDDING_FAILED: "documents.document-embedding-failed",
  RAG_ANALYSIS_REQUESTED: "rag.analysis-requested",
  ANALYSIS_ANALYSIS_COMPLETED: "analysis.analysis-completed"
};
var RPC_ROUTING_KEYS = {
  DOCUMENTS_LIST: "documents.list",
  DOCUMENTS_GET_BY_ID: "documents.get-by-id",
  DOCUMENTS_DELETE: "documents.delete",
  ANALYSES_REQUEST: "analyses.request",
  ANALYSES_LIST_BY_DOCUMENT: "analyses.list-by-document",
  ANALYSES_GET_BY_ID: "analyses.get-by-id"
};
var RPC_QUEUES = {
  DOCUMENTS_LIST: "documents.rpc.list",
  DOCUMENTS_GET_BY_ID: "documents.rpc.get-by-id",
  DOCUMENTS_DELETE: "documents.rpc.delete",
  ANALYSES_REQUEST: "analyses.rpc.request",
  ANALYSES_LIST_BY_DOCUMENT: "analyses.rpc.list-by-document",
  ANALYSES_GET_BY_ID: "analyses.rpc.get-by-id"
};

// src/events/document.events.ts
import { z } from "zod";
var DocumentUploadedSchema = z.object({
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
  storageUrl: z.string(),
  fileType: z.enum(["PDF", "DOCX", "XLSX"])
});
var DocumentEmbeddedSchema = z.object({
  documentId: z.string().uuid(),
  chunksCount: z.number().int().positive()
});
var DocumentEmbeddingFailedSchema = z.object({
  documentId: z.string().uuid(),
  reason: z.string()
});

// src/events/analysis.events.ts
import { z as z2 } from "zod";
var AnalysisRequestedSchema = z2.object({
  analysisId: z2.string().uuid(),
  documentId: z2.string().uuid(),
  userId: z2.string().uuid(),
  type: z2.enum(["SUMMARY", "EXTRACT_VALUES", "DEADLINES", "COMPARE"])
});
var AnalysisCompletedSchema = z2.object({
  analysisId: z2.string().uuid(),
  result: z2.record(z2.string(), z2.unknown()),
  sourcePage: z2.number().int().optional(),
  confidence: z2.number().min(0).max(1).optional()
});
var AnalysisFailedSchema = z2.object({
  analysisId: z2.string().uuid(),
  reason: z2.string()
});
export {
  AnalysisCompletedSchema,
  AnalysisFailedSchema,
  AnalysisRequestedSchema,
  DocumentEmbeddedSchema,
  DocumentEmbeddingFailedSchema,
  DocumentUploadedSchema,
  EXCHANGES,
  QUEUES,
  ROUTING_KEYS,
  RPC_QUEUES,
  RPC_ROUTING_KEYS
};
