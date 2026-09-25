"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import {
  unlinkIdentityAction,
  getLinkIdentityUrl,
} from "@/lib/actions/account";
import { createClient } from "@/lib/supabase/client";
import { GithubIcon } from "@/components/icons/github-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Identity {
  identity_id: string;
  provider: string;
}

const PROVIDERS = [
  { id: "google" as const, label: "Google", icon: GoogleIcon },
  { id: "github" as const, label: "GitHub", icon: GithubIcon },
];

export function ConnectedAccountsSection() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUserIdentities().then(({ data }) => {
      setIdentities(data?.identities ?? []);
      setIsLoading(false);
    });
  }, []);

  const canUnlink = identities.length > 1;

  const handleUnlink = (identityId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await unlinkIdentityAction(identityId);
        setIdentities((prev) => prev.filter((i) => i.identity_id !== identityId));
      } catch {
        setError("Unable to disconnect this account.");
      }
    });
  };

  const handleLink = (provider: "google" | "github") => {
    setError(null);
    startTransition(async () => {
      try {
        const url = await getLinkIdentityUrl(
          provider,
          `${window.location.origin}/auth/callback`,
        );
        window.location.href = url;
      } catch {
        setError("Unable to connect this account.");
      }
    });
  };

  return (
    <section className="rounded-sm border border-border bg-card">
      <div className="border-b border-border px-3 py-3 md:px-5 md:py-4">
        <h2 className="text-xs font-semibold tracking-tight md:text-sm">
          Connected accounts
        </h2>
        <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
          Manage which accounts you can use to sign in.
        </p>
      </div>

      <div className="space-y-3 p-3 sm:p-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          PROVIDERS.map(({ id, label, icon: Icon }) => {
            const identity = identities.find((i) => i.provider === id);
            const isLinked = !!identity;

            return (
              <div
                key={id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-5" />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {isLinked ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>

                {isLinked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending || !canUnlink}
                    onClick={() => handleUnlink(identity.identity_id)}
                    title={!canUnlink ? "You need at least one sign-in method" : undefined}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleLink(id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}