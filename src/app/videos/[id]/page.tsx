import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { youtubeEmbedUrl } from "@/lib/youtube";

export const revalidate = 0;

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: video } = await supabase
    .from("videos")
    .select("id,title,description,youtube_id,created_at,author:profiles!videos_author_id_fkey(username,display_name,avatar_url,bio)")
    .eq("id", id)
    .single();

  if (!video) notFound();
  const author: any = video.author;

  return (
    <div className="pt-8 max-w-5xl mx-auto">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
        <div className="aspect-video">
          <iframe
            src={youtubeEmbedUrl(video.youtube_id)}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      <h1 className="mt-6 text-2xl sm:text-3xl font-bold leading-tight">{video.title}</h1>

      {author && (
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 grid place-items-center font-bold">
            {(author.display_name || author.username || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <Link href={`/u/${author.username}`} className="font-semibold hover:underline">
              {author.display_name || author.username}
            </Link>
            <div className="text-xs text-zinc-500">@{author.username} · {new Date(video.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      {video.description && (
        <div className="mt-6 rounded-xl bg-white/[0.02] border border-white/5 p-4 text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {video.description}
        </div>
      )}
    </div>
  );
}
