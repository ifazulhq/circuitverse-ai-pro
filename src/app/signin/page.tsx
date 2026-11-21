
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Cpu } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (session?.user) {
          router.replace("/dashboard/projects");
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };

    checkSession();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signIn("google", {
        callbackUrl: "/dashboard/projects",
      });
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setError("Unable to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-white">
      {/* Ambient PCB Grid */}
      <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Floating Plasma Orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px] animate-float-reverse" />

      {/* Back to Home Floating Pill */}
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md shadow-lg transition-all duration-200 hover:-translate-x-0.5 hover:border-cyan-500/50 hover:bg-zinc-800/80 hover:text-white"
      >
        <ArrowLeft size={14} />
        <span>Back to Home</span>
      </Link>

      {/* Login Card */}
      <div className="group relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl animate-cascade">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {/* Brand Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            Next-Gen Circuit Lab
          </div>

          <Cpu size={20} className="text-cyan-400" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Welcome to CircuitVerse AI
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Sign in to access your digital logic circuits, waveform analyzer, and AI copilot.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300 backdrop-blur-sm"
          >
            {error}
          </div>
        )}

        {/* Google OAuth CTA */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="group/btn relative mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-5 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {/* Authentic Google Multi-Color SVG */}
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>

          <span className="relative z-10 font-bold">
            {loading ? "Authenticating..." : "Continue with Google"}
          </span>

          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full" />
        </button>

        <p className="mt-6 text-center text-xs text-zinc-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}