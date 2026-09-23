"use client";

import { useEffect, useState } from "react";

import { getAnalysesAction } from "@/lib/actions/analyses";
import { AnalysisCard } from "./analysis-card";

interface Analysis {
  id: string;
  documentId: string;
  type: "SUMMARY" | "EXTRACT_VALUES" | "DEADLINES" | "COMPARE";
  status: "PENDING" | "COMPLETED" | "FAILED";
  result: { content: string } | null;
  failureReason: string | null;
  createdAt: string;
}

interface AnalysesListClientProps {
  initialAnalyses: Analysis[];
  documentId?: string;
}

const POLL_INTERVAL = 4000;

export function AnalysesListClient({
  initialAnalyses,
  documentId,
}: AnalysesListClientProps) {
  const [analyses, setAnalyses] = useState(initialAnalyses);

  useEffect(() => {
    setAnalyses(initialAnalyses);
  }, [initialAnalyses]);

  useEffect(() => {
    const hasPending = analyses.some((a) => a.status === "PENDING");
    if (!hasPending) return;

    const interval = setInterval(async () => {
      const data = await getAnalysesAction(documentId);
      setAnalyses(data);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [analyses, documentId]);

  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-sm border border-dashed p-8 text-center">
        <p className="text-sm font-medium text-foreground">No analyses yet</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          Select a document above and run your first analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis) => (
        <AnalysisCard key={analysis.id} analysis={analysis} />
      ))}
    </div>
  );
}