import { ArrowUpRight, CalendarClock, FileSearch, Percent, Scale } from "lucide-react";
import { AssistantAvatar } from "./assistant-avatar";

const SUGGESTIONS = [
  { icon: FileSearch, text: "What is the total amount in my latest contract?" },
  { icon: CalendarClock, text: "When are the upcoming payment due dates?" },
  { icon: Percent, text: "Is there a late fee, and how is it calculated?" },
  { icon: Scale, text: "Summarize the termination clauses." },
];

interface EmptyStateProps {
  onSuggestion: (question: string) => void;
}

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    // m-auto instead of justify-center: centered when it fits, and when it
    // doesn't, it overflows downwards and scrolls instead of clipping the top
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 md:py-8">
      <div className="m-auto w-full max-w-2xl text-center">
        <AssistantAvatar className="mx-auto size-11 rounded-lg text-lg ring-4" />

        <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          Ask anything about your documents
        </h2>
        <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
          Mention a document by name or topic, and Clarus will find the answer
          inside it and show you where it came from.
        </p>

        <ul className="mt-6 grid gap-2 text-left sm:grid-cols-2">
          {SUGGESTIONS.map(({ icon: Icon, text }) => (
            <li key={text}>
              <button
                type="button"
                onClick={() => onSuggestion(text)}
                className="group flex h-full w-full items-start gap-3 rounded-xl border border-border bg-card/80 p-3.5 text-sm shadow-xs transition-all hover:-translate-y-px hover:border-primary/30 hover:bg-accent/40 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-3.5" />
                </span>
                <span className="flex-1 pt-1 leading-snug text-foreground/80 group-hover:text-foreground">
                  {text}
                </span>
                <ArrowUpRight className="mt-1 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
