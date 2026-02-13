import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return new NextResponse('Missing ELEVENLABS_API_KEY', { status: 401 });
    }

    // ✅ your preferred ElevenLabs voice
    const voiceId = 'QwvsCFsQcnpWxmP1z7V9';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg', // ⭐ IMPORTANT (prevents tiny blobs)
        },
        body: JSON.stringify({
          text,
    model_id: 'eleven_multilingual_v2',

          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.85,
          },
        }),
      }
    );

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

