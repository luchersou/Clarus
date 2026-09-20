import { createClient } from "@/lib/supabase/server";

export async function authHeaders() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Missing access token");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}