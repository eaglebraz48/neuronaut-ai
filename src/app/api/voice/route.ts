import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return new NextResponse('Missing ELEVENLABS_API_KEY', { status: 401 });
    }

    // ===== CACHE PATH =====
    const hash = crypto.createHash('md5').update(text).digest('hex');
    const cacheDir = path.join(process.cwd(), 'voice-cache');
    const filePath = path.join(cacheDir, `${hash}.mp3`);

    // create folder if missing
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    // ===== RETURN CACHED AUDIO =====
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath);
      return new NextResponse(file, {
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    }

    // ===== GENERATE NEW AUDIO =====
    const voiceId = 'y7B0QJe0awwvH70C4Kzz';

    const response = await fetch(
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

    if (!response.ok) {
      const err = await response.text();
      console.error('ElevenLabs error:', err);
      return new NextResponse('TTS failed', { status: 500 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // ===== SAVE FOR FUTURE USERS =====
    fs.writeFileSync(filePath, buffer);

    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });

  } catch (err) {
    console.error(err);
    return new NextResponse('Voice error', { status: 500 });
  }
}
