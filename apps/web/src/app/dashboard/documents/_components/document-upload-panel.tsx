"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, FileUp, Loader2, RotateCw, XIcon } from "lucide-react";

import { uploadDocument } from "../actions";
import { formatBytes } from "../_lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".xlsx"];
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

type UploadState = "uploading" | "done" | "error";

interface UploadItem {
  id: string;
  file: File;
  state: UploadState;
  error?: string;
}

function validate(file: File): string | null {
  const hasAcceptedType =
    ACCEPTED_TYPES.includes(file.type) ||
    ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (!hasAcceptedType) return "Only PDF, Word, or Excel files are supported.";
  if (file.size > MAX_FILE_SIZE) return "File must be 15 MB or smaller.";
  return null;
}

export function DocumentUploadPanel() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const updateItem = (id: string, patch: Partial<UploadItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const upload = async (item: UploadItem) => {
    updateItem(item.id, { state: "uploading", error: undefined });
    try {
      const formData = new FormData();
      formData.append("file", item.file);
      await uploadDocument(formData);
      updateItem(item.id, { state: "done" });
      router.refresh();
    } catch {
      updateItem(item.id, { state: "error", error: "Upload failed. Please try again." });
    }
  };

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: UploadItem[] = Array.from(fileList).map((file) => {
      const error = validate(file);
      return {
        id: crypto.randomUUID(),
        file,
        state: error ? "error" : "uploading",
        error: error ?? undefined,
      };
    });

    // Finished uploads from a previous batch are no longer interesting.
    setItems((current) => [...newItems, ...current.filter((item) => item.state !== "done")]);

    // One at a time keeps the order predictable and avoids hammering the API.
    for (const item of newItems) {
      if (item.state === "uploading") await upload(item);
    }
  };

  const isUploading = items.some((item) => item.state === "uploading");

  return (
    <section aria-label="Upload documents" className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-describedby="upload-hint"
        className={cn(
          "flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-4 py-6 text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:text-left",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-foreground/15 hover:border-primary/40 hover:bg-muted/40",
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          // Ignore leave events fired when moving over child elements.
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void addFiles(event.dataTransfer.files);
        }}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors",
            isDragging && "border-primary text-primary",
          )}
        >
          {isUploading ? <Loader2 className="size-5 animate-spin" /> : <FileUp className="size-5" />}
        </span>
        <div className="flex-1 space-y-0.5">
          <p className="text-sm font-medium">
            {isDragging ? "Drop to upload" : "Drop files here or click to browse"}
          </p>
          <p id="upload-hint" className="text-xs text-muted-foreground">
            PDF, Word, or Excel, up to 15 MB each. You can pick several at once.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="pointer-events-none hidden sm:inline-flex"
          tabIndex={-1}
          aria-hidden="true"
        >
          Choose files
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.xlsx"
        className="hidden"
        onChange={(event) => {
          void addFiles(event.target.files);
          // Allow picking the same file again after a failure.
          event.target.value = "";
        }}
      />

      {items.length > 0 ? (
        <ul className="divide-y rounded-xl border bg-card" aria-live="polite">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="shrink-0">
                {item.state === "uploading" ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : item.state === "done" ? (
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="size-4 text-destructive" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={item.file.name}>
                  {item.file.name}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    item.state === "error" ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {item.state === "uploading"
                    ? `Uploading · ${formatBytes(item.file.size)}`
                    : item.state === "done"
                      ? "Uploaded, processing now"
                      : item.error}
                </p>
              </div>
              {item.state === "error" && !validate(item.file) ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Retry ${item.file.name}`}
                  onClick={() => void upload(item)}
                >
                  <RotateCw />
                </Button>
              ) : null}
              {item.state !== "uploading" ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Dismiss ${item.file.name}`}
                  onClick={() => removeItem(item.id)}
                >
                  <XIcon />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
