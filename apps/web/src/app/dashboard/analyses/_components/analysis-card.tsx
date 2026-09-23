"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Loader2, RefreshCw, Trash2 } from "lucide-react";

import { deleteAnalysis, requestAnalysis } from "@/lib/actions/analyses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AnalysisResultView } from "./analysis-result-view";
import { AnalysisStatusBadge } from "./analysis-status-badge";

interface Analysis {
  id: string;
  documentId: string;
  type: "SUMMARY" | "EXTRACT_VALUES" | "DEADLINES" | "COMPARE";
  status: "PENDING" | "COMPLETED" | "FAILED";
  result: { content: string } | null;
  failureReason: string | null;
  createdAt: string;
}

interface AnalysisCardProps {
  analysis: Analysis;
}

const TYPE_LABEL: Record<Analysis["type"], string> = {
  SUMMARY: "Summary",
  EXTRACT_VALUES: "Extract values",
  DEADLINES: "Deadlines",
  COMPARE: "Comparison",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRetry = () => {
    startTransition(async () => {
      await requestAnalysis(analysis.documentId, analysis.type);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteAnalysis(analysis.id);
    });
  };

  return (
    <Card>
      <CardHeader
        className="flex cursor-pointer flex-row items-center justify-between gap-3 py-4"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">{TYPE_LABEL[analysis.type]}</p>
          <AnalysisStatusBadge status={analysis.status} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDate(analysis.createdAt)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete();
            }}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {expanded ? (
        <CardContent className="pt-0">
          {analysis.status === "PENDING" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing your document...
            </div>
          ) : analysis.status === "FAILED" ? (
            <div className="space-y-3">
              <Alert variant="destructive">
                <AlertDescription>
                  {analysis.failureReason ?? "Something went wrong."}
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Try again
              </Button>
            </div>
          ) : analysis.result ? (
            <AnalysisResultView result={analysis.result} />
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}