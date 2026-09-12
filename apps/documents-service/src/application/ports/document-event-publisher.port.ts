import type { FileType } from "../../domain/file-type.js";

export interface DocumentUploadedPayload {
  documentId: string;
  userId: string;
  storageUrl: string;
  fileType: FileType;
}

export interface DocumentEventPublisherPort {
  publishDocumentUploaded(payload: DocumentUploadedPayload): void;
}

export const DOCUMENT_EVENT_PUBLISHER = Symbol("DOCUMENT_EVENT_PUBLISHER");