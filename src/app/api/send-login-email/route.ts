import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {

    const { email, token, link } = await req.json()

    await resend.emails.send({
      from: "Neuronaut <login@arison8.com>",
      to: email,
      subject: "Your Neuronaut login",
      html: `
        <h2>Neuronaut</h2>

        <p>Your login code:</p>

        <div style="font-size:34px;font-weight:bold;letter-spacing:6px">
          ${token}
        </div>

        <p style="margin-top:20px">
          or
        </p>

        <a href="${link}" 
        style="display:inline-block;padding:12px 22px;background:#38bdf8;color:#000;font-weight:700;border-radius:8px;text-decoration:none;">
          Sign in instantly
        </a>
      `,
    })

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error(error)

    return NextResponse.json({ error: "Email failed" })
  }
}