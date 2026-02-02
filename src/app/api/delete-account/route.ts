import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // get current user
    const { data: session } = await supabase.auth.getUser();
    const user = session?.user;
    
    if (!user?.id) {
      return NextResponse.json({ ok: false, reason: "no-session" }, { status: 401 });
    }
    
    const userId = user.id;
    
    // delete sub tables (compliance mais forte)
    await supabase.from("working_notes").delete().eq("user_id", userId);
    await supabase.from("terms_acceptance").delete().eq("user_id", userId);
    
    // delete auth user
    await supabase.auth.admin.deleteUser(userId);
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    return NextResponse.json({ ok: false, error: true });
  }
}