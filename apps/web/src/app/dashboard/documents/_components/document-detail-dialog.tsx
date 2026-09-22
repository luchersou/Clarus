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

import { requestAnalysis } from "@/lib/actions/analyses";
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
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!documentId || !open) {
      setDocument(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    fetch(`/api/documents/${documentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch document");
        return res.json();
      })
      .then(setDocument)
      .catch(() => setError("Unable to load document details."))
      .finally(() => setIsLoading(false));
  }, [documentId, open]);

  const handleRequestAnalysis = (type: string) => {
    if (!document) return;

    setError(null);
    setPendingType(type);

    startTransition(async () => {
      try {
        await requestAnalysis(document.id, type);
        onOpenChange(false);
        router.push(`/dashboard/analyses?documentId=${document.id}`);
      } catch {
        setError("Unable to start analysis. Please try again.");
      } finally {
        setPendingType(null);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {isLoading || !document ? (
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