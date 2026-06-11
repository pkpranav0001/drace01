import { createClient } from "@/lib/supabase/client";

export async function getProfileRole(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single();

  if (error) {
    console.error("Failed to load profile role:", error.message);
    return null;
  }

  return data?.role ?? null;
}

export function isAdminRole(role: string | null | undefined) {
  return role === "admin";
}

/** After sign-in, send admins to the panel; everyone else to the requested path. */
export async function resolvePostLoginRedirect(userId: string, fallback = "/"): Promise<string> {
  const role = await getProfileRole(userId);
  if (isAdminRole(role)) return "/admin";
  return fallback;
}

export async function verifyAdminUser(userId: string): Promise<boolean> {
  const role = await getProfileRole(userId);
  return isAdminRole(role);
}
