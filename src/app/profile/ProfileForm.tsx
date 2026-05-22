"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatar, setAvatar] = useState(profile.avatar_url ?? "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        username: username.trim().toLowerCase(),
        bio: bio.trim() || null,
        avatar_url: avatar.trim() || null,
      })
      .eq("id", profile.id);
    setLoading(false);
    if (error) return setError(error.message);
    setMsg("Saved ✓");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <Field label="Display name" value={displayName} onChange={setDisplayName} placeholder="Maya R." />
      <Field label="Username" value={username} onChange={setUsername} placeholder="mayar" required />
      <label className="block">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="A sentence or two about you & what you teach."
          className="mt-1.5 block w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
        />
      </label>
      <Field label="Avatar URL (optional)" value={avatar} onChange={setAvatar} placeholder="https://…" />

      <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Role</div>
        <div className={`text-sm font-semibold px-3 py-2 rounded w-fit ${
          profile.role === "admin" ? "bg-red-900/30 text-red-300" :
          profile.role === "moderator" ? "bg-yellow-900/30 text-yellow-300" :
          "bg-zinc-800 text-zinc-300"
        }`}>
          {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 text-white font-semibold text-sm disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
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
