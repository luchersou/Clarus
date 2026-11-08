import { cn } from "@/lib/utils";

export function AssistantAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground shadow-sm ring-2 ring-primary/15",
        className,
      )}
    >
      C
    </span>
  );
}
