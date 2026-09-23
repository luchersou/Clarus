interface AnalysisResult {
  content: string;
}

interface AnalysisResultViewProps {
  result: AnalysisResult;
}

export function AnalysisResultView({ result }: AnalysisResultViewProps) {
  return (
    <div className="whitespace-pre-wrap rounded-sm border bg-muted/20 p-4 text-sm leading-relaxed text-foreground">
      {result.content}
    </div>
  );
}