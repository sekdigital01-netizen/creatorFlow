import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CreateHubPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/create");

  // Check if user has creator role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "moderator" && profile.role !== "admin")) {
    // Regular users need to request moderator status
    redirect("/creator-request");
  }

  return (
    <div className="max-w-3xl mx-auto mt-16">
      <h1 className="text-3xl font-bold">Create something new</h1>
      <p className="mt-2 text-zinc-400">What would you like to publish today?</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/videos/new"
          className="group rounded-2xl border border-white/10 bg-gradient-to-br from-brand-500/10 to-orange-500/5 p-7 hover:border-orange-400/40 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-orange-500 grid place-items-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7L8 5z"/></svg>
          </div>
          <h2 className="text-lg font-bold group-hover:text-white">Add a video</h2>
          <p className="mt-1 text-sm text-zinc-400">Paste a YouTube link — we'll embed it.</p>
        </Link>

        <Link
          href="/blogs/new"
          className="group rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/5 p-7 hover:border-blue-400/40 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 grid place-items-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              <path d="M14 2v6h6M8 13h8M8 17h5"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold group-hover:text-white">Write a blog</h2>
          <p className="mt-1 text-sm text-zinc-400">Long-form posts with Markdown.</p>
        </Link>
      </div>
    </div>
  );
}
