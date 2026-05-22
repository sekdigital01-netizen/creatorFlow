import Link from "next/link";
import Image from "next/image";
import { youtubeThumbnail } from "@/lib/youtube";

interface Author {
  username: string;
  display_name: string | null;
}

interface VideoCardProps {
  id: string;
  title: string;
  youtube_id: string;
  thumbnail_url: string | null;
  author?: Author | null;
  created_at: string;
}

function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function VideoCard({ id, title, youtube_id, thumbnail_url, author, created_at }: VideoCardProps) {
  const thumb = thumbnail_url || youtubeThumbnail(youtube_id);
  const displayName = author?.display_name ?? author?.username ?? "Unknown";

  return (
    <Link
      href={`/videos/${id}`}
      className="group block rounded-xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-white/15 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
    >
      <div className="relative aspect-video bg-black overflow-hidden">
        <Image
          src={thumb}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
          quality={85}
          priority={false}
        />
        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40">
          <div className="w-12 h-12 rounded-full bg-white/95 grid place-items-center shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0a0a0f" aria-hidden="true">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {title}
        </h3>
        <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
          {author && (
            <>
              <span className="text-zinc-400 truncate">{displayName}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{timeAgo(created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
