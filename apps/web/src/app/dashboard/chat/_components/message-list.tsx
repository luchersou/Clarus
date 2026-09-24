"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { StreamingIndicator } from "./streaming-indicator";
import { EmptyState } from "./empty-state";

interface Source {
  documentName: string;
  page: number;
  confidence: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
}

export function MessageList({ messages, isStreaming, error }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  const lastIndex = messages.length - 1;
  const showTypingIndicator =
    isStreaming && messages[lastIndex]?.role === "assistant" && messages[lastIndex]?.content === "";

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-6">
      {messages.map((message, index) => {
        const isLastMessage = index === lastIndex;
        const isErrorMessage = isLastMessage && !!error && message.role === "assistant";

        return (
          <MessageBubble
            key={index}
            role={message.role}
            content={message.content}
            sources={message.sources}
            isError={isErrorMessage}
          />
        );
      })}

      {showTypingIndicator && <StreamingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}