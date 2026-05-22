"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UserMenu({ email, username, role }: { email: string; username: string | null; role: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  async function signOut() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    // Force a hard navigation to ensure fresh data
    window.location.href = "/";
  }

  const initial = (username || email || "?").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {/* Desktop Create & Profile Buttons (Row Layout) */}
      <div className="hidden md:flex gap-2">
        <Link
          href="/create"
          className="inline-flex text-sm font-semibold bg-gradient-to-br from-brand-500 to-orange-500 hover:opacity-90 text-white px-4 py-2 rounded-full transition-opacity whitespace-nowrap"
        >
          + Create
        </Link>
        {username && (
          <Link
            href="/profile"
            className="inline-flex text-sm text-zinc-300 hover:text-white px-4 py-2 rounded-full transition-colors whitespace-nowrap border border-white/10"
          >
            Profile
          </Link>
        )}
      </div>

      {/* Avatar Menu */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 text-white font-bold grid place-items-center"
          aria-label="Account menu"
        >
          {initial}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-950 shadow-xl overflow-hidden text-sm">
            <div className="px-4 py-3 border-b border-white/5">
              <div className="font-semibold truncate">{username ?? "Profile"}</div>
              <div className="text-xs text-zinc-500 truncate">{email}</div>
            </div>
            <Link href="/create" className="block px-4 py-2 hover:bg-white/5">+ Create</Link>
            {username && (
              <Link href={`/u/${username}`} className="block px-4 py-2 hover:bg-white/5">
                My profile
              </Link>
            )}
            <Link href="/profile" className="block px-4 py-2 hover:bg-white/5">Edit profile</Link>
            {role === 'admin' && (
              <div className="border-t border-white/5">
                <Link href="/admin" className="block px-4 py-2 hover:bg-white/5 text-brand-400">
                  Admin Dashboard
                </Link>
              </div>
            )}
            <button
              onClick={signOut}
              className="block w-full text-left px-4 py-2 hover:bg-white/5 text-zinc-400"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
