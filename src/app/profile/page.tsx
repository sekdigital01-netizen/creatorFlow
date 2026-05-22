import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,username,display_name,bio,avatar_url,role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center text-zinc-400">
        We couldn't load your profile yet. Try refreshing in a few seconds.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-12">
      <h1 className="text-2xl font-bold">Edit profile</h1>
      <p className="text-sm text-zinc-400 mt-1">Update how you appear across Streamly.</p>
      <ProfileForm profile={profile as any} />
    </div>
  );
}
