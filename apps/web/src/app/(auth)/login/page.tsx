import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./_components/login-form";
import { OAuthButtons } from "./_components/oauth-buttons";
import { ProductPanel } from "./_components/product-panel";

export const metadata: Metadata = {
  title: "Sign in — Clarus",
};

// Errors sent back by /auth/callback
const CALLBACK_ERRORS: Record<string, string> = {
  missing_code: "Sign-in was cancelled or didn't finish. Please try again.",
  auth_callback_failed: "We couldn't complete your sign-in. Please try again.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  const { error } = await searchParams;
  const callbackError =
    typeof error === "string" ? CALLBACK_ERRORS[error] : undefined;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <main className="flex w-full flex-col px-4 py-6 sm:px-8 lg:w-1/2 lg:px-16">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 self-start"
        >
          <span className="rounded-sm bg-primary/80 p-0.5">
            <span className="flex size-7.5 items-center justify-center rounded-sm bg-primary text-base font-bold text-primary-foreground transition-shadow duration-300 group-hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]">
              C
            </span>
          </span>
          <span className="font-semibold tracking-tight">Clarus</span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-tight">
            Sign in to Clarus
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            New here? Continue with GitHub or Google and your workspace is
            created automatically.
          </p>

          {callbackError && (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {callbackError}
            </p>
          )}

          <div className="mt-8">
            <OAuthButtons />
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or with email
            <span className="h-px flex-1 bg-border" />
          </div>

          <LoginForm />

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Email sign-in works once you&apos;ve set a password in Settings.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 self-start text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>
      </main>

      <aside className="hidden p-2 lg:block lg:w-1/2">
        <ProductPanel />
      </aside>
    </div>
  );
}
