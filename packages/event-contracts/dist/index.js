"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AnalysisCompletedSchema: () => AnalysisCompletedSchema,
  AnalysisFailedSchema: () => AnalysisFailedSchema,
  AnalysisRequestedSchema: () => AnalysisRequestedSchema,
  DocumentEmbeddedSchema: () => DocumentEmbeddedSchema,
  DocumentEmbeddingFailedSchema: () => DocumentEmbeddingFailedSchema,
  DocumentUploadedSchema: () => DocumentUploadedSchema,
  EXCHANGES: () => EXCHANGES,
  QUEUES: () => QUEUES,
  ROUTING_KEYS: () => ROUTING_KEYS,
  RPC_QUEUES: () => RPC_QUEUES,
  RPC_ROUTING_KEYS: () => RPC_ROUTING_KEYS
});
module.exports = __toCommonJS(index_exports);

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
var import_zod = require("zod");
var DocumentUploadedSchema = import_zod.z.object({
  documentId: import_zod.z.string().uuid(),
  userId: import_zod.z.string().uuid(),
  storageUrl: import_zod.z.string(),
  fileType: import_zod.z.enum(["PDF", "DOCX", "XLSX"])
});
var DocumentEmbeddedSchema = import_zod.z.object({
  documentId: import_zod.z.string().uuid(),
  chunksCount: import_zod.z.number().int().positive()
});
var DocumentEmbeddingFailedSchema = import_zod.z.object({
  documentId: import_zod.z.string().uuid(),
  reason: import_zod.z.string()
});

// src/events/analysis.events.ts
var import_zod2 = require("zod");
var AnalysisRequestedSchema = import_zod2.z.object({
  analysisId: import_zod2.z.string().uuid(),
  documentId: import_zod2.z.string().uuid(),
  userId: import_zod2.z.string().uuid(),
  type: import_zod2.z.enum(["SUMMARY", "EXTRACT_VALUES", "DEADLINES", "COMPARE"])
});
var AnalysisCompletedSchema = import_zod2.z.object({
  analysisId: import_zod2.z.string().uuid(),
  result: import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown()),
  sourcePage: import_zod2.z.number().int().optional(),
  confidence: import_zod2.z.number().min(0).max(1).optional()
});
var AnalysisFailedSchema = import_zod2.z.object({
  analysisId: import_zod2.z.string().uuid(),
  reason: import_zod2.z.string()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
