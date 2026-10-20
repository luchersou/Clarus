"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  FileSearch,
  FileText,
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
import { DocumentStatusBadge } from "./document-status-badge";

interface DocumentDetail {
  id: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "XLSX";
  status: "UPLOADED" | "PROCESSED" | "FAILED";
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
  { type: "SUMMARY", label: "Summary", icon: FileText },
  { type: "EXTRACT_VALUES", label: "Extract values", icon: FileSearch },
  { type: "DEADLINES", label: "Deadlines", icon: Calendar },
  { type: "COMPARE", label: "Comparison", icon: BarChart3 },
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
              <AlertCircle className="h-4 w-4" />
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
              <div className="flex items-center gap-2">
                <DialogTitle className="truncate">{document.fileName}</DialogTitle>
                <DocumentStatusBadge status={document.status} />
              </div>
              <DialogDescription>
                {document.fileType === "PDF"
                  ? "Preview the document or run an analysis below."
                  : "Open the file to preview it, or run an analysis below."}
              </DialogDescription>
            </DialogHeader>

            {document.fileType === "PDF" ? (
              <iframe
                src={document.url}
                className="h-96 w-full rounded-sm border"
                title={document.fileName}
              />
            ) : (
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary underline underline-offset-4"
              >
                Open file in a new tab
              </a>
            )}

            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid grid-cols-2 gap-2 pt-2">
              {ANALYSIS_TYPES.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant="outline"
                  disabled={document.status !== "PROCESSED" || isPending}
                  onClick={() => handleRequestAnalysis(type)}
                >
                  {pendingType === type ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="mr-2 h-4 w-4" />
                  )}
                  {label}
                </Button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}