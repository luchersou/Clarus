import { z } from "zod";

// Published by: documents-service
// Consumed by: rag-service
export const DocumentUploadedSchema = z.object({
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
  storageUrl: z.string(),
  fileType: z.enum(["PDF", "DOCX", "XLSX"]),
});
export type DocumentUploadedEvent = z.infer<typeof DocumentUploadedSchema>;

// Published by: rag-service
// Consumed by: documents-service
export const DocumentEmbeddedSchema = z.object({
  documentId: z.string().uuid(),
  chunksCount: z.number().int().positive(),
});
export type DocumentEmbeddedEvent = z.infer<typeof DocumentEmbeddedSchema>;

// Published by: rag-service
// Consumed by: documents-service
export const DocumentEmbeddingFailedSchema = z.object({
  documentId: z.string().uuid(),
  reason: z.string(),
});
export type DocumentEmbeddingFailedEvent = z.infer<typeof DocumentEmbeddingFailedSchema>;