import Link from "next/link";
import { FileSpreadsheet, FileText, Sparkles, Upload } from "lucide-react";

import { DocumentStatusBadge } from "@/app/dashboard/documents/_components/document-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatRelativeTime } from "@/lib/utils";

export interface RecentDocument {
  id: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "XLSX";
  status: "UPLOADED" | "PROCESSED" | "FAILED";
  createdAt: string;
}

interface RecentDocumentsCardClientProps {
  documents: RecentDocument[];
  total: number;
}

const FILE_ICONS = {
  PDF: FileText,
  DOCX: FileText,
  XLSX: FileSpreadsheet,
};

export function RecentDocumentsCardClient({ documents, total }: RecentDocumentsCardClientProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base">Recent documents</CardTitle>
        {total > 0 ? (
          <Button
            nativeButton={false}
            size="sm"
            variant="ghost"
            render={<Link href="/dashboard/documents" />}
          >
            View all
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm font-medium text-foreground">No documents yet</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              PDF, Word and Excel files are supported.
            </p>
            <Button
              nativeButton={false}
              size="sm"
              variant="outline"
              className="mt-4"
              render={<Link href="/dashboard/documents" />}
            >
              <Upload />
              Upload a document
            </Button>
          </div>
        ) : (
          <ul className="-mx-2 space-y-1">
            {documents.map((document) => {
              const Icon = FILE_ICONS[document.fileType] ?? FileText;
              const isReady = document.status === "PROCESSED";

              return (
                <li
                  key={document.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" title={document.fileName}>
                      {document.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(document.createdAt)}
                    </p>
                  </div>
                  {isReady ? (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            nativeButton={false}
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Analyze ${document.fileName}`}
                            render={
                              <Link href={`/dashboard/analyses?documentId=${document.id}`} />
                            }
                          />
                        }
                      >
                        <Sparkles />
                      </TooltipTrigger>
                      <TooltipContent>Analyze</TooltipContent>
                    </Tooltip>
                  ) : (
                    <DocumentStatusBadge status={document.status} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
