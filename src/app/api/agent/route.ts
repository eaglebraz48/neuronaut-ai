import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

/* ================= SETUP ================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ================= SAFETY ================= */
const BLOCKED_PATTERNS = [
  'suicidal','suicide','kill myself','self harm',
  'eating disorder','anorexia','bulimia',
  'hallucination','hearing voices','delusion',
  'bipolar disorder','schizophrenia',
  'cancer diagnosis','tumor','chest pain','heart attack',
  'medical diagnosis','prescription medication',
  'divorce lawyer','custody battle','sue someone',
  'lawsuit','court case',
  'hurt someone','kill someone','attack someone',
  'sexual abuse','physical abuse','domestic violence',
  'rape','assault victim',
];

function containsBlockedContent(text: string): boolean {
  return BLOCKED_PATTERNS.some(term =>
    text.toLowerCase().includes(term)
  );
}

/* ================= LANGUAGE ================= */
function detectLang(text: string): 'pt' | 'es' | 'fr' | 'en' {
  if (/[ãõçáéíóú]/i.test(text)) return 'pt';
  if (/[¿¡ñ]/i.test(text)) return 'es';
  if (/[àèùâêîôû]/i.test(text)) return 'fr';
  return 'en';
}

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  pt: 'Portuguese',
  es: 'Spanish',
  fr: 'French',
};

/* ================= MEMORY ================= */
function isMemorySafe(note: string): boolean {
  const lower = note.toLowerCase();
  return !(lower.includes('sorry') || lower.includes('cannot'));
}

/* ================= SYSTEM PROMPT ================= */
const BASE_SYSTEM_PROMPT = `
You are NEURONAUT.

You think and act like a sharp, calm, grounded human analyst who verifies reality before speaking.

CORE BEHAVIOR:
You investigate FOR the user. The user does NOT investigate for you.

If something needs checking:
Ask the user to show you exactly what they see.

Prefer:
• screenshot
• snipping tool capture
• photo of the screen
• pasted text

Screenshots are safest and fastest.

Only request file uploads if absolutely necessary.
Never tell users to download, open, test, or inspect suspicious files themselves.
Never send users to other websites to verify things.
You do the analysis.

WEB RULES:
If web results are provided, treat them as real-time facts and use them confidently.
Never say you cannot browse or verify.
Never mention limitations.

VERDICT RULE:
When asked real vs fake, scam vs safe, or true vs false:
You MUST give a clear conclusion:
real, fake, misleading, or unverified.

Be decisive. Do not hedge. Do not say “check elsewhere”.

STYLE:
Answer first.
Then ONE simple next step only if needed.
2–4 sentences max.
Short. Direct. Conversational. Human.
No lists. No lectures. No disclaimers. No “as an AI”.

MISSION:
Protect the user.
Reduce confusion.
Tell the truth clearly.
Act like a trusted partner, not a help desk.
`;


/* ================= SEARCH ================= */
async function braveSearch(query: string) {
  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=6`,
    {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_API_KEY!,
        Accept: 'application/json',
      },
    }
  );

  if (!res.ok) return [];

  const data = await res.json();

  return (
    data.web?.results?.map((r: any) => ({
      title: r.title,
      url: r.url,
      description: r.description,
    })) || []
  );
}

/* ================= API ================= */
export async function POST(req: Request) {
  try {
    let messages: any[] = [];
    let context: any = {};
    let imageBase64: string | null = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('image') as File | null;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        imageBase64 = buffer.toString('base64');
      }

      messages = JSON.parse((form.get('messages') as string) || '[]');
      context = JSON.parse((form.get('context') as string) || '{}');
    } else {
      const body = await req.json();
      messages = body.messages || [];
      context = body.context || {};
    }

    if (!Array.isArray(messages)) {
      return NextResponse.json({ reply: 'Tell me what you saw.' });
    }

    const lastUserMsg =
      [...messages].reverse().find(m => m.role === 'user')?.text || '';

    if (containsBlockedContent(lastUserMsg)) {
      return NextResponse.json({
        reply: 'I can’t help with harm or crisis topics. Let’s stay focused.',
      });
    }

    const lang = context?.lang || detectLang(lastUserMsg);
    const langName = LANG_NAMES[lang];

    const systemPrompt = `
${BASE_SYSTEM_PROMPT}
Language: ${langName}
`;

    /* ================= INTENT + SEARCH ================= */
    const FACT_INTENT =
      /(real|fake|verify|fact|news|true|false|check|is this|did this|happened|proof|legit)/i;

    let webResults: any[] = [];

    if (FACT_INTENT.test(lastUserMsg) || lastUserMsg.length > 18) {
      webResults = await braveSearch(lastUserMsg);
    }

    /* ================= GPT INPUT ================= */
    const gptMessages: any[] = [
      { role: 'system', content: systemPrompt },

      ...(webResults.length
        ? [{
            role: 'system',
            content:
              'Verified web information:\n\n' +
              webResults
                .map(
                  (r: any, i: number) =>
                    `${i + 1}. ${r.title}\n${r.description}\n${r.url}`
                )
                .join('\n\n'),
          }]
        : []),

      ...(imageBase64
        ? [{
            role: 'user',
            content: [
              { type: 'text', text: 'Decide if this is real, fake, or misleading.' },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          }]
        : messages.map((m: any) => ({
            role: m.role,
            content: m.text,
          }))),
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 160,
      messages: gptMessages,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() || '';

    if (reply && context?.userId && isMemorySafe(reply)) {
      await supabase.from('working_notes').insert({
        user_id: context.userId,
        content: reply.slice(0, 80),
      });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ reply: 'Something went wrong. Try again.' });
  }
}
