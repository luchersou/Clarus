"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Check,
  FileSearch,
  FileText,
  Loader2,
} from "lucide-react";

import { requestAnalysis } from "@/lib/actions/analyses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "XLSX";
  createdAt: string;
}

interface NewAnalysisFormClientProps {
  documents: Document[];
}

const ANALYSIS_TYPES = [
  {
    type: "SUMMARY",
    label: "Summary",
    description: "A concise overview of the document's key points.",
    icon: FileText,
  },
  {
    type: "EXTRACT_VALUES",
    label: "Extract values",
    description: "Pull out amounts, dates, and key figures.",
    icon: FileSearch,
  },
  {
    type: "DEADLINES",
    label: "Deadlines",
    description: "Find due dates and time-sensitive terms.",
    icon: Calendar,
  },
  {
    type: "COMPARE",
    label: "Comparison",
    description: "Compare this document against another one.",
    icon: BarChart3,
  },
] as const;

export function NewAnalysisFormClient({ documents }: NewAnalysisFormClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [documentId, setDocumentId] = useState<string | undefined>(
    searchParams.get("documentId") ?? undefined,
  );
  const [type, setType] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!documentId || !type) {
      setError("Select a document and an analysis type.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await requestAnalysis(documentId, type);
        router.push(`/dashboard/analyses?documentId=${documentId}`);
      } catch {
        setError("Unable to start analysis. Please try again.");
      }
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-base font-semibold">Set up your analysis</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete both steps below to run an analysis.
        </p>
      </div>

      <div className="divide-y divide-border">
        {/* Step 1 */}
        <div className="px-6 py-6">
          <div className="mb-4">
            <p className="font-mono text-xs text-muted-foreground">Step 1</p>
            <h3 className="text-sm font-medium">Choose a document</h3>
            <p className="text-sm text-muted-foreground">
              Select a processed document from your library.
            </p>
          </div>

          {documents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              No documents ready yet — upload one first.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {documents.map((doc) => {
                const isSelected = documentId === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setDocumentId(doc.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.fileName}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString()} · Processed
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="size-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div className="px-6 py-6">
          <div className="mb-4">
            <p className="font-mono text-xs text-muted-foreground">Step 2</p>
            <h3 className="text-sm font-medium">Choose an action</h3>
            <p className="text-sm text-muted-foreground">
              Pick what you want Clarus to do with this document.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {ANALYSIS_TYPES.map(({ type: t, label, description, icon: Icon }) => {
              const isSelected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-md",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-border px-6 py-4">
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button onClick={handleSubmit} disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running analysis...
            </>
          ) : (
            "Run analysis"
          )}
        </Button>
      </div>
    </div>
  );
}