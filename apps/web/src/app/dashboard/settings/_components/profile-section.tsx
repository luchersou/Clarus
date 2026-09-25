"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

import { updateProfileAction } from "@/lib/actions/account";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ProfileSection() {
  const { user, isLoading: isLoadingUser } = useSupabaseUser();
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name ?? "");
    }
  }, [user]);

  const avatarUrl = user?.user_metadata?.avatar_url ?? "";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!fullName.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    startTransition(async () => {
      try {
        await updateProfileAction(fullName.trim());
        setSuccess(true);
      } catch {
        setError("Unable to update profile. Please try again.");
      }
    });
  };

  if (isLoadingUser) {
    return (
      <section className="flex items-center justify-center rounded-sm border border-border bg-card p-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </section>
    );
  }

  return (
    <section className="rounded-sm border border-border bg-card">
      <div className="border-b border-border px-3 py-3 md:px-5 md:py-4">
        <h2 className="text-xs font-semibold tracking-tight md:text-sm">Profile</h2>
        <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
          Update your name and how you appear across Clarus.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-3 sm:p-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="size-4" />
            <AlertDescription>Profile updated successfully.</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback>{initials || "?"}</AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground">
            {avatarUrl
              ? "Your avatar is synced from your connected account."
              : "Connect Google or GitHub to add an avatar."}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isPending}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </section>
  );
}