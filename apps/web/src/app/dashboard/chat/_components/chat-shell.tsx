"use client";

import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStream } from "../_hooks/use-chat-stream";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

export function ChatShell() {
  const { messages, sendMessage, stopStreaming, resetChat, isStreaming, error } =
    useChatStream();

  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex h-[calc(100svh-var(--header-height)-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-background md:h-[calc(100svh-var(--header-height)-3rem)]">
      {/* Soft brand glow behind the conversation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklch,var(--primary)_9%,transparent),transparent)]"
      />

      <header className="relative flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold tracking-tight">Chat</h1>
          <p className="truncate text-xs text-muted-foreground">
            Answers grounded in your documents, with the page they came from.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetChat}
          disabled={!hasMessages}
          className="gap-1.5"
        >
          <SquarePen />
          New chat
        </Button>
      </header>

      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        error={error}
        onSuggestion={sendMessage}
      />

      <MessageInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
}
