import { Suspense } from "react";
import { getDocuments } from "@/lib/api/documents";
import { NewAnalysisForm } from "./_components/new-analysis-form";
import { AnalysesFilter } from "./_components/analyses-filter";
import { AnalysesList } from "./_components/analyses-list";

interface AnalysesPageProps {
  searchParams: Promise<{ documentId?: string }>;
}

export default async function AnalysesPage({ searchParams }: AnalysesPageProps) {
  const { documentId } = await searchParams;
  const documents = await getDocuments();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analyses</h1>
        <p className="text-sm text-muted-foreground">
          Run structured analyses on your documents and review the results.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <NewAnalysisForm />
      </Suspense>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">History</h2>
        <AnalysesFilter documents={documents} />
      </div>

      <Suspense key={documentId} fallback={<div>Loading...</div>}>
        <AnalysesList documentId={documentId} />
      </Suspense>
    </div>
  );
}