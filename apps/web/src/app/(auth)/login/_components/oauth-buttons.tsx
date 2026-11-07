"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Provider = "github" | "google";

const PROVIDERS: { id: Provider; label: string; Icon: typeof GithubIcon }[] = [
  { id: "github", label: "Continue with GitHub", Icon: GithubIcon },
  { id: "google", label: "Continue with Google", Icon: GoogleIcon },
];

export function OAuthButtons() {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Coming back from the provider with the back button restores the page
  // from the bfcache, spinner included, so reset it
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => {
      if (e.persisted) setPending(null);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const handleOAuthLogin = async (provider: Provider) => {
    setPending(provider);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error || !data.url) {
      setPending(null);
      setError("We couldn't reach the provider. Please try again.");
      return;
    }

    // Keep the spinner while the browser navigates away
    window.location.assign(data.url);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {PROVIDERS.map(({ id, label, Icon }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            disabled={pending !== null}
            onClick={() => handleOAuthLogin(id)}
            className="h-10 w-full gap-3"
          >
            {pending === id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Icon className="size-4" />
            )}
            {label}
          </Button>
        ))}
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
