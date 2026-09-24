interface Source {
  documentName: string;
  page: number;
  confidence: number;
}

interface MessageSourcesProps {
  sources: Source[];
}

export function MessageSources({ sources }: MessageSourcesProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border/50 pt-2">
      {sources.map((source, index) => (
        <span
          key={`${source.documentName}-${source.page}-${index}`}
          className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
        >
          {source.documentName} · p.{source.page} · {Math.round(source.confidence * 100)}%
        </span>
      ))}
    </div>
  );
}