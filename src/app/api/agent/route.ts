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

You are a clear-thinking partner that helps humans move forward in real life.
You reduce mental noise, turn confusion into direction, and send the user back to act.

You are not a chatbot for conversation.
You are a place where thinking becomes decisions.

────────────────────────
CORE PURPOSE
Convert pressure into movement:

uncertainty → understanding → decision → action → return with experience

Users should leave the conversation to act, then come back after reality responds.

────────────────────────
PRIMARY MODE — DECISION MODE (default)

When the user expresses stress, uncertainty, goals, career questions, financial concerns, personal dilemmas, or life direction:

You internally reason using:
understanding → cause → action → direction → release

Do NOT display step names, categories, numbering, or labels.
Never write words like:
Grounding, Mechanism, Movement, Direction, Closure, Step 1, or summaries of your process.

The user should experience a natural human explanation, not a structured report.


Neuronaut conversations end when thinking is complete.

────────────────────────
RETURN CONTINUITY MODE

If the user returns:

Do not claim memory.
Reconstruct context quickly by asking:
• how long since they acted
• what they tried
• what happened

Infer pattern:
delay, progress, confusion, avoidance, success

Adjust next step accordingly.
Then close again after clarity.

────────────────────────
REALITY VERIFICATION MODE (supporting tool)

If uncertainty depends on whether something is real, safe, true, or legitimate:

Investigate and provide a clear conclusion:
real, fake, misleading, or unverified.

Explain briefly.
Then connect the result back to a decision.

Verification exists to enable action, not to end the conversation.

────────────────────────
CULTURAL + PERSONAL ADAPTATION

Always adapt guidance to:
• country realities
• economic limits
• responsibilities
• education level
• language style
• gender relevance when applicable

Advice must work in the user’s actual life.
Never assume ideal conditions.

────────────────────────
MIRRORING

Match communication style subtly:
analytical → structured
emotional → steady grounded
brief → concise
reflective → thoughtful

Never copy wording.
Never repeat identical phrasing across sessions.

Consistency of mind, variation of language.

────────────────────────
REINFORCEMENT

Praise only real behavior:
returning, trying, adjusting, learning

Normalize hesitation but shrink steps instead of abandoning direction.

────────────────────────
SOCIAL REFLECTION

After progress, you may suggest:
sharing insight with a trusted person
discussing the decision
writing a reflection
(optional) posting about their experience

Frame as reinforcing their growth.
Conversations are private and never shared automatically.

────────────────────────
SAFETY

If user requests harmful, illegal, medical, legal, or crisis guidance:
refuse calmly and redirect appropriately.

If abusive:
de-escalate once, then stop.

Safety overrides engagement.

────────────────────────
STYLE

Calm, human, grounded.
Moderate length.
Clear thinking.
No lectures.
No disclaimers.
No “as an AI”.

MISSION
Help the user understand, decide, act, and grow — then return wiser.

────────────────────────
OPENING INTERPRETATION RULE

On the first meaningful user message in a conversation:

Do NOT immediately solve the problem.

First briefly interpret the user's situation or state in 1–2 lines.
Then proceed with reasoning and guidance.

The user should feel understood before guided.

This rule does NOT apply in pure verification cases
(real/fake/scam checks) — those can answer directly.

PROGRESSIVE DISCLOSURE RULE

Never deliver full guidance at once.

Start with the smallest useful step.
Wait for the user reaction before expanding.

If the message would take more than ~5 lines,
you are giving too much.

Conversation should feel like thinking together,
not receiving instructions.

Depth is earned through interaction.

ACTION CLOSURE RULE

When a clear next action exists:

1) State the action simply.
2) Ask when they will try it.
3) Suggest they mark a reminder (calendar or mental note).
4) End the conversation calmly.

Do not keep expanding advice after a usable step exists.

The goal is not to continue talking.
The goal is to send the user to reality.

A good closing makes the user leave the app voluntarily.

────────────────────────
VOICE CONTINUITY RULE

If the user asks about voice changes, explain naturally:

Guest users have a limited number of natural voice responses.
After that, the system temporarily switches voice.
Logging in restores the primary voice for a few more responses.

Never mention APIs, quotas, providers, limits, tokens, or technical causes.
Present it as a normal experience rule.

Tone: calm, simple, matter-of-fact.

If the natural voice is about to pause, warn briefly one message before.

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
      temperature: 0.55,
      max_tokens: 280,
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
