"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { extractYouTubeId, youtubeEmbedUrl, youtubeThumbnail } from "@/lib/youtube";
import { VIDEO_CATEGORIES } from "@/lib/categories";

export default function NewVideoPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const youtubeId = useMemo(() => extractYouTubeId(url), [url]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!youtubeId) return setError("Please paste a valid YouTube URL.");
    if (!title.trim()) return setError("Title is required.");

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push("/login?next=/videos/new");
      return;
    }

    const { data, error } = await supabase
      .from("videos")
      .insert({
        author_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        youtube_id: youtubeId,
        thumbnail_url: youtubeThumbnail(youtubeId, "max"),
        category: category,
      })
      .select("id")
      .single();

    setLoading(false);
    if (error) return setError(error.message);
    router.push(`/videos/${data.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 sm:mt-12">
      <h1 className="text-2xl sm:text-3xl font-bold">Add a video</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Paste any YouTube link — full watch URL, share link, Shorts, or just the ID.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field
          label="YouTube URL"
          value={url}
          onChange={setUrl}
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          required
        />

        {url && !youtubeId && (
          <p className="text-sm text-red-400">That doesn't look like a valid YouTube link.</p>
        )}

        {youtubeId && (
          <div className="rounded-xl border border-white/10 overflow-hidden bg-black">
            <div className="aspect-video">
              <iframe
                src={youtubeEmbedUrl(youtubeId)}
                title="Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="px-3 py-2 text-xs text-zinc-500">Preview · ID: {youtubeId}</p>
          </div>
        )}

        <Field label="Title" value={title} onChange={setTitle} placeholder="What's this lesson about?" required />
        
        <div className="block">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 block w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            {VIDEO_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Description (optional)"
          value={description}
          onChange={setDescription}
          placeholder="Short summary, shown on the video page"
          multiline
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
          >
            {loading ? "Publishing…" : "Publish video"}
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
  multiline?: boolean;
}) {
  const cls =
    "mt-1.5 block w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-orange-500";
  return (
    <label className="block">
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{props.label}</span>
      {props.multiline ? (
        <textarea
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
          rows={4}
          className={cls}
        />
      ) : (
        <input
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
          className={cls}
        />
      )}
    </label>
  );
}
