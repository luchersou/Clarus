import { createClient } from "@/lib/supabase/server";
import { DashboardWelcomeClient } from "./dashboard-welcome-client";

export async function DashboardWelcome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email;

  return <DashboardWelcomeClient userName={name} />;
}