import { z } from "zod";

export const ListDocumentsPayloadSchema = z.object({
  userId: z.string().uuid(),
});
export type ListDocumentsPayload = z.infer<typeof ListDocumentsPayloadSchema>;

export const GetDocumentPayloadSchema = z.object({
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type GetDocumentPayload = z.infer<typeof GetDocumentPayloadSchema>;

export const DeleteDocumentPayloadSchema = z.object({
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type DeleteDocumentPayload = z.infer<typeof DeleteDocumentPayloadSchema>;