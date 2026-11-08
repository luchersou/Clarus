import { AssistantAvatar } from "./assistant-avatar";

export function StreamingIndicator() {
  return (
    <div className="flex items-center gap-3" role="status">
      <AssistantAvatar />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex gap-1">
          <span className="size-1.5 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-primary/70" />
        </span>
        Searching your documents…
      </div>
    </div>
  );
}
