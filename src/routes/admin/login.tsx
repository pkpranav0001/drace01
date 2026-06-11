import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { verifyAdminUser } from "@/lib/auth/admin";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const supabase = typeof window !== "undefined" ? createClient() : null!;
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;

    void verifyAdminUser(user.id).then((isAdmin) => {
      if (isAdmin) {
        window.location.replace("/admin");
      }
    });
  }, [user, authLoading]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent("/admin")}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const emailValidation = z.string().email("Please enter a valid email address.");
    const parsedEmail = emailValidation.safeParse(email.trim());
    if (!parsedEmail.success) {
      setError(parsedEmail.error.errors[0].message);
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const isAdmin = await verifyAdminUser(data.user.id);
    if (!isAdmin) {
      await supabase.auth.signOut({ scope: "local" });
      setError(
        `Access denied. This account is not an admin. (User ID: ${data.user.id}, Email: ${data.user.email})`,
      );
      setLoading(false);
      return;
    }

    window.location.replace("/admin");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="space-y-6 rounded-2xl border border-white/40 bg-white/60 px-8 py-10 shadow-xl backdrop-blur-md">
          <div className="space-y-1 text-center">
            <p className="text-xs uppercase tracking-widest text-[#C97B63]">Drace Core</p>
            <h1
              className="text-3xl font-semibold text-[#2D2A26]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Admin Panel
            </h1>
            <p className="text-sm text-[#2D2A26]/60">Sign in with your admin credentials</p>
          </div>

          <Button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={loading || authLoading}
            variant="outline"
            className="flex w-full items-center justify-center gap-3 border-[#E8D8C8] bg-white/80 text-[#2D2A26] hover:bg-[#FAF7F4] rounded-full py-5 text-[11px] uppercase tracking-[0.2em] font-medium transition cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#E8D8C8]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/60 px-3 text-[#2D2A26]/40 backdrop-blur-sm">
                or continue with credentials
              </span>
            </div>
          </div>

          <form onSubmit={(e) => void handleSignIn(e)} className="space-y-3">
            <input
              type="email"
              autoComplete="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-[#E8D8C8] bg-white/70 px-4 py-3 text-sm text-[#2D2A26] outline-none focus:border-[#C97B63]"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-[#E8D8C8] bg-white/70 px-4 py-3 pr-11 text-sm text-[#2D2A26] outline-none focus:border-[#C97B63]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2A26]/40 hover:text-[#2D2A26]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full rounded-full bg-[#2D2A26] py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-[#C97B63] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in to admin"}
            </button>
          </form>

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <p className="text-center text-xs text-[#2D2A26]/40">
            Customer?{" "}
            <a href="/login" className="underline hover:text-[#C97B63]">
              Sign in on the store
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
