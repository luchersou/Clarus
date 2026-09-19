import { createClient } from "@/lib/supabase/server";

export async function authHeaders() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session?.access_token}`,
  };
}