import { z } from "zod";

// Every question is embedded and sent to the LLM, so its length is capped.
export const MAX_QUESTION_LENGTH = 2000;

export const ChatBodySchema = z.object({
  question: z.string().trim().min(1).max(MAX_QUESTION_LENGTH),
  sessionId: z.string().uuid().optional(),
  documentId: z.string().uuid().optional(),
});

export type ChatBody = z.infer<typeof ChatBodySchema>;