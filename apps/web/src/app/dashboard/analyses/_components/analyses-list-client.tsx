"use client";

import { useEffect, useState } from "react";
import { FileSearch } from "lucide-react";

import { getAnalysesAction } from "@/app/dashboard/analyses/actions";
import type { Analysis } from "../_lib/types";
import { AnalysisCard } from "./analysis-card";

interface AnalysesListClientProps {
  initialAnalyses: Analysis[];
  documentNames: Record<string, string>;
  documentId?: string;
}

const POLL_INTERVAL = 4000;

export function AnalysesListClient({
  initialAnalyses,
  documentNames,
  documentId,
}: AnalysesListClientProps) {
  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [prevInitialAnalyses, setPrevInitialAnalyses] = useState(initialAnalyses);

  // Resync when the server component sends a fresh list (after a request or delete).
  if (initialAnalyses !== prevInitialAnalyses) {
    setPrevInitialAnalyses(initialAnalyses);
    setAnalyses(initialAnalyses);
  }

  // Poll only while something is running; restarting on every update isn't needed.
  const hasPending = analyses.some((analysis) => analysis.status === "PENDING");
  useEffect(() => {
    if (!hasPending) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const data = await getAnalysesAction(documentId);
        if (!cancelled) setAnalyses(data);
      } catch {
        // Transient failure: the next tick tries again.
      }
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hasPending, documentId]);

  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed p-10 text-center">
        <FileSearch className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          {documentId ? "No analyses for this document yet" : "No analyses yet"}
        </p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          Pick a document and an action above to run your first analysis.
        </p>
      </div>
    );
  }

  // Open the newest finished result so the page shows something useful right away.
  const firstCompletedId = analyses.find((analysis) => analysis.status === "COMPLETED")?.id;

  return (
    <div className="space-y-2">
      {analyses.map((analysis) => (
        <AnalysisCard
          key={analysis.id}
          analysis={analysis}
          documentName={documentNames[analysis.documentId] ?? "Deleted document"}
          defaultExpanded={analysis.id === firstCompletedId}
        />
      ))}
    </div>
  );
}
