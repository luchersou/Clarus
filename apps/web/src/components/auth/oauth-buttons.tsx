"use client";

import { GithubIcon } from "@/components/icons/github-icon";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function OAuthButtons() {
  const handleOAuthLogin = async (provider: "github" | "google") => {
    const supabase = createClient();
    const { data } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="grid gap-4">
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full gap-4 rounded-lg border-2 border-foreground/10!"
        onClick={() => handleOAuthLogin("github")}
      >
        <GithubIcon className="h-4 w-4" />
        Sign in with GitHub
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full gap-4 rounded-lg border-2 border-foreground/10!"
        onClick={() => handleOAuthLogin("google")}
      >
        {/* svg do Google, igual já estava */}
        Sign in with Google
      </Button>
    </div>
  );
}