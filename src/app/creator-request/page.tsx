"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CreatorRequestPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkExistingRequest();
  }, []);

  async function checkExistingRequest() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/creator-request");
        return;
      }

      const { data: existingRequest } = await supabase
        .from("creator_requests")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingRequest) {
        setHasExistingRequest(true);
        setRequestStatus(existingRequest.status);
      }
    } catch (err) {
      console.error("Error checking request:", err);
    }
  }

  async function submitRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to request creator status");
        return;
      }

      const { error: submitError } = await supabase
        .from("creator_requests")
        .insert({
          user_id: user.id,
          status: "pending",
        });

      if (submitError) {
        setError(submitError.message);
      } else {
        setSubmitted(true);
        setHasExistingRequest(true);
        setRequestStatus("pending");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (hasExistingRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            {requestStatus === "pending" && (
              <>
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 grid place-items-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">Request Pending</h1>
                <p className="text-zinc-400 mt-2">Your creator request is under review. We'll notify you once it's processed.</p>
              </>
            )}
            {requestStatus === "approved" && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/20 grid place-items-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">Approved! 🎉</h1>
                <p className="text-zinc-400 mt-2">Your creator request has been approved. You can now create content!</p>
              </>
            )}
            {requestStatus === "rejected" && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 grid place-items-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">Request Rejected</h1>
                <p className="text-zinc-400 mt-2">Unfortunately, your creator request was not approved. Please try again later.</p>
              </>
            )}
          </div>
          {requestStatus === "approved" && (
            <Link
              href="/create"
              className="block w-full bg-gradient-to-r from-brand-500 to-orange-500 text-white font-semibold py-3 rounded-lg text-center hover:opacity-90 transition"
            >
              Start Creating
            </Link>
          )}
          <Link
            href="/"
            className="block w-full mt-3 border border-white/10 text-zinc-400 font-semibold py-3 rounded-lg text-center hover:bg-white/5 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Creator</h1>
          <p className="text-zinc-400">Request creator status to start publishing videos and blogs on Streamly. Our admin team will review your request.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {submitted && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            ✓ Request submitted! We'll review it soon.
          </div>
        )}

        <form onSubmit={submitRequest} className="space-y-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
            <p>Click submit to send your creator request. Our admin team will review and approve or reject your request.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already a creator?{" "}
          <Link href="/create" className="text-orange-400 hover:text-orange-300">
            Go to create page
          </Link>
        </p>
      </div>
    </div>
  );
}
