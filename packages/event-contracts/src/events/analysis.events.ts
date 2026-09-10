import { z } from "zod";

// Publicado por: analises-service
// Consumido por: rag-service
export const AnalysisRequestedSchema = z.object({
  analysisId: z.string().uuid(),
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["SUMMARY", "EXTRACT_VALUES", "DEADLINES", "COMPARE"]),
});
export type AnalysisRequestedEvent = z.infer<typeof AnalysisRequestedSchema>;

// Publicado por: rag-service
// Consumido por: analises-service
export const AnalysisCompletedSchema = z.object({
  analysisId: z.string().uuid(),
  result: z.record(z.string(), z.unknown()), // formato varia por AnalysisType
  sourcePage: z.number().int().optional(),
  confidence: z.number().min(0).max(1).optional(),
});
export type AnalysisCompletedEvent = z.infer<typeof AnalysisCompletedSchema>;

// Publicado por: rag-service
// Consumido por: analises-service
export const AnalysisFailedSchema = z.object({
  analysisId: z.string().uuid(),
  reason: z.string(),
});
export type AnalysisFailedEvent = z.infer<typeof AnalysisFailedSchema>;