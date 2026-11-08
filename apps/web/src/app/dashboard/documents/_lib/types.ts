export type DocumentStatus = "UPLOADED" | "PROCESSED" | "FAILED";
export type DocumentFileType = "PDF" | "DOCX" | "XLSX";

export interface DocumentListItem {
  id: string;
  fileName: string;
  fileType: DocumentFileType;
  // Optional while older documents-service deployments don't send it yet.
  fileSizeBytes?: number;
  status: DocumentStatus;
  failureReason: string | null;
  createdAt: string;
}

export const FILE_TYPE_LABEL: Record<DocumentFileType, string> = {
  PDF: "PDF",
  DOCX: "Word",
  XLSX: "Excel",
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
