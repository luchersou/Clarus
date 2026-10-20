import { z } from "zod";

// Published by: analysis-service
// Consumed by: documents-service (validates the document before the analysis runs)
export const AnalysisRequestedSchema = z.object({
  analysisId: z.string().uuid(),
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["SUMMARY", "EXTRACT_VALUES", "DEADLINES", "COMPARE"]),
});
export type AnalysisRequestedEvent = z.infer<typeof AnalysisRequestedSchema>;

// Published by: documents-service, once the document exists, belongs to the user and is PROCESSED
// Consumed by: rag-service
export const AnalysisDocumentValidatedSchema = z.object({
  analysisId: z.string().uuid(),
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["SUMMARY", "EXTRACT_VALUES", "DEADLINES", "COMPARE"]),
});
export type AnalysisDocumentValidatedEvent = z.infer<typeof AnalysisDocumentValidatedSchema>;

// Published by: documents-service, when the document can't be analyzed
// Consumed by: analysis-service
export const AnalysisRejectedSchema = z.object({
  analysisId: z.string().uuid(),
  reason: z.string(),
});
export type AnalysisRejectedEvent = z.infer<typeof AnalysisRejectedSchema>;

// Published by: rag-service
// Consumed by: analysis-service
export const AnalysisCompletedSchema = z.object({
  analysisId: z.string().uuid(),
  result: z.record(z.string(), z.unknown()),
  sourcePage: z.number().int().optional().nullable(),
  confidence: z.number().min(0).max(1).optional().nullable(),
});
export type AnalysisCompletedEvent = z.infer<typeof AnalysisCompletedSchema>;

// Published by: rag-service
// Consumed by: analysis-service
export const AnalysisFailedSchema = z.object({
  analysisId: z.string().uuid(),
  reason: z.string(),
});
export type AnalysisFailedEvent = z.infer<typeof AnalysisFailedSchema>;