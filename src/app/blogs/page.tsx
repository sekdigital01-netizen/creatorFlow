"use client";

import Link from "next/link";
import { BlogCard } from "@/components/BlogCard";
import { BLOG_CATEGORIES } from "@/lib/categories";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  async function fetchBlogs() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("blogs")
      .select(
        "slug,title,excerpt,cover_url,category,created_at,author:profiles!blogs_author_id_fkey(username,display_name)"
      )
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (selectedCategory !== "All") {
      query = query.eq("category", selectedCategory);
    }

    const { data } = await query;
    setBlogs(data || []);
    setLoading(false);
  }

  return (
    <div className="pt-8 sm:pt-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Blogs</h1>
        <Link
          href="/blogs/new"
          className="w-full sm:w-auto text-center text-sm font-semibold px-4 py-2 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 text-white hover:opacity-90 transition-opacity"
        >
          + Write blog
        </Link>
      </div>

      {/* Category Filter */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedCategory === "All"
                ? "bg-gradient-to-br from-brand-500 to-orange-500 text-white"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            All
          </button>
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-br from-brand-500 to-orange-500 text-white"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="text-center text-zinc-400 py-12">Loading...</div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((b: any) => (
            <BlogCard key={b.slug} {...b} />
          ))}
        </div>
      ) : (
        <div className="text-center text-zinc-400 border border-dashed border-white/10 rounded-2xl p-12 mt-6">
          <h2 className="text-lg font-semibold text-white mb-2">No blogs yet</h2>
          <p className="mb-6">Be the first to write one.</p>
          <Link
            href="/blogs/new"
            className="inline-block px-5 py-2.5 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Write a blog
          </Link>
        </div>
      )}
    </div>
  );
}
