// NOT IN USE — kept for reference
// Resend email notification for login
// To re-enable: uncomment the fetch call in sign-in/page.tsx


import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {

    const { email } = await req.json();

    const response = await resend.emails.send({
      from: "Neuronaut <login@arison8.com>",
      to: email,
      subject: "Your Neuronaut login code",
      html: `
        <h2>Neuronaut</h2>

        <p>Your login request was received.</p>

        <p>If you requested access, return to Neuronaut and enter the code sent by Supabase.</p>

        <p>You can also click the magic link inside the Supabase email.</p>
      `
    });

    console.log("Resend response:", response);

    return NextResponse.json({ success: true });

  } catch (error) {

    console.error("Email send error:", error);

    return NextResponse.json({ error: "Email failed" });
  }
}