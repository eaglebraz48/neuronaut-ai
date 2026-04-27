import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // Get token from Authorization header sent by the client
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ ok: false, reason: "no-token" }, { status: 401 });
    }

    // Verify the user with the token
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json({ ok: false, reason: "no-session" }, { status: 401 });
    }

    const userId = user.id;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabaseAdmin.from("profiles").delete().eq("user_id", userId);
    await supabaseAdmin.from("working_notes").delete().eq("user_id", userId);
    await supabaseAdmin.from("terms_acceptance").delete().eq("user_id", userId);
    await supabaseAdmin.from("session_recaps").delete().eq("user_id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    return NextResponse.json({ ok: false, error: true });
  }
}