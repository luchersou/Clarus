import { z } from "zod";

// Published by: analises-service
// Consumed by: rag-service
export const AnalysisRequestedSchema = z.object({
  analysisId: z.string().uuid(),
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["SUMMARY", "EXTRACT_VALUES", "DEADLINES", "COMPARE"]),
});
export type AnalysisRequestedEvent = z.infer<typeof AnalysisRequestedSchema>;

// Published by: rag-service
// Consumed by: analises-service
export const AnalysisCompletedSchema = z.object({
  analysisId: z.string().uuid(),
  result: z.record(z.string(), z.unknown()), 
  sourcePage: z.number().int().optional(),
  confidence: z.number().min(0).max(1).optional(),
});
export type AnalysisCompletedEvent = z.infer<typeof AnalysisCompletedSchema>;

// Published by: rag-service
// Consumed by: analises-service
export const AnalysisFailedSchema = z.object({
  analysisId: z.string().uuid(),
  reason: z.string(),
});
export type AnalysisFailedEvent = z.infer<typeof AnalysisFailedSchema>;