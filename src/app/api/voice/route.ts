import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return new NextResponse('Missing key', { status: 401 });

    // unique hash per sentence
    const hash = crypto.createHash('md5').update(text).digest('hex');
    const path = `${hash}.mp3`;

    // ===== 1) CHECK CACHE =====
    const { data: existing } = await supabase.storage
      .from('voice-cache')
      .download(path);

    if (existing) {
      const buffer = Buffer.from(await existing.arrayBuffer());
      return new NextResponse(buffer, { headers: { 'Content-Type': 'audio/mpeg' } });
    }

    // ===== 2) GENERATE =====
    const voiceId = 'y7B0QJe0awwvH70C4Kzz';

    const eleven = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.85,
            speed: 1.15
          },
        }),
      }
    );

    if (!eleven.ok) {
      const err = await eleven.text();
      console.error(err);
      return new NextResponse('TTS failed', { status: 500 });
    }

    const buffer = Buffer.from(await eleven.arrayBuffer());

    // ===== 3) SAVE TO SUPABASE =====
    await supabase.storage
      .from('voice-cache')
      .upload(path, buffer, { contentType: 'audio/mpeg', upsert: true });

    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });

  } catch (err) {
    console.error(err);
    return new NextResponse('Voice error', { status: 500 });
  }
}
