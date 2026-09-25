"use client";

import { useState, useTransition } from "react";
import { Loader2, MailCheck } from "lucide-react";

import { updateEmailAction } from "@/lib/actions/account";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EmailSection() {
  const { user } = useSupabaseUser();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentEmail = user?.email ?? "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || email === currentEmail) {
      setError("Enter a different email address.");
      return;
    }

    startTransition(async () => {
      try {
        await updateEmailAction(email);
        setPendingConfirmation(true);
      } catch {
        setError("Unable to update email. Please try again.");
      }
    });
  };

  return (
    <section className="rounded-sm border border-border bg-card">
      <div className="border-b border-border px-3 py-3 md:px-5 md:py-4">
        <h2 className="text-xs font-semibold tracking-tight md:text-sm">Email</h2>
        <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
          Update the email address used to sign in and receive notifications.
        </p>
      </div>

      <div className="space-y-4 p-3 sm:p-6">
        {pendingConfirmation ? (
          <Alert>
            <MailCheck className="size-4" />
            <AlertDescription>
              We sent a confirmation link to <strong>{email}</strong>. Your
              email will only change after you confirm it.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="current-email">Current email</Label>
              <Input id="current-email" value={currentEmail} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">New email</Label>
              <Input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isPending}
              />
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending confirmation...
                </>
              ) : (
                "Update email"
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}