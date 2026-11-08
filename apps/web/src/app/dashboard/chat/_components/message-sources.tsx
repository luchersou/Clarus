import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Source } from "../_lib/types";

interface MessageSourcesProps {
  sources: Source[];
}

export function MessageSources({ sources }: MessageSourcesProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Sources
      </p>

      <ul className="flex flex-wrap gap-2">
        {sources.map((source, index) => {
          const confidence = Math.round(source.confidence * 100);

          return (
            <li
              key={`${source.documentName}-${source.page}-${index}`}
              className="flex max-w-full items-center gap-2 rounded-lg border border-border bg-card py-1.5 pr-2.5 pl-2 text-xs shadow-xs"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="size-3.5" />
              </span>

              <span className="min-w-0">
                <span className="block max-w-56 truncate font-medium text-foreground">
                  {source.documentName}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Page {source.page}
                </span>
              </span>

              <span
                title="Retrieval confidence"
                className={cn(
                  "ml-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium",
                  confidence >= 75
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {confidence}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
