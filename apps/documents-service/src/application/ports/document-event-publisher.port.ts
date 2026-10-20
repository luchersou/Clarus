import type { FileType } from "../../domain/file-type.js";

export interface DocumentUploadedPayload {
  documentId: string;
  userId: string;
  storageUrl: string;
  fileType: FileType;
}

export interface AnalysisDocumentValidatedPayload {
  analysisId: string;
  documentId: string;
  userId: string;
  type: "SUMMARY" | "EXTRACT_VALUES" | "DEADLINES" | "COMPARE";
}

export interface AnalysisRejectedPayload {
  analysisId: string;
  reason: string;
}

export interface DocumentDeletedPayload {
  documentId: string;
  userId: string;
}

export interface DocumentEventPublisherPort {
  publishDocumentUploaded(payload: DocumentUploadedPayload): Promise<void>;
  publishAnalysisDocumentValidated(payload: AnalysisDocumentValidatedPayload): Promise<void>;
  publishAnalysisRejected(payload: AnalysisRejectedPayload): Promise<void>;
  publishDocumentDeleted(payload: DocumentDeletedPayload): Promise<void>;
}

export const DOCUMENT_EVENT_PUBLISHER = Symbol("DOCUMENT_EVENT_PUBLISHER");
