"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type CreatorRequest = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  user?: any;
  reviewer?: any;
};

export default function CreatorRequests() {
  const [requests, setRequests] = useState<CreatorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  async function loadRequests() {
    setLoading(true);
    let query = supabase
      .from("creator_requests")
      .select("id, user_id, status, created_at, reviewed_by, reviewed_at, user:user_id(username, display_name, avatar_url), reviewer:reviewed_by(username)")
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading requests:", error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  }

  async function processRequest(requestId: string, status: "approved" | "rejected") {
    setProcessingId(requestId);
    
    try {
      const response = await fetch("/api/admin/creator-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert("Error: " + (error.error || "Failed to process request"));
      } else {
        await loadRequests();
      }
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : "Failed to process request"));
    } finally {
      setProcessingId(null);
    }
  }

  const statuses: ("all" | "pending" | "approved" | "rejected")[] = ["all", "pending", "approved", "rejected"];
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h1 className="text-2xl font-bold">Creator Requests</h1>
        <p className="text-zinc-400 mt-1">Loading requests...</p>
      </div>
    );
  }

  const filteredRequests = filterStatus === "all" ? requests : requests.filter((r) => r.status === filterStatus);

  return (
    <div className="mt-12 max-w-4xl">
      <Link href="/admin" className="text-sm text-zinc-400 hover:text-white mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold">Creator Requests</h1>
      <p className="text-zinc-400 mt-1">Review and approve creator applications</p>

      {/* Filter Tabs */}
      <div className="flex gap-4 mt-6 border-b border-white/10 overflow-x-auto">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`pb-3 px-2 text-sm font-medium whitespace-nowrap ${
              filterStatus === status
                ? "text-white border-b-2 border-brand-500"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status]})
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="mt-6 space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No {filterStatus !== "all" ? filterStatus : ""} requests
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-zinc-900 border border-white/5 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {request.user.display_name || request.user.username}
                      </h3>
                      <p className="text-sm text-zinc-400">@{request.user.username}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      request.status === "pending" ? "bg-yellow-900/30 text-yellow-300" :
                      request.status === "approved" ? "bg-green-900/30 text-green-300" :
                      "bg-red-900/30 text-red-300"
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>

                    <span className="text-xs text-zinc-500">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </span>

                    {request.reviewed_at && request.reviewer && (
                      <span className="text-xs text-zinc-500">
                        • Reviewed by @{request.reviewer.username} on {new Date(request.reviewed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => processRequest(request.id, "approved")}
                      disabled={processingId === request.id}
                      className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 transition-colors"
                    >
                      {processingId === request.id ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => processRequest(request.id, "rejected")}
                      disabled={processingId === request.id}
                      className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 transition-colors"
                    >
                      {processingId === request.id ? "..." : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
