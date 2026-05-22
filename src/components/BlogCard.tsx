import Link from "next/link";
import Image from "next/image";

interface Author {
  username: string;
  display_name: string | null;
}

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  author?: Author | null;
  created_at: string;
}

export function BlogCard({ slug, title, excerpt, cover_url, author, created_at }: BlogCardProps) {
  const displayName = author?.display_name ?? author?.username ?? "Unknown";
  const formattedDate = new Date(created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/blogs/${slug}`}
      className="group block rounded-xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-white/15 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
    >
      {cover_url ? (
        <div className="relative aspect-[16/9] bg-zinc-900 overflow-hidden">
          <Image
            src={cover_url}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
            quality={85}
            priority={false}
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-brand-500/30 via-orange-500/20 to-yellow-400/10 grid place-items-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="opacity-40" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="white" strokeWidth="1.5"/>
            <path d="M14 2v6h6" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-[16px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {title}
        </h3>
        {excerpt && <p className="mt-1.5 text-sm text-zinc-400 line-clamp-2">{excerpt}</p>}
        <div className="mt-3 text-xs text-zinc-500">
          {author && (
            <>
              <span className="text-zinc-400">{displayName}</span>
              <span aria-hidden="true"> · </span>
            </>
          )}
          <time dateTime={created_at}>{formattedDate}</time>
        </div>
      </div>
    </Link>
  );
}
