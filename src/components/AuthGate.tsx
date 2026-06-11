import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { resolvePostLoginRedirect } from "@/lib/auth/admin";
import { isCustomerProtectedPath } from "@/lib/auth/routes";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchRedirect = useRouterState({
    select: (s) => (s.location.search as { redirect?: string }).redirect,
  });
  const isProtected = isCustomerProtectedPath(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && isProtected) {
      navigate({
        to: "/login",
        search: { redirect: pathname },
      });
      return;
    }

    if (user && pathname === "/login") {
      void resolvePostLoginRedirect(user.id, searchRedirect ?? "/").then((target) => {
        if (target.startsWith("/")) {
          window.location.assign(target);
        } else {
          navigate({ to: "/" });
        }
      });
    }
  }, [user, loading, isProtected, pathname, searchRedirect, navigate, router]);

  if (isProtected && (loading || !user)) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your session...</p>
      </div>
    </div>
  );
}
