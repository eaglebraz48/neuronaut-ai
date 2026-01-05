import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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

/* ================= REDIRECT MESSAGE ================= */
const REDIRECT_REPLY = `
I can't help with medical, mental health crisis, legal, or harm-related topics.
For career and work exploration, I can discuss general directions.
What would you like to explore?
`;

/* ================= LANGUAGE DETECTION ================= */
function detectLang(text: string): 'pt' | 'es' | 'fr' | 'en' {
  if (/[ãõçáéíóú]/i.test(text)) return 'pt';
  if (/[¿¡ñ]/i.test(text)) return 'es';
  if (/[àèùâêîôû]/i.test(text)) return 'fr';
  return 'en';
}

/* ================= LANGUAGE NAMES ================= */
const LANG_NAMES: Record<string, string> = {
  en: 'English',
  pt: 'Portuguese',
  es: 'Spanish',
  fr: 'French',
};

/* ================= SYSTEM PROMPT ================= */
const SYSTEM_PROMPT = `
You are NEURONAUT — a career clarity assistant.

CONVERSATION STYLE:
- Short replies (1–3 sentences)
- One idea only
- Human, calm, conversational
- No explanations unless asked
- No lists or bullets

IMPORTANT:
- Always reply in the SAME language as the user.
- Never switch languages.

SCOPE:
- Career uncertainty
- Work transitions
- Skill direction
`;

/* ================= HELPERS ================= */
function containsBlockedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_PATTERNS.some(term => lower.includes(term));
}

/* ================= API HANDLER ================= */
export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { reply: "Tell me what's on your mind about work." },
        { status: 200 }
      );
    }

    const lastUserMsg =
      [...messages].reverse().find(m => m.role === 'user')?.text || '';
    
    if (containsBlockedContent(lastUserMsg)) {
      return NextResponse.json({ reply: REDIRECT_REPLY }, { status: 200 });
    }

    // Use lang from context (dashboard), fallback to detection
    const lang = context?.lang || detectLang(lastUserMsg);
    const langName = LANG_NAMES[lang];

    // Main conversational reply
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.text,
        })),
      ],
    });

    const reply =
      chatResponse.choices[0]?.message?.content?.trim() ?? '';

    /* ================= NOTE EXTRACTION (LANG-AWARE) ================= */
    const langInstructions: Record<string, string> = {
      pt: 'Você DEVE responder APENAS em Português do Brasil. NÃO use inglês.',
      es: 'Debes responder SOLO en Español. NO uses inglés.',
      fr: 'Vous DEVEZ répondre UNIQUEMENT en Français. N\'utilisez PAS l\'anglais.',
      en: 'Respond in English only.',
    };

    const NOTE_PROMPT = `${langInstructions[lang]}

Extract ONE short working note (6-12 words) from this conversation.

CRITICAL: Write ONLY in ${langName}. NOT English.

Rules:
- Must be in ${langName} language
- 6–12 words maximum
- Neutral, factual statement
- No advice
- No emotion
- No punctuation at end

Example (${langName}):
${lang === 'pt' ? 'Preocupado com segurança no emprego em tecnologia' : 
  lang === 'es' ? 'Preocupado por seguridad laboral en tecnología' :
  lang === 'fr' ? 'Inquiet pour sécurité emploi en technologie' :
  'Worried about job security in technology'}`;

    const noteResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: NOTE_PROMPT },
        ...messages.slice(-6).map((m: any) => ({ // Only last 6 messages for context
          role: m.role,
          content: m.text,
        })),
        { role: 'assistant', content: reply },
      ],
      temperature: 0.1, // Very low for consistency
      max_tokens: 50,
    });

    let note = noteResponse.choices[0]?.message?.content?.trim() ?? null;

    // Clean up the note
    if (note) {
      note = note
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/\.$/, '') // Remove ending period
        .trim();
    }

    return NextResponse.json({ reply, note }, { status: 200 });
    
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again." },
      { status: 200 }
    );
  }
}