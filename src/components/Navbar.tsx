"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserMenu } from "./UserMenu";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface NavbarProps {
  username: string | null;
  userEmail: string | null;
  userRole: string | null;
}

export function NavbarClient({ username, userEmail, userRole }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
    window.location.href = "/";
  }

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-[#0a0a0f]/80 border-b border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 font-bold tracking-tight flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1"
          aria-label="Streamly home"
        >
          <span className="inline-grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 via-orange-500 to-yellow-400 text-white flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </span>
          <span className="hidden sm:inline">Streamly</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-400" aria-label="Main navigation">
          {[
            { href: "/", label: "Home" },
            { href: "/videos", label: "Videos" },
            { href: "/blogs", label: "Blogs" }
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                isActive(href)
                  ? "text-white font-medium"
                  : "hover:text-white"
              }`}
              aria-current={isActive(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden sm:flex items-center gap-2">
          {isMounted && userEmail ? (
            <UserMenu email={userEmail} username={username} role={userRole} />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-300 hover:text-white px-3 py-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-white text-zinc-900 hover:bg-zinc-200 px-3.5 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={menuButtonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden p-2 hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div 
          ref={mobileMenuRef}
          id="mobile-menu"
          className="sm:hidden border-t border-white/5 bg-[#0a0a0f] animate-in fade-in slide-in-from-top-2"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-4 space-y-3">
            {[
              { href: "/", label: "Home" },
              { href: "/videos", label: "Videos" },
              { href: "/blogs", label: "Blogs" }
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block text-sm py-2 px-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  isActive(href)
                    ? "text-white font-medium bg-white/5"
                    : "text-zinc-400 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
            
            <div className="border-t border-white/5 pt-3 space-y-2">
              {isMounted && userEmail ? (
                <>
                  <Link
                    href="/profile"
                    className="block text-sm text-zinc-400 hover:text-white transition-colors py-2 px-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                    onClick={() => setIsOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/create"
                    className="block text-sm text-zinc-400 hover:text-white transition-colors py-2 px-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                    onClick={() => setIsOpen(false)}
                  >
                    + Create
                  </Link>
                  <button
                    onClick={signOut}
                    className="block w-full text-left text-sm text-zinc-400 hover:text-white transition-colors py-2 px-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-sm text-zinc-400 hover:text-white transition-colors py-2 px-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="block text-sm font-semibold bg-white text-zinc-900 px-4 py-2 rounded-full text-center transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
                    onClick={() => setIsOpen(false)}
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
