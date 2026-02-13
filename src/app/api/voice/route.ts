import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { text } = await req.json();

  const res = await fetch(
    'https://api.elevenlabs.io/v1/text-to-speech/QwvsCFsQcnpWxmP1z7V9',
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.8,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
    }
  );

  const audio = await res.arrayBuffer();

  return new NextResponse(audio, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
