import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { resolvePostLoginRedirect, verifyAdminUser } from "@/lib/auth/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = redirect && redirect !== "/login" ? redirect : "/";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (oauthError) setError(oauthError.message);
    setLoading(false);
  };

  const handleSendOTP = async () => {
    const emailValidation = z.string().email("Please enter a valid email address.");
    const parsedEmail = emailValidation.safeParse(email.trim());
    if (!parsedEmail.success) {
      setError(parsedEmail.error.errors[0].message);
      return;
    }

    setLoading(true);
    setError("");
    const { error: otpError } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (otpError) setError(otpError.message);
    else setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    const otpValidation = z.string().regex(/^[0-9]{6}$/, "OTP must be exactly 6 digits.");
    const parsedOtp = otpValidation.safeParse(otp.trim());
    if (!parsedOtp.success) {
      setError(parsedOtp.error.errors[0].message);
      return;
    }

    setLoading(true);
    setError("");
    const { data, error: verifyError } = await createClient().auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "email",
    });
    if (verifyError) setError(verifyError.message);
    else if (data.user) {
      const destination = await resolvePostLoginRedirect(data.user.id, redirectTo);
      window.location.assign(destination);
    } else {
      navigate({ to: "/" });
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="space-y-6 rounded-2xl border border-white/40 bg-white/60 px-8 py-10 shadow-xl backdrop-blur-md">
          <div className="space-y-1 text-center">
            <p className="text-xs uppercase tracking-widest text-[#C97B63]">Drace Core</p>
            <h1
              className="text-3xl font-semibold text-[#2D2A26]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Welcome back
            </h1>
            <p className="text-sm text-[#2D2A26]/60" style={{ fontFamily: "Manrope, sans-serif" }}>
              Sign in to continue your ritual
            </p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="flex w-full items-center gap-3 border-[#E8D8C8] bg-white/80 text-[#2D2A26] transition-all hover:bg-[#FAF7F4]"
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
                or continue with email
              </span>
            </div>
          </div>

          {!otpSent ? (
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                className="border-[#E8D8C8] bg-white/70 focus:border-[#C97B63] focus:ring-[#C97B63]/20"
              />
              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-[#2D2A26] text-white transition-all duration-300 hover:bg-[#C97B63]"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-[#2D2A26]/60">
                OTP sent to <span className="font-medium text-[#2D2A26]">{email}</span>
              </p>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                maxLength={6}
                className="border-[#E8D8C8] bg-white/70 text-center text-lg tracking-widest focus:border-[#C97B63]"
              />
              <Button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-[#2D2A26] text-white transition-all duration-300 hover:bg-[#C97B63]"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <button
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                }}
                className="w-full text-xs text-[#2D2A26]/40 transition-colors hover:text-[#C97B63]"
              >
                ← Use a different email
              </button>
            </div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
