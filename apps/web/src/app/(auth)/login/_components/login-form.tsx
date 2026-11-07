"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { loginWithPassword, type LoginState } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: LoginState = { error: null, email: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginWithPassword,
    INITIAL_STATE,
  );

  const invalid = Boolean(state.error);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="you@company.com"
          autoComplete="email"
          defaultValue={state.email}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "login-error" : undefined}
          required
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "login-error" : undefined}
          required
          className="h-10"
        />
      </div>

      {state.error && (
        <p
          id="login-error"
          role="alert"
          className="flex items-start gap-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-10 w-full gap-2"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign in with email"}
      </Button>
    </form>
  );
}
