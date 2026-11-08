"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "../_lib/types";
import { MessageBubble } from "./message-bubble";
import { StreamingIndicator } from "./streaming-indicator";
import { EmptyState } from "./empty-state";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  onSuggestion: (question: string) => void;
}

export function MessageList({
  messages,
  isStreaming,
  error,
  onSuggestion,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth scrolling on every streamed token makes the view lag behind
    bottomRef.current?.scrollIntoView({
      behavior: isStreaming ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return <EmptyState onSuggestion={onSuggestion} />;
  }

  const lastIndex = messages.length - 1;
  const last = messages[lastIndex];
  const showTypingIndicator =
    isStreaming && last?.role === "assistant" && last.content === "";

  return (
    <div className="relative flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
        {messages.map((message, index) => {
          const isLast = index === lastIndex;

          // The empty placeholder is shown as the typing indicator instead
          if (isLast && showTypingIndicator) return null;

          return (
            <MessageBubble
              key={index}
              role={message.role}
              content={message.content}
              sources={message.sources}
              isError={isLast && !!error && message.role === "assistant"}
              isStreaming={isLast && isStreaming}
            />
          );
        })}

        {showTypingIndicator && <StreamingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
