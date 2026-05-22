import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdown } from "@/lib/markdown";

export const revalidate = 0;

export default async function BlogPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: blog } = await supabase
    .from("blogs")
    .select("slug,title,excerpt,content,cover_url,created_at,author:profiles!blogs_author_id_fkey(username,display_name,bio,avatar_url)")
    .eq("slug", params.slug)
    .single();

  if (!blog) notFound();
  const author: any = blog.author;
  const html = renderMarkdown(blog.content);

  return (
    <article className="pt-10 max-w-3xl mx-auto">
      {blog.cover_url && (
        <div className="rounded-2xl overflow-hidden border border-white/10 mb-8 aspect-[16/9] bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={blog.cover_url} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">{blog.title}</h1>
      {blog.excerpt && <p className="mt-3 text-lg text-zinc-400">{blog.excerpt}</p>}

      {author && (
        <div className="mt-6 flex items-center gap-3 pb-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 grid place-items-center font-bold">
            {(author.display_name || author.username || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <Link href={`/u/${author.username}`} className="font-semibold hover:underline">
              {author.display_name || author.username}
            </Link>
            <div className="text-xs text-zinc-500">@{author.username} · {new Date(blog.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
