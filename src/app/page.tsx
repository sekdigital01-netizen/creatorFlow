import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { VideoCard } from "@/components/VideoCard";
import { BlogCard } from "@/components/BlogCard";

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "Home",
  description: "Discover video lessons and blogs from creators. Learn new skills from industry experts on Streamly.",
  openGraph: {
    title: "Streamly — Learn from Great Creators",
    description: "Discover video lessons and blogs from creators. Learn new skills from industry experts.",
    type: "website",
  },
};

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: videos }, { data: blogs }] = await Promise.all([
    supabase
      .from("videos")
      .select("id,title,youtube_id,thumbnail_url,created_at,author:profiles!videos_author_id_fkey(username,display_name)")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("blogs")
      .select("slug,title,excerpt,cover_url,created_at,author:profiles!blogs_author_id_fkey(username,display_name)")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const hasContent = (videos?.length ?? 0) + (blogs?.length ?? 0) > 0;

  return (
    <div className="pt-8 sm:pt-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-brand-500/10 via-orange-500/5 to-transparent p-6 sm:p-8 lg:p-12" aria-label="Hero section">
        <div className="max-w-2xl">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-orange-400 mb-3">
            Streamly · v1
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Watch, read, and learn from <span className="bg-gradient-to-r from-brand-500 to-yellow-400 bg-clip-text text-transparent">great creators.</span>
          </h1>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base lg:text-lg">
            Video lessons and long-form blogs from creators teaching what they love.
            Start sharing yours in minutes.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
            <Link
              href="/videos"
              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-full bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0a0a0f] transition-colors"
            >
              Browse videos
            </Link>
            <Link
              href="/blogs"
              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0a0a0f] font-semibold text-sm transition-colors"
            >
              Read blogs
            </Link>
            <Link
              href="/create"
              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] transition-opacity"
            >
              + Create
            </Link>
          </div>
        </div>
      </section>

      {!hasContent && (
        <div className="mt-12 sm:mt-16 text-center text-zinc-400 border border-dashed border-white/10 rounded-2xl p-8 sm:p-12">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">No content yet</h2>
          <p className="mb-6 text-sm sm:text-base">Be the first to publish.</p>
          <Link
            href="/create"
            className="inline-block px-5 py-2.5 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] transition-opacity"
          >
            Create the first post
          </Link>
        </div>
      )}

      {/* Latest videos */}
      {videos && videos.length > 0 && (
        <section className="mt-12 sm:mt-14" aria-labelledby="latest-videos-heading">
          <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between mb-5 gap-3">
            <h2 id="latest-videos-heading" className="text-xl sm:text-2xl font-bold">Latest videos</h2>
            <Link href="/videos" className="text-sm text-zinc-400 hover:text-white transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((v: any) => (
              <VideoCard key={v.id} {...v} />
            ))}
          </div>
        </section>
      )}

      {/* Latest blogs */}
      {blogs && blogs.length > 0 && (
        <section className="mt-12 sm:mt-14" aria-labelledby="latest-blogs-heading">
          <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between mb-5 gap-3">
            <h2 id="latest-blogs-heading" className="text-xl sm:text-2xl font-bold">Latest blogs</h2>
            <Link href="/blogs" className="text-sm text-zinc-400 hover:text-white transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((b: any) => (
              <BlogCard key={b.slug} {...b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
