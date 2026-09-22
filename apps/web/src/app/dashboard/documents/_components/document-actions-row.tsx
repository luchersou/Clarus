"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Trash2 } from "lucide-react";

import { deleteDocument } from "../actions";
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

interface DocumentActionsRowProps {
  documentId: string;
  documentName: string;
  canAnalyse: boolean;
}

export function DocumentActionsRow({
  documentId,
  documentName,
  canAnalyse,
}: DocumentActionsRowProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      try {
        await deleteDocument(documentId);
        setOpen(false);
        router.refresh();
      } catch {
        setIsDeleting(false);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!canAnalyse}
        className="border-foreground/5!"
        onClick={() => router.push(`/dashboard/analyses?documentId=${documentId}`)}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Analyse
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
					render={
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
							aria-label="Delete document"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					}
				/>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                &ldquo;{documentName}&rdquo;
              </span>{" "}
              will be removed from your documents. Analyses already run on it
              will remain available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete document"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}