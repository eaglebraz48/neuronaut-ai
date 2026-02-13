import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { text } = await req.json();

  const response = await fetch(
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
      }),
    }
  );

  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
