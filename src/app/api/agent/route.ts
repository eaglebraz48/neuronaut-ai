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
];

function containsBlockedContent(text: string) {
  return BLOCKED_PATTERNS.some(t =>
    text.toLowerCase().includes(t)
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

/* ================= SYSTEM BASE ================= */
const BASE_SYSTEM_PROMPT = `
You are NEURONAUT.

RULES:
- 2–4 short sentences.
- Action oriented.
- Human tone.
- Do not over explain.
`;

/* ================= API ================= */
export async function POST(req: Request) {
  try {

    let messages: any[] = [];
    let context: any = {};
    let imageBase64: string | null = null;

    const type = req.headers.get('content-type') || '';

    /* ========= MULTIPART (YOUR DASHBOARD MODE) ========= */
    if (type.includes('multipart/form-data')) {
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
      return NextResponse.json({ reply: 'Tell me what is happening.' });
    }

    const lastUserMsg =
      [...messages].reverse().find(m => m.role === 'user')?.text || '';

    if (containsBlockedContent(lastUserMsg)) {
      return NextResponse.json({
        reply: 'I can’t help with harm or crisis topics. Let’s stay focused.',
      });
    }

    /* ================= PROFILE LOAD (FIXED) ================= */
    let userName: string | null = null;
    let userCountry: string | null = null;
    let lastWorkingNote = '';

    if (context?.userId) {

      const { data: profile } = await supabase
        .from('profiles')
        .select('name,country,pronoun')
        .or(`user_id.eq.${context.userId},id.eq.${context.userId}`)
.single();

      if (profile) {
        userName = profile.name || null;
        userCountry = profile.country || null;
      }

      /* Auto-capture name if user says it */
      if (!userName && lastUserMsg) {
        const match =
          lastUserMsg.match(/\b(my name is|i'm|im|i am|me chamo|eu sou)\s+([A-Za-zÀ-ÿ' -]{2,40})\b/i);

        const extracted = match?.[2]?.trim();

        if (extracted) {
          userName = extracted;

          await supabase
            .from('profiles')
            .upsert({
              user_id: context.userId,
              name: extracted
            }, { onConflict: 'user_id' });
        }
      }

      const { data: lastNote } = await supabase
        .from('working_notes')
        .select('content')
        .eq('user_id', context.userId)
        .order('created_at', { ascending:false })
        .limit(1)
        .single();

      if (lastNote) {
        lastWorkingNote = lastNote.content || '';
      }
    }

    /* ================= MEMORY (LAST 2 ONLY) ================= */
    let continuity = '';

    if (context?.userId) {
      const { data: recaps } = await supabase
        .from('session_recaps')
        .select('recap,created_at')
        .eq('user_id', context.userId)
        .order('created_at',{ ascending:false })
        .limit(2);

      if (recaps?.length) {
        continuity =
          'MEMORY:\n' +
          recaps.map((r:any)=>r.recap).join('\n\n');
      }
    }

    const lang = context?.lang || detectLang(lastUserMsg);
    const langName = LANG_NAMES[lang];

    /* ================= SYSTEM PROMPT ================= */
    const systemPrompt = `
${BASE_SYSTEM_PROMPT}

Language: ${langName}

Name: ${userName || 'not provided'}
Country: ${userCountry || 'not provided'}
Last note: ${lastWorkingNote || 'none'}

${continuity}

Behavior:
- If Name exists → greet by name naturally.
- NEVER ask name again.
- reference recent context naturally.
`;

    /* ================= GPT INPUT ================= */
    const gptMessages: any[] = [
      { role:'system', content: systemPrompt },

      ...(imageBase64
        ? [{
            role:'user',
            content:[
              { type:'text', text:'Analyze this image.' },
              {
                type:'image_url',
                image_url:{ url:`data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }]
        : messages.map(m => ({
            role:m.role,
            content:m.text
          }))
      )
    ];

    const completion = await openai.chat.completions.create({
      model:'gpt-4o-mini',
      temperature:0.3,
      max_tokens:280,
      messages:gptMessages,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() || '';

    /* ================= SAVE WORKING NOTE ================= */
    if (context?.userId && lastUserMsg) {

      await supabase.from('working_notes').insert({
        user_id: context.userId,
        content: lastUserMsg,
      });

      const cutoff =
        new Date(Date.now() - 6*60*60*1000).toISOString();

      await supabase
        .from('working_notes')
        .delete()
        .eq('user_id', context.userId)
        .lt('created_at', cutoff);
    }

    /* ================= SAVE RECAP ================= */
    if (context?.userId && reply) {

      await supabase.from('session_recaps').insert({
        user_id: context.userId,
        recap: `User: ${lastUserMsg}\nAI: ${reply}`
      });

      const { data: recaps } = await supabase
        .from('session_recaps')
        .select('id')
        .eq('user_id', context.userId)
        .order('created_at',{ ascending:false });

      if (recaps && recaps.length > 2) {
        const remove = recaps.slice(2).map((r:any)=>r.id);
        await supabase.from('session_recaps').delete().in('id', remove);
      }
    }

    return NextResponse.json({ reply });

  } catch (err) {
    console.error(err);
    return NextResponse.json({
      reply:'Something went wrong. Try again.'
    });
  }
}