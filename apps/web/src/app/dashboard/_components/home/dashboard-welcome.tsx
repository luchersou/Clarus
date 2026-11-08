import { createClient } from "@/lib/supabase/server";
import { DashboardWelcomeClient } from "./dashboard-welcome-client";

function firstNameOf(fullName: unknown): string | undefined {
  if (typeof fullName !== "string") return undefined;
  const first = fullName.trim().split(/\s+/)[0];
  return first || undefined;
}

export async function DashboardWelcome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Prefer a real name; fall back to the handle, never the raw e-mail address.
  const name =
    firstNameOf(user?.user_metadata?.full_name) ??
    firstNameOf(user?.user_metadata?.name) ??
    firstNameOf(user?.user_metadata?.user_name);

  return <DashboardWelcomeClient userName={name} />;
}
