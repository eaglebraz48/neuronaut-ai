import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ================= BLOCKED PATTERNS ================= */
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

/* ================= HELPERS ================= */
function containsBlockedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_PATTERNS.some(term => lower.includes(term));
}

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

/* ================= SYSTEM PROMPT ================= */
const SYSTEM_PROMPT = `
You are NEURONAUT — a career clarity assistant.

STYLE:
- Short replies (1–3 sentences)
- One idea only
- Calm, human
- No explanations unless asked

RULES:
- Always reply in the user's language
- Never mention databases or systems
`;
function isMemorySafe(note: string): boolean {
  const banned = [
    'cannot access',
    'can’t access',
    'please provide',
    'sorry',
    'i can’t',
    'i cannot',
    'i am here to help',
    'notes are saved',
    'ask me',
    'let me know',
  ];

  const lower = note.toLowerCase();

  // reject meta / weak / AI-facing notes
  if (banned.some(b => lower.includes(b))) return false;

  // must be factual, not instructional
  if (lower.startsWith('research ') || lower.startsWith('consider '))
    return false;

  return true;
}

/* ================= API HANDLER ================= */
export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ reply: 'Tell me what’s on your mind.' });
    }

    const lastUserMsg =
      [...messages].reverse().find(m => m.role === 'user')?.text || '';

    if (containsBlockedContent(lastUserMsg)) {
      return NextResponse.json({
        reply:
          "I can’t help with crisis or harm topics. Let’s stay with work and direction.",
      });
    }

    const lang = context?.lang || detectLang(lastUserMsg);
    const langName = LANG_NAMES[lang];
    const userId = context?.userId || null;

    /* ================= FETCH LAST NOTES ================= */
    let pastNotesText = '';

    if (userId) {
      const { data } = await supabase
        .from('working_notes')
        .select('content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(6);

      if (data && data.length > 0) {
        pastNotesText =
          '\nPrevious context:\n' +
          data.map(n => `- ${n.content}`).join('\n');
      }
    }

    /* ================= MAIN CHAT ================= */
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT + pastNotesText,
        },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.text,
        })),
      ],
    });

    const reply =
      chatResponse.choices[0]?.message?.content?.trim() ?? '';

    /* ================= NOTE EXTRACTION ================= */
const NOTE_PROMPT = `
Write ONE short working note in FIRST PERSON.

Rules:
- ${langName} only
- 6–12 words
- First person voice (I / Estou / Estoy / Je)
- Natural, human phrasing
- No names
- No "user"
- No punctuation
- Reflect the speaker’s own perspective
- Use correct gendered grammar when applicable
`;


    const noteResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 40,
      messages: [
        { role: 'system', content: NOTE_PROMPT },
        ...messages.slice(-6).map((m: any) => ({
          role: m.role,
          content: m.text,
        })),
        { role: 'assistant', content: reply },
      ],
    });

    let note =
      noteResponse.choices[0]?.message?.content?.trim() ?? null;

   if (note && userId && isMemorySafe(note)) {
  await supabase.from('working_notes').insert({
    user_id: userId,
    content: note,
  });
}


   return NextResponse.json({
  reply,
  note,
});


  } catch (err) {
    console.error(err);
    return NextResponse.json({
      reply: 'Something went wrong. Try again.',
    });
  }
}
