"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { signOutAllDevicesAction } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

export function SessionsSection() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOutAll = () => {
    setError(null);
    startTransition(async () => {
      try {
        await signOutAllDevicesAction();
        router.push("/login");
        router.refresh();
      } catch {
        setError("Unable to sign out of all devices.");
        setOpen(false);
      }
    });
  };

  return (
    <section className="rounded-sm border border-border bg-card">
      <div className="border-b border-border px-3 py-3 md:px-5 md:py-4">
        <h2 className="text-xs font-semibold tracking-tight md:text-sm">Sessions</h2>
        <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
          Manage where you're currently signed in.
        </p>
      </div>

      <div className="space-y-4 p-3 sm:p-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sign out everywhere</p>
            <p className="text-xs text-muted-foreground">
              This will sign you out on all devices, including this one.
            </p>
          </div>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger
							render={
								<Button variant="outline" size="sm" disabled={isPending}>
									<LogOut className="mr-2 size-3.5" />
									Sign out all devices
								</Button>
							}
						/>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
                <AlertDialogDescription>
                  You'll be signed out everywhere, including this session.
                  You'll need to log in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleSignOutAll();
                  }}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    "Sign out everywhere"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </section>
  );
}