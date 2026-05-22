"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type User = {
  id: string;
  username: string;
  display_name: string | null;
  role: string;
  status: string;
  created_at: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, role, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading users:", error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  async function updateUserRole(userId: string, newRole: string) {
    setUpdatingUser(userId);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      alert("Error updating role: " + error.message);
    } else {
      await loadUsers();
      setSelectedUser(null);
    }
    setUpdatingUser(null);
  }

  async function updateUserStatus(userId: string, newStatus: string) {
    setUpdatingUser(userId);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", userId);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      await loadUsers();
      setSelectedUser(null);
    }
    setUpdatingUser(null);
  }

  if (loading) {
    return (
      <div className="mt-12">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-zinc-400 mt-1">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="mt-12 max-w-6xl">
      <Link href="/admin" className="text-sm text-zinc-400 hover:text-white mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold">User Management</h1>
      <p className="text-zinc-400 mt-1">Manage user roles and status ({users.length} users)</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Role</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Created</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-semibold text-sm">{user.display_name || user.username}</div>
                    <div className="text-xs text-zinc-500">@{user.username}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    user.role === "admin" ? "bg-red-900/30 text-red-300" :
                    user.role === "moderator" ? "bg-yellow-900/30 text-yellow-300" :
                    "bg-zinc-900/30 text-zinc-300"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    user.status === "active" ? "bg-green-900/30 text-green-300" :
                    user.status === "suspended" ? "bg-yellow-900/30 text-yellow-300" :
                    "bg-red-900/30 text-red-300"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-zinc-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="text-sm text-brand-400 hover:text-brand-300"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">
              Edit: {selectedUser.display_name || selectedUser.username}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-sm"
                >
                  <option value="user">User</option>
                  <option value="creator">Creator</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2 text-sm text-zinc-400 hover:text-white border border-white/10 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateUserRole(selectedUser.id, selectedUser.role);
                  updateUserStatus(selectedUser.id, selectedUser.status);
                }}
                disabled={updatingUser === selectedUser.id}
                className="flex-1 px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded disabled:opacity-50"
              >
                {updatingUser === selectedUser.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
