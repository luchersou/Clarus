import { AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const shouldRenderMarkdown = !isUser && !isError;

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

        {shouldRenderMarkdown ? (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}

        {!isUser && !isError && <MessageSources sources={sources} />}
      </div>
    </div>
  );
}