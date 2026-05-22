"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import { renderMarkdown } from "@/lib/markdown";
import { BLOG_CATEGORIES } from "@/lib/categories";

export default function NewBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [cover, setCover] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const html = useMemo(() => renderMarkdown(content), [content]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Title is required.");
    if (!content.trim()) return setError("Write something first ✨");

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push("/login?next=/blogs/new");
      return;
    }

    const baseSlug = slugify(title);
    let slug = baseSlug || `post-${Date.now()}`;
    // make slug unique
    let n = 0;
    while (true) {
      const { data: existing } = await supabase.from("blogs").select("slug").eq("slug", slug).maybeSingle();
      if (!existing) break;
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const { error } = await supabase.from("blogs").insert({
      author_id: user.id,
      slug,
      title: title.trim(),
      excerpt: excerpt.trim() || content.trim().slice(0, 160),
      content,
      cover_url: cover.trim() || null,
      category: category,
    });

    setLoading(false);
    if (error) return setError(error.message);
    router.push(`/blogs/${slug}`);
    router.refresh();
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 sm:mt-12">
      <h1 className="text-2xl sm:text-3xl font-bold">Write a blog post</h1>
      <p className="mt-1 text-sm text-zinc-400">Markdown supported (headings, lists, code, links, images).</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Title" value={title} onChange={setTitle} placeholder="My first deep-dive" required />
        <Field label="Excerpt (optional)" value={excerpt} onChange={setExcerpt} placeholder="One line summary, shown on the blog card" />
        
        <div className="block">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 block w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            {BLOG_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Field label="Cover image URL (optional)" value={cover} onChange={setCover} placeholder="https://…" />

        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Content</span>
            <div className="flex gap-1 text-xs">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={`px-3 py-1 rounded-md transition-colors ${tab === "write" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`px-3 py-1 rounded-md transition-colors ${tab === "preview" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Preview
              </button>
            </div>
          </div>
          {tab === "write" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`# Hello world\n\nWrite your post in **Markdown**…\n\n- bullet\n- list\n\n\`\`\`js\nconsole.log("hi")\n\`\`\``}
              rows={18}
              className="block w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:border-orange-500"
              required
            />
          ) : (
            <div className="prose rounded-lg bg-black/40 border border-white/10 px-5 py-4 min-h-[300px]">
              {content ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <p className="text-zinc-500">Nothing to preview yet.</p>}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
          >
            {loading ? "Publishing…" : "Publish blog"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{props.label}</span>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        className="mt-1.5 block w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
      />
    </label>
  );
}
