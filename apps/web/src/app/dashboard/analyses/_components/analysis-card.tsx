"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  FileSearch,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { deleteAnalysis, requestAnalysis } from "@/app/dashboard/analyses/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, formatRelativeTime } from "@/lib/utils";
import { ANALYSIS_TYPE_CONFIG, type Analysis } from "../_lib/types";
import { AnalysisResultView } from "./analysis-result-view";
import { AnalysisStatusBadge } from "./analysis-status-badge";

interface AnalysisCardProps {
  analysis: Analysis;
  documentName: string;
  defaultExpanded?: boolean;
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AnalysisCard({ analysis, documentName, defaultExpanded = false }: AnalysisCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isRetrying, startRetry] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const config = ANALYSIS_TYPE_CONFIG[analysis.type] ?? {
    label: analysis.type,
    icon: FileSearch,
  };
  const Icon = config.icon;
  const isPending = analysis.status === "PENDING";
  const contentId = `analysis-${analysis.id}-content`;

  const handleRetry = () => {
    setRetryError(null);
    startRetry(async () => {
      const result = await requestAnalysis(analysis.documentId, analysis.type);
      if (!result.ok) setRetryError(result.error);
    });
  };

  const handleDelete = () => {
    setDeleteError(null);
    startDelete(async () => {
      try {
        await deleteAnalysis(analysis.id);
        setDeleteOpen(false);
      } catch {
        setDeleteError("Unable to delete the analysis. Please try again.");
      }
    });
  };

  const handleCopy = async () => {
    if (!analysis.result) return;
    try {
      await navigator.clipboard.writeText(analysis.result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); nothing useful to show.
    }
  };

  return (
    <Card className={cn("gap-0 py-0 transition-shadow", expanded && "ring-foreground/15")}>
      <div className="flex items-center gap-2 pr-3">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          disabled={isPending}
          onClick={() => setExpanded((prev) => !prev)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default"
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground",
              analysis.status === "COMPLETED" && "border-primary/30 bg-primary/10 text-primary",
            )}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-sm font-medium">{config.label}</span>
              <AnalysisStatusBadge status={analysis.status} />
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {documentName} &middot;{" "}
              <time dateTime={analysis.createdAt} title={formatDateTime(analysis.createdAt)}>
                {formatRelativeTime(analysis.createdAt)}
              </time>
            </span>
          </span>
          {!isPending ? (
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          ) : null}
        </button>

        <AlertDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setDeleteError(null);
          }}
        >
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Delete ${config.label.toLowerCase()} analysis`}
              >
                <Trash2 />
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete analysis?</AlertDialogTitle>
              <AlertDialogDescription>
                The {config.label.toLowerCase()} of{" "}
                <span className="font-medium text-foreground">&ldquo;{documentName}&rdquo;</span>{" "}
                will be removed. The document itself is not affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError ? (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="animate-spin" /> : null}
                {isDeleting ? "Deleting..." : "Delete analysis"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {expanded && !isPending ? (
        <div id={contentId} className="border-t px-4 py-4 md:px-5">
          {analysis.status === "FAILED" ? (
            <div className="space-y-3">
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>
                  {analysis.failureReason ?? "Something went wrong while running this analysis."}
                </AlertDescription>
              </Alert>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleRetry} disabled={isRetrying}>
                  {isRetrying ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  Try again
                </Button>
                {retryError ? <p className="text-sm text-destructive">{retryError}</p> : null}
              </div>
            </div>
          ) : analysis.result ? (
            <div className="space-y-3">
              <AnalysisResultView content={analysis.result.content} />
              <div className="flex justify-end border-t pt-3">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button variant="ghost" size="sm" onClick={handleCopy} aria-live="polite" />
                    }
                  >
                    {copied ? <Check /> : <Copy />}
                    {copied ? "Copied" : "Copy"}
                  </TooltipTrigger>
                  <TooltipContent>Copy the result as Markdown</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">This analysis has no result.</p>
          )}
        </div>
      ) : null}
    </Card>
  );
}
