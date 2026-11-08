"use client";

import { useState } from "react";
import { AlertCircle, Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import type { Source } from "../_lib/types";
import { AssistantAvatar } from "./assistant-avatar";
import { MessageSources } from "./message-sources";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isError?: boolean;
  isStreaming?: boolean;
}

export function MessageBubble({
  role,
  content,
  sources = [],
  isError = false,
  isStreaming = false,
}: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm md:max-w-[75%]">
          {content}
        </p>
      </div>
    );
  }

  return (
    <div className="group/message flex gap-3">
      <AssistantAvatar className="mt-0.5" />

      <div className="min-w-0 flex-1">
        {isError ? (
          <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <p className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="size-4" />
              Something went wrong
            </p>
            <p className="mt-1 text-destructive/80">{content}</p>
          </div>
        ) : (
          <>
            <div className="prose prose-sm prose-theme max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:my-2 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-ul:my-2 prose-li:my-0.5 prose-table:my-3 prose-th:text-left first:prose-p:mt-0.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>

            <MessageSources sources={sources} />

            {!isStreaming && content && <CopyButton text={content} />}
          </>
        )}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); nothing to do
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy answer"}
      className="mt-1 -ml-2 gap-1 text-muted-foreground opacity-0 transition-opacity group-hover/message:opacity-100 focus-visible:opacity-100"
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
