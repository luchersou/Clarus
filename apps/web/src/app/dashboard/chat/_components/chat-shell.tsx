"use client";

import { useChatStream } from "@/hooks/use-chat-stream";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

export function ChatShell() {
  const { messages, sendMessage, stopStreaming, isStreaming, error } = useChatStream();

  return (
    <div className="flex h-[calc(100vh-var(--header-height)-2rem)] flex-col rounded-xl border border-border bg-background">
      <MessageList messages={messages} isStreaming={isStreaming} error={error} />
      <MessageInput onSend={sendMessage} onStop={stopStreaming} isStreaming={isStreaming} />
    </div>
  );
}