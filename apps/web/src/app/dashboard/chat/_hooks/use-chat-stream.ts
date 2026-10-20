"use client";

import { useCallback, useRef, useState } from "react";
import { createParser, type EventSourceMessage } from "eventsource-parser";

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

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (question: string) => {
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsStreaming(true);

    let assistantContent = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const handleEvent = (event: EventSourceMessage) => {
      if (event.event === "session") {
        sessionIdRef.current = event.data;
      } else if (event.event === "message") {
        assistantContent += event.data;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            role: "assistant",
            content: assistantContent,
          };
          return updated;
        });
      } else if (event.event === "sources") {
        try {
          const sources: Source[] = JSON.parse(event.data);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              sources,
            };
            return updated;
          });
        } catch {
          // payload malformado — ignora, não derruba a resposta
        }
      } else if (event.event === "error") {
        throw new Error(event.data || "The assistant ran into an error.");
      }
    };

    const parser = createParser({ onEvent: handleEvent });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          sessionId: sessionIdRef.current,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to start chat stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        parser.feed(decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: message,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, []);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    sendMessage,
    stopStreaming,
    isStreaming,
    error,
    sessionId: sessionIdRef.current,
  };
}