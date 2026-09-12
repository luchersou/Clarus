import { z } from 'zod';

declare const EXCHANGES: {
    readonly EVENTS: "clarus.events";
    readonly RPC: "clarus.rpc";
    readonly DLX: "clarus.dlx";
};
declare const ROUTING_KEYS: {
    readonly DOCUMENT_UPLOADED: "document.uploaded";
    readonly DOCUMENT_EMBEDDED: "document.embedded";
    readonly DOCUMENT_EMBEDDING_FAILED: "document.embedding_failed";
    readonly ANALYSIS_REQUESTED: "analysis.requested";
    readonly ANALYSIS_COMPLETED: "analysis.completed";
    readonly ANALYSIS_FAILED: "analysis.failed";
};
declare const QUEUES: {
    readonly RAG_DOCUMENT_UPLOADED: "rag.document-uploaded";
    readonly DOCUMENTS_DOCUMENT_EMBEDDED: "documents.document-embedded";
    readonly DOCUMENTS_DOCUMENT_EMBEDDING_FAILED: "documents.document-embedding-failed";
    readonly RAG_ANALYSIS_REQUESTED: "rag.analysis-requested";
    readonly ANALYSIS_ANALYSIS_COMPLETED: "analysis.analysis-completed";
};
declare const RPC_ROUTING_KEYS: {
    readonly DOCUMENTS_LIST: "documents.list";
    readonly DOCUMENTS_GET_BY_ID: "documents.get-by-id";
    readonly DOCUMENTS_DELETE: "documents.delete";
    readonly ANALYSES_REQUEST: "analyses.request";
    readonly ANALYSES_LIST_BY_DOCUMENT: "analyses.list-by-document";
    readonly ANALYSES_GET_BY_ID: "analyses.get-by-id";
};
declare const RPC_QUEUES: {
    readonly DOCUMENTS_LIST: "documents.rpc.list";
    readonly DOCUMENTS_GET_BY_ID: "documents.rpc.get-by-id";
    readonly DOCUMENTS_DELETE: "documents.rpc.delete";
    readonly ANALYSES_REQUEST: "analyses.rpc.request";
    readonly ANALYSES_LIST_BY_DOCUMENT: "analyses.rpc.list-by-document";
    readonly ANALYSES_GET_BY_ID: "analyses.rpc.get-by-id";
};

declare const DocumentUploadedSchema: z.ZodObject<{
    documentId: z.ZodString;
    userId: z.ZodString;
    storageUrl: z.ZodString;
    fileType: z.ZodEnum<["PDF", "DOCX", "XLSX"]>;
}, "strip", z.ZodTypeAny, {
    documentId: string;
    userId: string;
    storageUrl: string;
    fileType: "PDF" | "DOCX" | "XLSX";
}, {
    documentId: string;
    userId: string;
    storageUrl: string;
    fileType: "PDF" | "DOCX" | "XLSX";
}>;
type DocumentUploadedEvent = z.infer<typeof DocumentUploadedSchema>;
declare const DocumentEmbeddedSchema: z.ZodObject<{
    documentId: z.ZodString;
    chunksCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    documentId: string;
    chunksCount: number;
}, {
    documentId: string;
    chunksCount: number;
}>;
type DocumentEmbeddedEvent = z.infer<typeof DocumentEmbeddedSchema>;
declare const DocumentEmbeddingFailedSchema: z.ZodObject<{
    documentId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    documentId: string;
    reason: string;
}, {
    documentId: string;
    reason: string;
}>;
type DocumentEmbeddingFailedEvent = z.infer<typeof DocumentEmbeddingFailedSchema>;

declare const AnalysisRequestedSchema: z.ZodObject<{
    analysisId: z.ZodString;
    documentId: z.ZodString;
    userId: z.ZodString;
    type: z.ZodEnum<["SUMMARY", "EXTRACT_VALUES", "DEADLINES", "COMPARE"]>;
}, "strip", z.ZodTypeAny, {
    documentId: string;
    userId: string;
    type: "SUMMARY" | "EXTRACT_VALUES" | "DEADLINES" | "COMPARE";
    analysisId: string;
}, {
    documentId: string;
    userId: string;
    type: "SUMMARY" | "EXTRACT_VALUES" | "DEADLINES" | "COMPARE";
    analysisId: string;
}>;
type AnalysisRequestedEvent = z.infer<typeof AnalysisRequestedSchema>;
declare const AnalysisCompletedSchema: z.ZodObject<{
    analysisId: z.ZodString;
    result: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    sourcePage: z.ZodOptional<z.ZodNumber>;
    confidence: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    analysisId: string;
    result: Record<string, unknown>;
    sourcePage?: number | undefined;
    confidence?: number | undefined;
}, {
    analysisId: string;
    result: Record<string, unknown>;
    sourcePage?: number | undefined;
    confidence?: number | undefined;
}>;
type AnalysisCompletedEvent = z.infer<typeof AnalysisCompletedSchema>;
declare const AnalysisFailedSchema: z.ZodObject<{
    analysisId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    analysisId: string;
}, {
    reason: string;
    analysisId: string;
}>;
type AnalysisFailedEvent = z.infer<typeof AnalysisFailedSchema>;

export { type AnalysisCompletedEvent, AnalysisCompletedSchema, type AnalysisFailedEvent, AnalysisFailedSchema, type AnalysisRequestedEvent, AnalysisRequestedSchema, type DocumentEmbeddedEvent, DocumentEmbeddedSchema, type DocumentEmbeddingFailedEvent, DocumentEmbeddingFailedSchema, type DocumentUploadedEvent, DocumentUploadedSchema, EXCHANGES, QUEUES, ROUTING_KEYS, RPC_QUEUES, RPC_ROUTING_KEYS };
