import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";
import { sanitizeRedirect } from "@/lib/auth/redirect";

const AUTH_TIMEOUT_MS = 12_000;

export function withAuthTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), AUTH_TIMEOUT_MS);
    }),
  ]);
}

export function getAuthCallbackParams() {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return {
    code: params.get("code"),
    tokenHash: params.get("token_hash"),
    type: params.get("type") as EmailOtpType | null,
    redirect: sanitizeRedirect(params.get("redirect")),
    error:
      params.get("error_description") ??
      params.get("error") ??
      hashParams.get("error_description") ??
      hashParams.get("error"),
    accessToken: hashParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token"),
  };
}

export async function completeAuthCallbackClient(supabase: SupabaseClient) {
  const { code, tokenHash, type, error, accessToken, refreshToken } = getAuthCallbackParams();

  if (error) {
    throw new Error(error);
  }

  if (tokenHash && type) {
    const { error: verifyError } = await withAuthTimeout(
      supabase.auth.verifyOtp({ token_hash: tokenHash, type }),
      "Sign-in timed out. Go back and enter the 6-digit code on the login page.",
    );
    if (verifyError) throw verifyError;
    return;
  }

  if (code) {
    const { error: exchangeError } = await withAuthTimeout(
      supabase.auth.exchangeCodeForSession(code),
      "Sign-in timed out. Go back and enter the 6-digit code on the login page.",
    );
    if (exchangeError) throw exchangeError;
    return;
  }

  if (accessToken && refreshToken) {
    const { error: sessionError } = await withAuthTimeout(
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
      "Sign-in timed out. Go back and enter the 6-digit code on the login page.",
    );
    if (sessionError) throw sessionError;
    return;
  }

  throw new Error("Missing sign-in credentials in the callback URL.");
}

export async function ensureAdminAccess(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No active session found.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(
      `Access denied. Profile fetch failed: ${profileError.message} (User ID: ${user.id}, Email: ${user.email})`,
    );
  }

  if (profile?.role !== "admin") {
    await supabase.auth.signOut({ scope: "local" });
    throw new Error(
      `Access denied. You are not an admin. (User ID: ${user.id}, Email: ${user.email}, Role in DB: '${profile?.role}')`,
    );
  }
}
