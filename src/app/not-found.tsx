import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist.",
  robots: "noindex, nofollow",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <div className="mb-4">
            <p className="text-6xl font-bold bg-gradient-to-r from-brand-500 to-orange-500 bg-clip-text text-transparent">
              404
            </p>
          </div>
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-zinc-400 text-sm mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 px-4 py-2 rounded-full bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
            >
              Go home
            </Link>
            <Link
              href="/videos"
              className="flex-1 px-4 py-2 rounded-full border border-white/10 text-zinc-300 font-semibold text-sm hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
            >
              Browse content
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
