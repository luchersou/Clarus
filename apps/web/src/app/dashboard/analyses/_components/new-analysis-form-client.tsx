"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  SearchIcon,
  Sparkles,
} from "lucide-react";

import { requestAnalysis } from "@/app/dashboard/analyses/actions";
import type { AnalysisQuota } from "@/lib/api/analyses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatRelativeTime } from "@/lib/utils";
import { ANALYSIS_TYPE_CONFIG, ANALYSIS_TYPES, type AnalysisType } from "../_lib/types";

interface Document {
  id: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "XLSX";
  createdAt: string;
}

interface NewAnalysisFormClientProps {
  documents: Document[];
  quota: AnalysisQuota | null;
}

// Above this many documents a search box helps more than scrolling.
const SEARCH_THRESHOLD = 6;

const FILE_ICONS = {
  PDF: FileText,
  DOCX: FileText,
  XLSX: FileSpreadsheet,
};

function formatResetTime(resetsAt: string) {
  return new Date(resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function StepHeading({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-medium text-muted-foreground">
        {step}
      </span>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

const choiceClassName = (selected: boolean) =>
  cn(
    "flex w-full gap-3 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
    selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
  );

export function NewAnalysisFormClient({ documents, quota }: NewAnalysisFormClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialDocumentId = searchParams.get("documentId") ?? undefined;
  const [documentId, setDocumentId] = useState<string | undefined>(
    documents.some((doc) => doc.id === initialDocumentId) ? initialDocumentId : undefined,
  );
  const [type, setType] = useState<AnalysisType | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const quotaReached = quota !== null && quota.remaining === 0;
  const selectedDocument = documents.find((doc) => doc.id === documentId);

  const visibleDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return documents;
    return documents.filter((doc) => doc.fileName.toLowerCase().includes(normalized));
  }, [documents, query]);

  const handleSubmit = () => {
    if (!documentId || !type) return;

    setError(null);
    setStarted(null);

    startTransition(async () => {
      try {
        const result = await requestAnalysis(documentId, type);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setStarted(
          `${ANALYSIS_TYPE_CONFIG[type].label} started for ${selectedDocument?.fileName ?? "your document"}. It will appear in the history below.`,
        );
        setType(undefined);
        router.push(`/dashboard/analyses?documentId=${documentId}`, { scroll: false });
      } catch {
        setError("Unable to start analysis. Please try again.");
      }
    });
  };

  return (
    <section aria-label="New analysis" className="rounded-xl border bg-card">
      <div className="border-b px-5 py-4 md:px-6">
        <h2 className="text-base font-semibold">New analysis</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a ready document and what you want to get out of it.
        </p>
      </div>

      <div className="grid divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div className="px-5 py-5 md:px-6">
          <StepHeading
            step={1}
            title="Choose a document"
            description="Only processed documents can be analyzed."
          />

          {documents.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">No documents are ready yet.</p>
              <Button
                nativeButton={false}
                size="sm"
                variant="outline"
                className="mt-3"
                render={<Link href="/dashboard/documents" />}
              >
                Upload a document
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.length > SEARCH_THRESHOLD ? (
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search documents..."
                    aria-label="Search documents"
                    className="pl-8"
                  />
                </div>
              ) : null}

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {visibleDocuments.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No documents match &ldquo;{query}&rdquo;.
                  </p>
                ) : (
                  visibleDocuments.map((doc) => {
                    const isSelected = documentId === doc.id;
                    const Icon = FILE_ICONS[doc.fileType] ?? FileText;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setDocumentId(doc.id)}
                        className={cn(choiceClassName(isSelected), "items-center")}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            Uploaded {formatRelativeTime(doc.createdAt)}
                          </span>
                        </span>
                        {isSelected ? <Check className="size-4 shrink-0 text-primary" /> : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-5 md:px-6">
          <StepHeading
            step={2}
            title="Choose an action"
            description="What should Clarus do with this document?"
          />

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {ANALYSIS_TYPES.map(({ type: t, label, description, icon: Icon }) => {
              const isSelected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setType(t)}
                  className={cn(choiceClassName(isSelected), "items-start")}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs leading-5 text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t px-5 py-4 md:px-6">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {started ? (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-4 shrink-0" />
            {started}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 truncate text-sm text-muted-foreground">
            {selectedDocument && type ? (
              <>
                <span className="font-medium text-foreground">{ANALYSIS_TYPE_CONFIG[type].label}</span>{" "}
                of <span className="font-medium text-foreground">{selectedDocument.fileName}</span>
              </>
            ) : !selectedDocument ? (
              "Select a document to continue."
            ) : (
              "Select an action to continue."
            )}
          </p>

          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-4">
            {quota ? (
              <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                {quotaReached
                  ? `Daily limit reached. Resets at ${formatResetTime(quota.resetsAt)}.`
                  : `${quota.remaining} of ${quota.limit} left today`}
              </p>
            ) : null}
            <Button
              onClick={handleSubmit}
              disabled={isPending || quotaReached || !documentId || !type}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {isPending ? "Starting..." : "Run analysis"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
