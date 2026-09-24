import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageSources } from "./message-sources";

interface Source {
  documentName: string;
  page: number;
  confidence: number;
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isError?: boolean;
}

export function MessageBubble({
  role,
  content,
  sources = [],
  isError = false,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isError
            ? "border border-destructive/30 bg-destructive/10 text-destructive"
            : isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
        )}
      >
        {isError && (
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium">
            <AlertCircle className="size-3.5" />
            Something went wrong
          </div>
        )}
        <p className="whitespace-pre-wrap">{content}</p>
        {!isUser && !isError && <MessageSources sources={sources} />}
      </div>
    </div>
  );
}