import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ================= BLOCKED PATTERNS ================= */
const BLOCKED_PATTERNS = [
  'suicidal', 'suicide', 'kill myself', 'self harm',
  'eating disorder', 'anorexia', 'bulimia',
  'hallucination', 'hearing voices', 'delusion',
  'bipolar disorder', 'schizophrenia',
  'cancer diagnosis', 'tumor', 'chest pain', 'heart attack',
  'medical diagnosis', 'prescription medication',
  'divorce lawyer', 'custody battle', 'sue someone',
  'lawsuit', 'court case',
  'hurt someone', 'kill someone', 'attack someone',
  'sexual abuse', 'physical abuse', 'domestic violence',
  'rape', 'assault victim',
];

/* ================= REDIRECT MESSAGE ================= */
const REDIRECT_REPLY = `
I can't help with medical, mental health crisis, legal, or harm-related topics.

For career and work exploration, I can discuss general directions.
What would you like to explore?
`;

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
After each reply, internally extract ONE short factual insight
that represents the core concern or direction.
This will be used as a working note.
Do NOT include the note in the reply text.

SCOPE:
- Career uncertainty
- Work transitions
- Skill direction
`;

/* ================= NOTE PROMPT ================= */
const NOTE_PROMPT = `
From the conversation so far, extract ONE short working note.
Rules:
- 6–12 words
- Neutral, factual
- No advice
- No emotion
- No punctuation at the end

Example:
"Fear of job loss due to AI automation"
`;

/* ================= HELPERS ================= */
function containsBlockedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_PATTERNS.some(term => lower.includes(term));
}

/* ================= API HANDLER ================= */
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { reply: "Tell me what's on your mind about work." },
        { status: 200 }
      );
    }

    for (const m of messages) {
      if (m.role === 'user' && typeof m.text === 'string') {
        if (containsBlockedContent(m.text)) {
          return NextResponse.json({ reply: REDIRECT_REPLY }, { status: 200 });
        }
      }
    }

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

    // Generate note separately
    const noteResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.text,
        })),
        { role: 'assistant', content: reply },
        { role: 'system', content: NOTE_PROMPT },
      ],
    });

    const note =
      noteResponse.choices[0]?.message?.content?.trim() ?? null;

    return NextResponse.json({ reply, note }, { status: 200 });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Please try again." },
      { status: 200 }
    );
  }
}
