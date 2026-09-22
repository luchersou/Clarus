"use client";

import { useState } from "react";
import { FileIcon, FileSpreadsheet, FileText } from "lucide-react";

import { DocumentActionsRow } from "./document-actions-row";
import { DocumentDetailDialog } from "./document-detail-dialog";
import { DocumentStatusBadge } from "./document-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Document {
  id: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "XLSX";
  status: "UPLOADED" | "PROCESSED" | "FAILED";
  createdAt: string;
}

interface DocumentsListClientProps {
  documents: Document[];
}

const FILE_ICONS = {
  PDF: FileText,
  DOCX: FileText,
  XLSX: FileSpreadsheet,
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DocumentsListClient({ documents }: DocumentsListClientProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-sm border border-dashed p-8 text-center">
        <FileIcon className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          No documents yet
        </p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          Upload your first document to start analyzing it.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => {
              const Icon = FILE_ICONS[document.fileType];
              return (
                <TableRow
                  key={document.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedDocumentId(document.id)}
                >
                  <TableCell className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{document.fileName}</span>
                  </TableCell>
                  <TableCell>
                    <DocumentStatusBadge status={document.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(document.createdAt)}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <DocumentActionsRow
                      documentId={document.id}
                      documentName={document.fileName}
                      canAnalyse={document.status === "PROCESSED"}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DocumentDetailDialog
        documentId={selectedDocumentId}
        open={selectedDocumentId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDocumentId(null);
        }}
      />
    </>
  );
}