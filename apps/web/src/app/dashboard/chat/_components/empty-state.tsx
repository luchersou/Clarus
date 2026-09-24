import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-5" />
      </div>
      <div>
        <h2 className="text-lg font-medium">Ask about your documents</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Mention a document by name or topic, and Clarus will find the answer inside it.
        </p>
      </div>
    </div>
  );
}