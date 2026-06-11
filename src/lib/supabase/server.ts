import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { deleteCookie, getCookies, setCookie } from "@tanstack/react-start/server";

export function createServerSupabaseClient(requestHeaders: Headers, responseHeaders: Headers) {
  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(requestHeaders.get("Cookie") ?? "").filter(
            (cookie): cookie is { name: string; value: string } => cookie.value !== undefined,
          );
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            responseHeaders.append("Set-Cookie", serializeCookieHeader(name, value, options));
          });
        },
      },
    },
  );
}

export function createRouteSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars.");
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (value) {
            setCookie(name, value, options);
          } else {
            deleteCookie(name, options);
          }
        });
      },
    },
  });
}
