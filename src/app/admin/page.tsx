import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = createClient();

  // Get stats
  const [usersRes, videosRes, blogsRes, requestsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact" }),
    supabase.from("videos").select("id", { count: "exact" }),
    supabase.from("blogs").select("id", { count: "exact" }),
    supabase.from("creator_requests").select("id", { count: "exact", head: false }).eq("status", "pending"),
  ]);

  const stats = [
    { label: "Total Users", value: usersRes.count || 0 },
    { label: "Total Videos", value: videosRes.count || 0 },
    { label: "Total Blogs", value: blogsRes.count || 0 },
    { label: "Pending Requests", value: requestsRes.count || 0 },
  ];

  return (
    <div className="mt-12 max-w-6xl">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-zinc-400 mt-1">Manage users, content, and creator requests</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-900 border border-white/5 rounded-lg p-4"
          >
            <div className="text-sm text-zinc-400">{stat.label}</div>
            <div className="text-3xl font-bold mt-2">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <AdminCard
          title="User Management"
          description="Manage user roles, suspend or ban users"
          href="/admin/users"
          icon="👥"
        />
        <AdminCard
          title="Content Moderation"
          description="Approve or reject videos and blogs"
          href="/admin/content"
          icon="📝"
        />
        <AdminCard
          title="Creator Requests"
          description="Review and approve creator applications"
          href="/admin/creator-requests"
          icon="⭐"
        />
      </div>
    </div>
  );
}

function AdminCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 hover:border-white/20 rounded-lg p-6 transition-all hover:shadow-lg"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-semibold text-lg group-hover:text-brand-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-zinc-400 mt-1">{description}</p>
    </Link>
  );
}
