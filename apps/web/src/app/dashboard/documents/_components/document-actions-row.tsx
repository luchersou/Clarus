"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Sparkles, Trash2 } from "lucide-react";

import { deleteDocument } from "../actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentActionsRowProps {
  documentId: string;
  documentName: string;
  canAnalyze: boolean;
}

export function DocumentActionsRow({
  documentId,
  documentName,
  canAnalyze,
}: DocumentActionsRowProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setError(null);
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteDocument(documentId);
        setOpen(false);
        router.refresh();
      } catch {
        setError("Unable to delete the document. Please try again.");
      }
    });
  };

  return (
    <div className="flex items-center gap-1">
      {canAnalyze ? (
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          render={<Link href={`/dashboard/analyses?documentId=${documentId}`} />}
        >
          <Sparkles />
          Analyze
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger render={<span tabIndex={0} className="rounded-lg outline-none" />}>
            <Button variant="outline" size="sm" disabled>
              <Sparkles />
              Analyze
            </Button>
          </TooltipTrigger>
          <TooltipContent>Available once the document is ready</TooltipContent>
        </Tooltip>
      )}

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Delete ${documentName}`}
            >
              <Trash2 />
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">&ldquo;{documentName}&rdquo;</span>{" "}
              will be removed from your documents. Analyses already run on it will remain
              available.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : null}
              {isDeleting ? "Deleting..." : "Delete document"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
