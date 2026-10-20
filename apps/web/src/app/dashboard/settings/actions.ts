"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteAccountAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    throw new Error("Failed to delete account");
  }

  await supabase.auth.signOut();
}

export async function updatePasswordAction(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    throw new Error("Failed to update password");
  }
}

export async function updateEmailAction(newEmail: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    throw new Error("Failed to update email");
  }
}

export async function unlinkIdentityAction(identityId: string) {
  const supabase = await createClient();

  const { data: identitiesData } = await supabase.auth.getUserIdentities();
  const identity = identitiesData?.identities.find((i) => i.identity_id === identityId);

  if (!identity) {
    throw new Error("Identity not found");
  }

  const { error } = await supabase.auth.unlinkIdentity(identity);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getLinkIdentityUrl(provider: "google" | "github", redirectTo: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.linkIdentity({
    provider,
    options: { redirectTo },
  });

  if (error || !data.url) {
    throw new Error("Failed to start linking");
  }

  return data.url;
}

export async function signOutAllDevicesAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut({ scope: "global" });

  if (error) {
    throw new Error("Failed to sign out of all devices");
  }
}

export async function updateProfileAction(fullName: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (error) {
    throw new Error("Failed to update profile");
  }
}