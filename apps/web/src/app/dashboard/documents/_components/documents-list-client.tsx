"use client";

import { useEffect, useMemo, useState } from "react";
import { FileIcon, FileSpreadsheet, FileText, SearchX } from "lucide-react";

import { getDocumentsAction } from "../actions";
import { formatBytes, FILE_TYPE_LABEL, type DocumentListItem } from "../_lib/types";
import { DocumentActionsRow } from "./document-actions-row";
import { DocumentDetailDialog } from "./document-detail-dialog";
import { DocumentStatusBadge } from "./document-status-badge";
import {
  DocumentsToolbar,
  type SortOrder,
  type StatusFilter,
} from "./documents-toolbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface DocumentsListClientProps {
  initialDocuments: DocumentListItem[];
}

const POLL_INTERVAL = 4000;

const FILE_ICONS = {
  PDF: FileText,
  DOCX: FileText,
  XLSX: FileSpreadsheet,
};

function sortDocuments(documents: DocumentListItem[], sort: SortOrder) {
  const sorted = [...documents];
  if (sort === "name") {
    return sorted.sort((a, b) => a.fileName.localeCompare(b.fileName));
  }
  const direction = sort === "newest" ? -1 : 1;
  return sorted.sort(
    (a, b) => direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  );
}

export function DocumentsListClient({ initialDocuments }: DocumentsListClientProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [prevInitialDocuments, setPrevInitialDocuments] = useState(initialDocuments);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortOrder>("newest");

  // Resync when the server component sends a fresh list (after upload or delete).
  if (initialDocuments !== prevInitialDocuments) {
    setPrevInitialDocuments(initialDocuments);
    setDocuments(initialDocuments);
  }

  // Keep polling while something is still being processed, so the status flips on its own.
  const hasProcessing = documents.some((doc) => doc.status === "UPLOADED");
  useEffect(() => {
    if (!hasProcessing) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const data = await getDocumentsAction();
        if (!cancelled) setDocuments(data);
      } catch {
        // Transient failure: the next tick tries again.
      }
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hasProcessing]);

  const counts = useMemo<Record<StatusFilter, number>>(
    () => ({
      ALL: documents.length,
      PROCESSED: documents.filter((doc) => doc.status === "PROCESSED").length,
      UPLOADED: documents.filter((doc) => doc.status === "UPLOADED").length,
      FAILED: documents.filter((doc) => doc.status === "FAILED").length,
    }),
    [documents],
  );

  const visibleDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = documents.filter(
      (doc) =>
        (status === "ALL" || doc.status === status) &&
        (!normalizedQuery || doc.fileName.toLowerCase().includes(normalizedQuery)),
    );
    return sortDocuments(filtered, sort);
  }, [documents, query, status, sort]);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed p-10 text-center">
        <FileIcon className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">No documents yet</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          Upload your first document above to start analyzing it.
        </p>
      </div>
    );
  }

  const clearFilters = () => {
    setQuery("");
    setStatus("ALL");
  };

  return (
    <div className="space-y-3">
      <DocumentsToolbar
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
        counts={counts}
      />

      {visibleDocuments.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed p-10 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">No matching documents</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
            Try a different name or status.
          </p>
          <Button size="sm" variant="outline" className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead className="hidden sm:table-cell">Uploaded</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleDocuments.map((document) => {
                const Icon = FILE_ICONS[document.fileType] ?? FileText;
                const size =
                  typeof document.fileSizeBytes === "number"
                    ? formatBytes(document.fileSizeBytes)
                    : null;

                return (
                  <TableRow
                    key={document.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedDocumentId(document.id)}
                  >
                    <TableCell className="max-w-0 pl-4 sm:w-1/2">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <button
                            type="button"
                            className="block max-w-full truncate rounded-sm text-left font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                            title={document.fileName}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedDocumentId(document.id);
                            }}
                          >
                            {document.fileName}
                          </button>
                          <p className="truncate text-xs text-muted-foreground">
                            {FILE_TYPE_LABEL[document.fileType]}
                            <span className="sm:hidden">
                              {" "}&middot; {formatRelativeTime(document.createdAt)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {document.status === "FAILED" && document.failureReason ? (
                        <Tooltip>
                          <TooltipTrigger
                            render={<span className="inline-flex cursor-help" />}
                          >
                            <DocumentStatusBadge status={document.status} />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {document.failureReason}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <DocumentStatusBadge status={document.status} />
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">
                      {size ?? "–"}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      <time dateTime={document.createdAt} title={formatDate(document.createdAt)}>
                        {formatRelativeTime(document.createdAt)}
                      </time>
                    </TableCell>
                    <TableCell className="pr-4" onClick={(event) => event.stopPropagation()}>
                      <div className="flex justify-end">
                        <DocumentActionsRow
                          documentId={document.id}
                          documentName={document.fileName}
                          canAnalyze={document.status === "PROCESSED"}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <DocumentDetailDialog
        documentId={selectedDocumentId}
        open={selectedDocumentId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDocumentId(null);
        }}
      />
    </div>
  );
}
