"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, FileUp, Loader2 } from "lucide-react";

import { uploadDocument } from "../actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isAcceptedFile = (file: File) => {
  const acceptedExtensions = [".pdf", ".docx", ".xlsx"];
  return (
    ACCEPTED_TYPES.includes(file.type) ||
    acceptedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
};

export function DocumentUploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const selectFile = (nextFile?: File) => {
    setError(null);
    setSuccess(null);

    if (!nextFile) return;

    if (!isAcceptedFile(nextFile)) {
      setFile(null);
      setError("Upload a PDF, Word, or Excel file.");
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("File must be 15 MB or smaller.");
      return;
    }

    setFile(nextFile);
  };

  const handleUpload = () => {
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Choose a file first.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        await uploadDocument(formData);

        setSuccess(`${file.name} uploaded successfully.`);
        setFile(null);
        router.refresh();
      } catch {
        setError("Unable to upload document. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-foreground/5 bg-card/20 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 py-3 md:px-5 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Upload Document
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a PDF, Word, or Excel file to start analyzing it.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <button
          type="button"
          className={cn(
            "relative flex min-h-44 w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-sm border border-dashed border-foreground/10 bg-muted/10! px-4 py-8 text-center transition-all duration-300 ease-in-out",
            isDragging
              ? "scale-[1.01] border-primary bg-primary/5! shadow-sm"
              : "hover:border-primary/40 hover:bg-muted/40!",
            isPending && "pointer-events-none border-primary/30 bg-primary/5!",
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            selectFile(event.dataTransfer.files[0]);
          }}
          disabled={isPending}
        >
          <div className="z-10 flex h-10 w-10 items-center justify-center rounded-sm border border-foreground/5 bg-card shadow-xs">
            <FileUp
              className={cn(
                "h-5 w-5 text-muted-foreground transition-colors",
                isDragging && "text-primary",
              )}
            />
          </div>
          <div className="z-10 space-y-1">
            <p className="text-xs font-medium">
              {file ? file.name : "Choose a file or drag it here"}
            </p>
            <p className="text-xs text-muted-foreground">
              {file ? formatBytes(file.size) : "PDF, Word, or Excel, up to 15 MB"}
            </p>
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.xlsx"
          className="hidden"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />

        <Button
          type="button"
          className={cn(
            "mt-2 h-9 w-full text-xs font-semibold tracking-tight md:text-sm",
            success && "bg-emerald-500 text-white hover:bg-emerald-600",
          )}
          onClick={handleUpload}
          disabled={isPending || (!file && !success)}
        >
          {success ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </div>
          ) : isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Uploading
            </>
          ) : (
            "Upload document"
          )}
        </Button>
      </div>
    </div>
  );
}