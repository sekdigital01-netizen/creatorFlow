import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VideoCard } from "@/components/VideoCard";
import { BlogCard } from "@/components/BlogCard";

export const revalidate = 0;

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id,username,display_name,bio,avatar_url,created_at")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const [{ data: videos }, { data: blogs }] = await Promise.all([
    supabase
      .from("videos")
      .select("id,title,youtube_id,thumbnail_url,created_at")
      .eq("author_id", profile.id)
      .eq("published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("blogs")
      .select("slug,title,excerpt,cover_url,created_at")
      .eq("author_id", profile.id)
      .eq("published", true)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="pt-10">
      {/* Header */}
      <div className="flex items-start gap-5 pb-8 border-b border-white/10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 grid place-items-center text-2xl font-bold">
          {(profile.display_name || profile.username).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
          <p className="text-sm text-zinc-500">@{profile.username}</p>
          {profile.bio && <p className="mt-3 text-zinc-300 max-w-2xl">{profile.bio}</p>}
          <div className="mt-3 text-xs text-zinc-500">
            {videos?.length ?? 0} videos · {blogs?.length ?? 0} blogs · joined {new Date(profile.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Videos */}
      <section className="mt-10">
        <h2 className="text-lg font-bold mb-4">Videos</h2>
        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((v) => (
              <VideoCard key={v.id} {...(v as any)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No videos yet.</p>
        )}
      </section>

      {/* Blogs */}
      <section className="mt-12">
        <h2 className="text-lg font-bold mb-4">Blogs</h2>
        {blogs && blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((b) => (
              <BlogCard key={b.slug} {...(b as any)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No blogs yet.</p>
        )}
      </section>
    </div>
  );
}
