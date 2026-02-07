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

/* ================= BASE SYSTEM PROMPT ================= */
const BASE_SYSTEM_PROMPT = `
You are NEURONAUT — a career clarity assistant.

STYLE:
- Short replies (1–3 sentences)
- One idea only
- Calm, human

INTELLIGENCE:
- Use previous notes as behavioral signals
- Detect patterns (stress, confusion, indecision)
- Suggest concrete next steps
- Be proactive

RULES:
- Always reply in the user's language
- Never mention systems or databases
`;

/* ================= MEMORY FILTER ================= */
function isMemorySafe(note: string): boolean {
  const banned = [
    'cannot access','can’t access','please provide','sorry',
    'i can’t','i cannot','ask me','let me know'
  ];

  const lower = note.toLowerCase();
  if (banned.some(b => lower.includes(b))) return false;
  if (lower.startsWith('research ') || lower.startsWith('consider ')) return false;

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

    /* ================= USER CONTEXT ================= */

    const lang = context?.lang || detectLang(lastUserMsg);
    const langName = LANG_NAMES[lang];

    const userId = context?.userId || null;

    const userName =
      context?.name
        ? context.name.charAt(0).toUpperCase() + context.name.slice(1)
        : null;

    const country =
      context?.country?.trim() || null;

    /* ================= FETCH NOTES ================= */

    let pastNotesText = '';

    if (userId) {
      const { data } = await supabase
        .from('working_notes')
        .select('content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(6);

      if (data?.length) {
        pastNotesText =
          '\nPrevious context:\n' +
          data.map(n => `- ${n.content}`).join('\n');
      }
    }

    /* ================= BUILD SYSTEM MESSAGE ================= */

    const systemPrompt = `
${BASE_SYSTEM_PROMPT}

${userName ? `The user's name is ${userName}. Address them naturally by name.` : ''}

${
  country
    ? `
The user lives in ${country}.
Tailor all education, career, and financial advice specifically to that country.
Mention local options when helpful.
`
    : `
If country is unknown, politely ask once:
"Which country are you in so I can tailor advice better?"
Do not ask repeatedly after they answer.
`
}

If local resources matter, you may ask for their city.
Ask only when necessary, never upfront.

Language: ${langName}

${pastNotesText}
`;

   /* ================= MAIN CHAT ================= */
/* ================= LANGUAGE SUGGESTION (SMART EARLY EXIT) ================= */

/* Detect preferred language based on country */
function inferPreferredLang(
  country: string | null,
  detected: 'pt' | 'es' | 'fr' | 'en'
): 'pt' | 'es' | 'fr' | 'en' {

  if (!country) return detected;

  const c = country.toLowerCase();

  /* Portuguese */
  const PT = [
    'brazil','brasil','portugal','angola','mozambique','cape verde'
  ];

  /* Spanish — ALL LATAM + Spain */
  const ES = [
    'mexico','argentina','colombia','chile','peru','uruguay','paraguay',
    'bolivia','ecuador','venezuela','guatemala','honduras','panama',
    'costa rica','nicaragua','el salvador','dominican republic','cuba',
    'spain','españa'
  ];

  /* French */
  const FR = [
    'france','canada','quebec','haiti','belgium','switzerland',
    'senegal','ivory coast','cameroon'
  ];

  if (PT.some(p => c.includes(p))) return 'pt';
  if (ES.some(p => c.includes(p))) return 'es';
  if (FR.some(p => c.includes(p))) return 'fr';

  return detected;
}


/* Only suggest when country language ≠ selected UI language */
function buildLanguageSuggestion(
  name: string | null,
  selectedLang: 'pt' | 'es' | 'fr' | 'en',
  country: string | null
): string | null {

  const preferred = inferPreferredLang(country, selectedLang);

  /* already matching → do nothing */
  if (preferred === selectedLang) return null;

  const first = name ? `Hi ${name}, ` : 'Hi, ';

  const map: Record<string, string> = {
    pt: `${first}vejo que você pode preferir português. Se mudar o idioma no topo da página, posso falar com você de forma mais pessoal.`,
    es: `${first}parece que prefieres español. Cambia el idioma arriba y puedo ayudarte mejor.`,
    fr: `${first}je vois que vous préférez le français. Changez la langue en haut pour une aide plus personnalisée.`,
  };

  return map[preferred] ?? null;
}


const suggestion = buildLanguageSuggestion(userName, lang, country);

if (suggestion) {
  return NextResponse.json({ reply: suggestion });
}


/* ================= NORMAL AI CHAT ================= */

const chatResponse = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPrompt },
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
Write ONE short working note.

Rules:
- ${langName}
- 6–12 words
- first person
- no names
- natural phrasing
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

    const note =
      noteResponse.choices[0]?.message?.content?.trim() ?? null;

    if (note && userId && isMemorySafe(note)) {
      await supabase.from('working_notes').insert({
        user_id: userId,
        content: note,
      });
    }

    return NextResponse.json({ reply, note });

  } catch (err) {
    console.error(err);
    return NextResponse.json({
      reply: 'Something went wrong. Try again.',
    });
  }
}
