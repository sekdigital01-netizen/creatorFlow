import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function VideoNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/login?next=/videos/new");

  // Check if user has moderator role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "moderator" && profile.role !== "admin")) {
    redirect("/");
  }

  return children;
}
