import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://streamly.vercel.app";
const APP_NAME = "Streamly";

export default async function feed(): Promise<MetadataRoute.MetadataBase> {
  const supabase = createClient();

  // Fetch recent content
  const [{ data: videos }, { data: blogs }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "id,title,created_at,author:profiles!videos_author_id_fkey(display_name,username)"
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("blogs")
      .select(
        "slug,title,excerpt,created_at,author:profiles!blogs_author_id_fkey(display_name,username)"
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const recentContent = [
    ...(videos?.map((v: any) => ({
      id: `${APP_URL}/videos/${v.id}`,
      title: `New Video: ${v.title}`,
      description: `Watch ${v.title} by ${v.author?.display_name || v.author?.username}`,
      pubDate: new Date(v.created_at),
    })) || []),
    ...(blogs?.map((b: any) => ({
      id: `${APP_URL}/blogs/${b.slug}`,
      title: `New Blog: ${b.title}`,
      description: b.excerpt || `Read ${b.title} by ${b.author?.display_name || b.author?.username}`,
      pubDate: new Date(b.created_at),
    })) || []),
  ]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 50);

  // Generate RSS feed XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${APP_NAME}</title>
    <link>${APP_URL}</link>
    <description>Discover video lessons and blogs from creators on ${APP_NAME}</description>
    <atom:link href="${APP_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <image>
      <url>${APP_URL}/logo-512x512.png</url>
      <title>${APP_NAME}</title>
      <link>${APP_URL}</link>
    </image>
    ${recentContent
      .map(
        (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.id}</link>
      <guid>${item.id}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
    </item>
    `
      )
      .join("")}
  </channel>
</rss>`;

  return xml as any;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
