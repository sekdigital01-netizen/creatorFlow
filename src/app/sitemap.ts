import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://streamly.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // Fetch published videos and blogs for sitemap
  const [{ data: videos }, { data: blogs }] = await Promise.all([
    supabase
      .from("videos")
      .select("id,updated_at")
      .eq("published", true),
    supabase
      .from("blogs")
      .select("slug,updated_at")
      .eq("published", true),
  ]);

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${APP_URL}/videos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic video routes
  const videoRoutes: MetadataRoute.Sitemap =
    videos?.map((video: any) => ({
      url: `${APP_URL}/videos/${video.id}`,
      lastModified: new Date(video.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  // Dynamic blog routes
  const blogRoutes: MetadataRoute.Sitemap =
    blogs?.map((blog: any) => ({
      url: `${APP_URL}/blogs/${blog.slug}`,
      lastModified: new Date(blog.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  return [...staticRoutes, ...videoRoutes, ...blogRoutes];
}
