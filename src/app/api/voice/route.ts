import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    let { text } = await req.json()

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return new NextResponse('Missing ELEVENLABS_API_KEY', { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const {
      data: { user }
    } = await supabase.auth.getUser()

    const now = new Date()
    const MAX_CHARS = 800

    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS)
    }

    let usageCount = 0

    // =========================
    // SIGNED USER LOGIC
    // =========================
    if (user) {
      const { data: profile } = await supabase
        .from('neuronaut_profiles')
        .select('voice_count_today, voice_last_reset')
        .eq('id', user.id)
        .single()

      usageCount = profile?.voice_count_today || 0
      const lastReset = profile?.voice_last_reset
        ? new Date(profile.voice_last_reset)
        : null

      if (!lastReset || now.getTime() - lastReset.getTime() > 86400000) {
        usageCount = 0
        await supabase
          .from('neuronaut_profiles')
          .update({
            voice_count_today: 0,
            voice_last_reset: now.toISOString()
          })
          .eq('id', user.id)
      }

      if (usageCount >= 3) {
        return new NextResponse('SIGNED_LIMIT_REACHED', { status: 403 })
      }

    } else {

      // =========================
      // GUEST IP LOGIC
      // =========================

      const ip =
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        'unknown'

      const { data: guest } = await supabase
        .from('guest_voice_usage')
        .select('*')
        .eq('ip', ip)
        .single()

      usageCount = guest?.voice_count_today || 0
      const lastReset = guest?.voice_last_reset
        ? new Date(guest.voice_last_reset)
        : null

      if (!lastReset || now.getTime() - lastReset.getTime() > 86400000) {
        usageCount = 0
        await supabase
          .from('guest_voice_usage')
          .upsert({
            ip,
            voice_count_today: 0,
            voice_last_reset: now.toISOString(),
            updated_at: now.toISOString()
          })
      }

      if (usageCount >= 1) {
        return new NextResponse('GUEST_LIMIT_REACHED', { status: 403 })
      }
    }

    // =========================
    // ELEVENLABS CALL
    // =========================

    const voiceId = 'QwvsCFsQcnpWxmP1z7V9'

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.85
          }
        })
      }
    )

    if (!response.ok) {
      return new NextResponse('Voice error', { status: 500 })
    }

    // =========================
    // INCREMENT USAGE
    // =========================

    if (user) {
      await supabase


    if (!response.ok) {
      const err = await response.text();
      console.error('ElevenLabs error:', err);
      return new NextResponse('TTS failed', { status: 500 });
    }

    const audio = await response.arrayBuffer();

    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse('Voice error', { status: 500 });
  }
}

