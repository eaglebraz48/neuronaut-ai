import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // your chosen ElevenLabs voice
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return new NextResponse('Missing ELEVENLABS_API_KEY', { status: 401 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
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

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse('Voice error', { status: 500 });
  }
}
