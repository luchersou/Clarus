"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function MessageInput({ onSend, onStop, isStreaming }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;

    onSend(trimmed);
    setValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask about a document..."
          rows={1}
          className="max-h-40 flex-1 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />

        {isStreaming ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0 rounded-full"
            onClick={onStop}
          >
            <Square className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            className="shrink-0 rounded-full"
            disabled={!value.trim()}
            onClick={handleSend}
          >
            <ArrowUp className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}