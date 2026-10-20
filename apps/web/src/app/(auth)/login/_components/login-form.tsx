"use client";

import { useFormStatus } from "react-dom";
import { loginWithPassword } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div className="rounded-lg bg-primary p-0.5">
      <Button
        type="submit"
        disabled={pending}
        className="h-9 w-full rounded-lg bg-primary/60 text-primary-foreground transition-all duration-300 hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]"
      >
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </div>
  );
}

export function LoginForm() {
  return (
    <form action={loginWithPassword} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="h-10 rounded-lg border-2 border-foreground/5"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          className="h-10 rounded-lg border-2 border-foreground/5"
        />
      </div>

      <SubmitButton />
    </form>
  );
}