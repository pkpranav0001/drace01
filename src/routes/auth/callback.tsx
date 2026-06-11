import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { resolvePostLoginRedirect } from "@/lib/auth/admin";
import { sanitizeRedirect } from "@/lib/auth/redirect";
import { createServerFn } from "@tanstack/react-start";

const authCallbackSearchSchema = z.object({
  code: z.string().optional(),
  redirect: z.string().optional(),
  token_hash: z.string().optional(),
  type: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

const authCallbackServerFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      code: z.string(),
      redirect: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { completeAuthFromCodeOnServer } = await import("@/lib/auth/exchange-code.server");
    return completeAuthFromCodeOnServer(data.code, data.redirect);
  });

export const Route = createFileRoute("/auth/callback")({
  validateSearch: authCallbackSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps: search }) => {
    const authError = search.error_description ?? search.error;
    if (authError) {
      return { error: authError };
    }

    if (!search.code) {
      return null;
    }

    const result = await authCallbackServerFn({
      data: {
        code: search.code,
        redirect: search.redirect,
      },
    });

    if (result.ok) {
      throw redirect({ to: result.redirectTo });
    }

    return { error: result.error };
  },
  component: AuthCallback,
});

function AuthCallback() {
  const loaderData = Route.useLoaderData();
  const [error, setError] = useState(loaderData?.error ?? "");
  const [loginHref, setLoginHref] = useState("/login");

  useEffect(() => {
    if (loaderData?.error) return;

    const run = async () => {
      try {
        const { getAuthCallbackParams, completeAuthCallbackClient, ensureAdminAccess } =
          await import("@/lib/auth/callback-client");

        const params = getAuthCallbackParams();
        const isAdminRedirect =
          params.redirect === "/admin" || params.redirect.startsWith("/admin/");
        setLoginHref(isAdminRedirect ? "/admin/login" : "/login");

        if (params.code) {
          return;
        }

        const supabase = createClient();
        await completeAuthCallbackClient(supabase);

        if (isAdminRedirect) {
          await ensureAdminAccess(supabase);
          window.location.assign("/admin");
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        const destination = user
          ? await resolvePostLoginRedirect(user.id, sanitizeRedirect(params.redirect))
          : sanitizeRedirect(params.redirect);
        window.location.assign(destination);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Authentication failed.";
        setError(message);
      }
    };

    void run();
  }, [loaderData?.error]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-md text-sm text-red-500">{error}</p>
        <p className="max-w-md text-xs text-muted-foreground">
          For admin access, go to <strong>/admin/login</strong> and enter the 6-digit code from your
          email. Do not use the email link on a different browser or device.
        </p>
        <a href={loginHref} className="text-sm text-primary underline">
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  );
}
