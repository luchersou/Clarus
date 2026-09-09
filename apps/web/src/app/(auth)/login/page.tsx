import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
      {/* Left side */}
      <main className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-sm space-y-6 px-2 md:space-y-8 md:px-6">
          {/* Brand */}
          <div className="space-y-2">
            <Link href="/" className="group mb-6 flex items-center gap-2 md:mb-8">
              <div className="rounded-md bg-primary p-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary/80 font-bold text-primary-foreground transition-shadow group-hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]">
                  C
                </div>
              </div>
              <span className="text-base font-bold md:text-xl">Clarus</span>
            </Link>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Welcome back
            </h1>

            <p className="text-sm text-muted-foreground">
              Sign in to your financial intelligence workspace.
            </p>
          </div>

          {/* Email and password */}
          <LoginForm />

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth */}
          <OAuthButtons />

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our terms and privacy policy.
          </p>
        </div>
      </main>

      {/* Right side */}
      <aside className="relative hidden w-1/2 overflow-hidden bg-background lg:flex">
        {/* Background effect */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden blur-3xl"
        >
          <div className="absolute top-1/2 left-1/4 aspect-square w-[70vh] -translate-y-1/2 animate-fade-in rounded-full bg-primary/20" />
          <div className="absolute top-1/3 left-1/2 aspect-square w-[50vh] -translate-y-1/2 animate-fade-in rounded-full bg-primary/10" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex w-full flex-col items-start justify-center px-12 py-16 xl:px-16">
          <div className="max-w-md space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Your financial intelligence workspace.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Understand your finances, analyze your documents and turn
              financial data into actionable insights with AI.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}