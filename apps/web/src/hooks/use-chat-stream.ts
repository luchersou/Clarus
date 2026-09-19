"use client";

import { useCallback, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UseChatStreamOptions {
  documentId?: string;
}

export function useChatStream({ documentId }: UseChatStreamOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const sessionIdRef = useRef<string | undefined>(undefined);

  const sendMessage = useCallback(
    async (question: string) => {
      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setIsStreaming(true);

      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            sessionId: sessionIdRef.current,
            documentId,
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error("Failed to start chat stream");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const rawEvent of events) {
            const eventTypeMatch = rawEvent.match(/^event: (.+)$/m);
            const dataMatch = rawEvent.match(/^data: (.*)$/m);
            const eventType = eventTypeMatch?.[1];
            const data = dataMatch?.[1] ?? "";

            if (eventType === "session") {
              sessionIdRef.current = data;
            } else if (eventType === "message") {
              assistantContent += data;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          }
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [documentId],
  );

  return { messages, sendMessage, isStreaming, sessionId: sessionIdRef.current };
}