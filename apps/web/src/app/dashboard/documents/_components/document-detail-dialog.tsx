"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarClock,
  ExternalLink,
  FileSearch,
  GitCompare,
  ListChecks,
  Loader2,
} from "lucide-react";

import { requestAnalysis } from "@/app/dashboard/analyses/actions";
import { getDocumentByIdAction } from "../actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { FILE_TYPE_LABEL, formatBytes } from "../_lib/types";
import { DocumentStatusBadge } from "./document-status-badge";

interface DocumentDetail {
  id: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "XLSX";
  status: "UPLOADED" | "PROCESSED" | "FAILED";
  fileSizeBytes?: number;
  failureReason: string | null;
  createdAt: string;
  url: string;
}

interface LoadedDocument {
  id: string;
  document: DocumentDetail | null;
  error: string | null;
}

interface ActionError {
  id: string;
  message: string;
}

interface DocumentDetailDialogProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ANALYSIS_TYPES = [
  { type: "SUMMARY", label: "Summary", description: "Key points in a few paragraphs", icon: FileSearch },
  { type: "EXTRACT_VALUES", label: "Extract values", description: "Amounts, names and figures", icon: ListChecks },
  { type: "DEADLINES", label: "Deadlines", description: "Dates and due obligations", icon: CalendarClock },
  { type: "COMPARE", label: "Comparison", description: "Contrast sections or versions", icon: GitCompare },
] as const;

export function DocumentDetailDialog({
  documentId,
  open,
  onOpenChange,
}: DocumentDetailDialogProps) {
  const [loaded, setLoaded] = useState<LoadedDocument | null>(null);
  const [actionError, setActionError] = useState<ActionError | null>(null);
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!documentId || !open) return;

    // descarta respostas de um documento que já não está selecionado
    let cancelled = false;
    getDocumentByIdAction(documentId)
      .then((document) => {
        if (!cancelled) setLoaded({ id: documentId, document, error: null });
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded({
            id: documentId,
            document: null,
            error: "Unable to load document details.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [documentId, open]);

  const current = loaded?.id === documentId ? loaded : null;
  const document = current?.document ?? null;
  const loadError = current?.error ?? null;
  const error = actionError?.id === documentId ? actionError.message : null;

  const handleRequestAnalysis = (type: string) => {
    if (!document) return;

    setActionError(null);
    setPendingType(type);

    startTransition(async () => {
      try {
        const result = await requestAnalysis(document.id, type);
        if (!result.ok) {
          setActionError({ id: document.id, message: result.error });
          return;
        }
        onOpenChange(false);
        router.push(`/dashboard/analyses?documentId=${document.id}`);
      } catch {
        setActionError({
          id: document.id,
          message: "Unable to start analysis. Please try again.",
        });
      } finally {
        setPendingType(null);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {loadError ? (
          <>
            <DialogHeader>
              <DialogTitle>Document details</DialogTitle>
            </DialogHeader>
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          </>
        ) : !document ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex min-w-0 items-center gap-2 pr-8">
                <DialogTitle className="truncate" title={document.fileName}>
                  {document.fileName}
                </DialogTitle>
                <DocumentStatusBadge status={document.status} />
              </div>
              <DialogDescription>
                {[
                  FILE_TYPE_LABEL[document.fileType],
                  typeof document.fileSizeBytes === "number"
                    ? formatBytes(document.fileSizeBytes)
                    : null,
                  `Uploaded ${formatDate(document.createdAt)}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </DialogDescription>
            </DialogHeader>

            {document.status === "FAILED" ? (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>
                  {document.failureReason ??
                    "We couldn't process this document. Try uploading it again."}
                </AlertDescription>
              </Alert>
            ) : null}

            {document.fileType === "PDF" ? (
              <iframe
                src={document.url}
                className="h-96 w-full rounded-lg border bg-muted"
                title={document.fileName}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
                <p className="text-sm font-medium">
                  {FILE_TYPE_LABEL[document.fileType]} files can&apos;t be previewed here
                </p>
                <p className="text-xs text-muted-foreground">
                  Open the original file in a new tab to view it.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                nativeButton={false}
                variant="outline"
                size="sm"
                render={<a href={document.url} target="_blank" rel="noopener noreferrer" />}
              >
                <ExternalLink />
                Open in new tab
              </Button>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2 border-t pt-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold">Run an analysis</h3>
                {document.status !== "PROCESSED" ? (
                  <p className="text-xs text-muted-foreground">
                    Available once the document is ready
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {ANALYSIS_TYPES.map(({ type, label, description, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-auto justify-start gap-3 px-3 py-2.5 text-left whitespace-normal"
                    disabled={document.status !== "PROCESSED" || isPending}
                    onClick={() => handleRequestAnalysis(type)}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {pendingType === type ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Icon />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block text-xs font-normal text-muted-foreground">
                        {description}
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}