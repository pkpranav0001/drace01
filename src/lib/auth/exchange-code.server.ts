import { deleteCookie, getCookies, setCookie } from "@tanstack/react-start/server";
import { sanitizeRedirect } from "@/lib/auth/redirect";
import { createRouteSupabaseClient } from "@/lib/supabase/server";

export async function completeAuthFromCodeOnServer(
  code: string,
  redirect: string | undefined,
): Promise<{ ok: true; redirectTo: string } | { ok: false; error: string }> {
  const supabase = createRouteSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return { ok: false, error: error.message };
  }

  const redirectTo = sanitizeRedirect(redirect ?? null);
  const isAdminTarget = redirectTo === "/admin" || redirectTo.startsWith("/admin/");

  if (isAdminTarget) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "No active session found." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile query error:", profileError);
      return {
        ok: false,
        error: `Access denied. Profile fetch failed: ${profileError.message} (User ID: ${user.id}, Email: ${user.email})`,
      };
    }

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: `Access denied. You are not an admin. (User ID: ${user.id}, Email: ${user.email}, Role in DB: '${profile?.role}')`,
      };
    }

    return { ok: true, redirectTo: "/admin" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      return { ok: true, redirectTo: "/admin" };
    }
  }

  return { ok: true, redirectTo };
}
