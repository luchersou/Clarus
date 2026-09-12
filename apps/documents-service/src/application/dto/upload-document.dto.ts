import { z } from "zod";

export const UploadDocumentBodySchema = z.object({
  userId: z.string().uuid(),
  fileName: z.string().min(1),
  fileType: z.enum(["PDF", "DOCX", "XLSX"]),
});

export type UploadDocumentBody = z.infer<typeof UploadDocumentBodySchema>;