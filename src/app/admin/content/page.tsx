"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Video = {
  id: string;
  title: string;
  author_id: string;
  published: boolean;
  approval_status: string;
  created_at: string;
  author: { username: string } | null;
};

type Blog = {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  published: boolean;
  approval_status: string;
  created_at: string;
  author: { username: string } | null;
};

type Content = Video | Blog;

export default function ContentModeration() {
  const [contentType, setContentType] = useState<"videos" | "blogs">("videos");
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, [contentType]);

  async function loadContent() {
    setLoading(true);
    const supabase = createClient();
    const query = supabase
      .from(contentType)
      .select("id, title, slug, author_id, published, approval_status, created_at, author:author_id(username)")
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error loading content:", error);
    } else {
      setContent(data || []);
    }
    setLoading(false);
  }

  async function updateApprovalStatus(id: string, status: string) {
    setUpdatingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from(contentType)
      .update({ approval_status: status })
      .eq("id", id);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      await loadContent();
    }
    setUpdatingId(null);
  }

  async function deleteContent(id: string) {
    if (!confirm("Are you sure you want to delete this content?")) return;

    setUpdatingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from(contentType)
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting content: " + error.message);
    } else {
      await loadContent();
    }
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="mt-12">
        <h1 className="text-2xl font-bold">Content Moderation</h1>
        <p className="text-zinc-400 mt-1">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="mt-12 max-w-6xl">
      <Link href="/admin" className="text-sm text-zinc-400 hover:text-white mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold">Content Moderation</h1>
      <p className="text-zinc-400 mt-1">Approve or reject user content</p>

      {/* Tabs */}
      <div className="flex gap-4 mt-6 border-b border-white/10">
        <button
          onClick={() => setContentType("videos")}
          className={`pb-3 px-2 text-sm font-medium ${
            contentType === "videos"
              ? "text-white border-b-2 border-brand-500"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setContentType("blogs")}
          className={`pb-3 px-2 text-sm font-medium ${
            contentType === "blogs"
              ? "text-white border-b-2 border-brand-500"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Blogs
        </button>
      </div>

      {/* Content List */}
      <div className="mt-6 space-y-3">
        {content.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No {contentType} to moderate
          </div>
        ) : (
          content.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-white/5 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <div className="text-sm text-zinc-400 mt-1">
                  By @{(item.author as any)?.username || "Unknown"} · {new Date(item.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    item.published ? "bg-green-900/30 text-green-300" : "bg-gray-900/30 text-gray-300"
                  }`}>
                    {item.published ? "Published" : "Draft"}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    item.approval_status === "approved" ? "bg-green-900/30 text-green-300" :
                    item.approval_status === "pending" ? "bg-yellow-900/30 text-yellow-300" :
                    "bg-red-900/30 text-red-300"
                  }`}>
                    {item.approval_status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {item.approval_status !== "approved" && (
                  <button
                    onClick={() => updateApprovalStatus(item.id, "approved")}
                    disabled={updatingId === item.id}
                    className="px-3 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                {item.approval_status !== "rejected" && (
                  <button
                    onClick={() => updateApprovalStatus(item.id, "rejected")}
                    disabled={updatingId === item.id}
                    className="px-3 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => deleteContent(item.id)}
                  disabled={updatingId === item.id}
                  className="px-3 py-2 text-xs bg-red-900 hover:bg-red-800 text-red-300 rounded disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
