"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.refresh();
    router.push(next);
  }

  async function sendMagicLink() {
    setError(null);
    if (!email) return setError("Enter your email first.");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setMagicSent(true);
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-zinc-400 mt-1">Sign in to continue.</p>

        {magicSent ? (
          <div className="mt-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-300 text-sm">
            🎉 Check <strong>{email}</strong> for a sign-in link.
          </div>
        ) : (
          <form onSubmit={signInWithPassword} className="mt-6 space-y-3">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-br from-brand-500 to-orange-500 text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <div className="relative my-4 text-center text-xs text-zinc-500">
              <span className="bg-[#0a0a0f] px-2 relative z-10">or</span>
              <span className="absolute inset-x-0 top-1/2 border-t border-white/10" />
            </div>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <div className="relative my-4 text-center text-xs text-zinc-500">
              <span className="bg-[#0a0a0f] px-2 relative z-10">or</span>
              <span className="absolute inset-x-0 top-1/2 border-t border-white/10" />
            </div>
            <button
              type="button"
              onClick={sendMagicLink}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-semibold text-sm disabled:opacity-60"
            >
              Email me a magic link
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-zinc-400 text-center">
          New to Streamly?{" "}
          <Link href="/signup" className="text-orange-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{props.label}</span>
      <input
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        autoComplete={props.autoComplete}
        className="mt-1.5 block w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </label>
  );
}
