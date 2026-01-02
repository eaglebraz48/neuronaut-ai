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

For career and work exploration, I can discuss:
- General job types and industries
- Transferable skills
- High-level career directions

What aspect of work or career direction would you like to explore?
`;

/* ================= SYSTEM PROMPT ================= */
const SYSTEM_PROMPT = `
You are NEURONAUT — a career clarity assistant.

FORMAT RULES:
- Use **bold** for key concepts
- Use bullet points (-) for lists
- Keep answers structured and readable

SCOPE:
- Career paths and transitions
- Job types and industries
- Skill assessment and work anxiety
- Practical, high-level guidance

AVOID:
- Medical or legal advice
- Crisis counseling
- Investment or stock advice
- Making decisions for the user
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
        { reply: "Tell me what's on your mind about work or career direction." },
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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.text,
        })),
      ],
    });

    const reply = response.choices[0]?.message?.content ?? '';

    return NextResponse.json({ reply }, { status: 200 });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Please try again." },
      { status: 200 }
    );
  }
}
