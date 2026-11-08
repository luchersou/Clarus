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

    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.focus();
    }
  };

  // Fallback for browsers without field-sizing: grow with the content
  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative px-4 pt-2 pb-4 md:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 pl-4 shadow-sm transition-[border-color,box-shadow] focus-within:border-primary/40 focus-within:shadow-md focus-within:ring-3 focus-within:ring-primary/10">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask about a contract, invoice or report…"
            aria-label="Message"
            rows={1}
            className="min-h-0 max-h-40 flex-1 resize-none border-0 bg-transparent px-0 py-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />

          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Stop generating"
              className="size-9 shrink-0 rounded-xl"
              onClick={onStop}
            >
              <Square className="size-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              aria-label="Send message"
              className="size-9 shrink-0 rounded-xl"
              disabled={!value.trim()}
              onClick={handleSend}
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>

        <p className="mt-2 hidden text-center text-[11px] text-muted-foreground sm:block">
          <kbd className="font-sans font-medium">Enter</kbd> to send ·{" "}
          <kbd className="font-sans font-medium">Shift + Enter</kbd> for a new line
        </p>
      </div>
    </div>
  );
}
