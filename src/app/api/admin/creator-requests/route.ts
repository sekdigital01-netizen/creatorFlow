import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendCreatorApprovalEmail,
  sendCreatorRejectionEmail,
} from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in GET /api/admin/creator-requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { requestId, status } = await req.json();

    if (!requestId || !status) {
      return NextResponse.json(
        { error: "Missing requestId or status" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get creator request with user email
    const { data: request, error: requestError } = await supabase
      .from("creator_requests")
      .select("*, user:user_id(id, username, display_name, role)")
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Get user email from auth
    const { data: userData } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", request.user_id)
      .single();

    // Get auth user to get email
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find((u) => u.id === request.user_id);
    const email = authUser?.email;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 404 }
      );
    }

    // Send appropriate email
    try {
      if (status === "approved") {
        await sendCreatorApprovalEmail(
          email,
          request.user.display_name || request.user.username
        );

        // Update user role to moderator
        await supabase
          .from("profiles")
          .update({ role: "moderator" })
          .eq("id", request.user_id);
      } else if (status === "rejected") {
        await sendCreatorRejectionEmail(
          email,
          request.user.display_name || request.user.username
        );
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue anyway - don't fail the request
    }

    // Update creator request status
    await supabase
      .from("creator_requests")
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing creator request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
