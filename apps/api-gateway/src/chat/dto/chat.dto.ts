import { z } from "zod";

export const ChatBodySchema = z.object({
  question: z.string().min(1),
  sessionId: z.string().uuid().optional(),
  documentId: z.string().uuid().optional(),
});

export type ChatBody = z.infer<typeof ChatBodySchema>;