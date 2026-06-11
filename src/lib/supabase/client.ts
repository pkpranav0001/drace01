import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;

function getSupabaseEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return { url, key };
}

export function createClient() {
  if (typeof window === "undefined") {
    throw new Error("createClient() must only be called in the browser.");
  }

  if (!browserClient) {
    const { url, key } = getSupabaseEnv();
    browserClient = createBrowserClient(url, key, {
      cookieOptions: {
        path: "/",
        sameSite: "lax",
        secure: window.location.protocol === "https:",
      },
      auth: {
        // Handled explicitly in /auth/callback to avoid PKCE race conditions.
        detectSessionInUrl: false,
        flowType: "pkce",
      },
    });
  }

  return browserClient;
}
