"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { deleteAccountAction } from "@/lib/actions/account";
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

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteAccountAction();
      router.push("/");
    });
  };

  return (
    <section className="flex flex-col overflow-hidden rounded-sm border border-destructive/20 bg-destructive/5 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-destructive/20 bg-destructive/10 px-3 py-3 md:px-5 md:py-4">
        <div>
          <h2 className="text-xs font-semibold tracking-tight text-destructive md:text-sm">
            Danger Zone
          </h2>
          <p className="mt-1 text-[10px] text-destructive/80 md:text-xs">
            Irreversible actions — proceed with caution.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 sm:p-6">
        <div>
          <p className="text-xs font-medium md:text-sm">Delete Account</p>
          <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
            Permanently delete your account and all associated data.
          </p>
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger
						render={<Button variant="destructive" size="sm" className="h-7 md:h-9" />}
					>
						Delete Account
					</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete account?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete your account? All
                your documents, analyses, and data will be lost. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}