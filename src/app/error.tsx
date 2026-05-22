"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error for debugging (in production, send to error tracking service)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.343M9 21H7a2 2 0 01-2-2V9.343M9 21h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.343"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-zinc-400 text-sm mb-6">
            We encountered an unexpected error. Please try again or return to the home page.
          </p>
          {error.message && (
            <p className="text-xs text-zinc-500 mb-6 font-mono bg-zinc-900/50 p-3 rounded border border-zinc-800">
              {error.message}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              onClick={() => reset()}
              className="flex-1 px-4 py-2 rounded-full bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
            >
              Try again
            </button>
            <Link
              href="/"
              className="flex-1 px-4 py-2 rounded-full border border-white/10 text-zinc-300 font-semibold text-sm hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
