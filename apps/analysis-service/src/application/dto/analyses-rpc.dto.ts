import { z } from "zod";

export const RequestAnalysisPayloadSchema = z.object({
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["SUMMARY", "EXTRACT_VALUES", "DEADLINES", "COMPARE"]),
});
export type RequestAnalysisPayload = z.infer<typeof RequestAnalysisPayloadSchema>;

export const ListAnalysesPayloadSchema = z.object({
  userId: z.string().uuid(),
  documentId: z.string().uuid().optional(),
});
export type ListAnalysesPayload = z.infer<typeof ListAnalysesPayloadSchema>;

export const GetAnalysisPayloadSchema = z.object({
  analysisId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type GetAnalysisPayload = z.infer<typeof GetAnalysisPayloadSchema>;

export const DeleteAnalysisPayloadSchema = z.object({
  analysisId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type DeleteAnalysisPayload = z.infer<typeof DeleteAnalysisPayloadSchema>;