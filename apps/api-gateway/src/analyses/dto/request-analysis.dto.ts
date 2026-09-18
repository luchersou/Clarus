import { z } from "zod";

export const RequestAnalysisBodySchema = z.object({
  documentId: z.string().uuid(),
  type: z.enum(["SUMMARY", "EXTRACT_VALUES", "DEADLINES", "COMPARE"]),
});

export type RequestAnalysisBody = z.infer<typeof RequestAnalysisBodySchema>;