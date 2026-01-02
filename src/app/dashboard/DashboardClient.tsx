'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/* ================= TYPES ================= */
type Lang = 'en' | 'es';
type Phase = 'confirming' | 'profile' | 'guided' | 'chat';
type Reason = 'work' | 'finance' | 'future' | null;
type Pronoun = 'neutral' | 'they' | 'he' | 'she' | null;

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

/* ================= COPY ================= */
const COPY = {
  en: {
    listening: 'Agent AI · Listening',
    back: 'Back to start',
    guest: 'Guest mode',
    signin: 'Sign in',
    signout: 'Sign out',
    confirmTitle: 'Welcome',
    confirmBtn: 'Enter',
    nameTitle: 'How should I address you?',
    namePlaceholder: 'Your name',
    pronounNeutral: 'Use neutral language',
    pronounThey: 'They / them',
    pronounHe: 'He / him',
    pronounShe: 'She / her',
    startTalking: 'Start talking',
    send: 'Send',
    q1: 'Are you here mainly because of:',
    q1_work: 'Work or job uncertainty',
    q1_finance: 'Financial stress',
    q1_future: 'Thinking about my future direction',
    q2_work: 'What best describes your work situation right now?',
    q2_work_opts: [
      'I may lose my job',
      'I already lost my job',
      "I'm stuck but employed",
      "I'm working but anxious",
    ],
    q2_finance: 'How would you describe your financial situation?',
    q2_finance_opts: [
      'Living paycheck to paycheck',
      'Missing payments',
      'Stable but worried',
      'Uncertain income',
    ],
    q2_future: 'How clear do you feel about your direction right now?',
    q2_future_opts: [
      'Very unclear',
      'Somewhat unclear',
      'I have ideas but no plan',
      'I feel mostly clear',
    ],
    q3: 'What worries you the most right now?',
    chatPlaceholder: "Tell me what's troubling you…",
    grounding: "I'm here. Take a breath. You're not alone in this.",
  },
  es: {
    listening: 'Agente AI · Escuchando',
    back: 'Volver al inicio',
    guest: 'Modo invitado',
    signin: 'Iniciar sesión',
    signout: 'Salir',
    confirmTitle: 'Bienvenido',
    confirmBtn: 'Entrar',
    nameTitle: '¿Cómo debo dirigirme a ti?',
    namePlaceholder: 'Tu nombre',
    pronounNeutral: 'Lenguaje neutral',
    pronounThey: 'They / them',
    pronounHe: 'He / him',
    pronounShe: 'She / her',
    startTalking: 'Empezar',
    send: 'Enviar',
    q1: '¿Estás aquí principalmente por:',
    q1_work: 'Incertidumbre laboral',
    q1_finance: 'Estrés financiero',
    q1_future: 'Pensando en mi futuro',
    q2_work: '¿Cómo describirías tu situación laboral ahora?',
    q2_work_opts: [
      'Puedo perder mi trabajo',
      'Ya perdí mi trabajo',
      'Estoy empleado pero atrapado',
      'Trabajo con ansiedad',
    ],
    q2_finance: '¿Cómo describirías tu situación financiera?',
    q2_finance_opts: [
      'Vivo al día',
      'Estoy atrasado en pagos',
      'Estable pero preocupado',
      'Ingresos inciertos',
    ],
    q2_future: '¿Qué tan claro ves tu camino ahora?',
    q2_future_opts: [
      'Nada claro',
      'Poco claro',
      'Tengo ideas pero no plan',
      'Bastante claro',
    ],
    q3: '¿Qué es lo que más te preocupa ahora?',
    chatPlaceholder: 'Cuéntame qué te preocupa…',
    grounding: 'Estoy aquí. Respira. No estás solo.',
  },
};

/* ================= COMPONENT ================= */
export default function DashboardClientNotes() {
  const sp = useSearchParams();
  const router = useRouter();
  const lang = (sp.get('lang') as Lang) || 'en';
  const T = COPY[lang];

  const [phase, setPhase] = useState<Phase>('confirming');
  const [reason, setReason] = useState<Reason>(null);
  const [step, setStep] = useState(1);
  const [checked, setChecked] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [pronoun, setPronoun] = useState<Pronoun>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ NEW: working notes
  const [notes, setNotes] = useState<string[]>([]);

  // ✅ NEW: helper to add notes without duplicates
 const addNote = (text: string) => {
  if (!text) return;

  // Remove markdown and clean up
  const clean = text
    .replace(/\*\*|###|##|#/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract key topics/themes using pattern matching
  const topics: string[] = [];

  // Look for bullet points (most important content)
  const bulletMatch = clean.match(/[-•*]\s*([^-•*]+?)(?=[-•*]|$)/g);
  if (bulletMatch) {
    bulletMatch.slice(0, 4).forEach(bullet => {
      const topic = bullet
        .replace(/[-•*]\s*/, '')
        .split(':')[0] // Take text before colon
        .split('.')[0] // Take first sentence
        .trim();
      if (topic.length > 10 && topic.length < 60) {
        topics.push(topic);
      }
    });
  }

  // If no bullets, look for key phrases
  if (topics.length === 0) {
    const patterns = [
      /(?:focus on|think about|consider|try)\s+([^.!?]{10,50})/gi,
      /(?:skills?|strategies|steps?|actions?)[:\s]+([^.!?]{10,50})/gi,
      /(?:you (?:should|can|might))\s+([^.!?]{10,50})/gi
    ];

    patterns.forEach(pattern => {
      const matches = clean.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && topics.length < 4) {
          topics.push(match[1].trim());
        }
      }
    });
  }

  // Add topics to notes
  topics.forEach(topic => {
    setNotes((prev) =>
      prev.some(n => n.toLowerCase().includes(topic.toLowerCase().substring(0, 15))) 
        ? prev 
        : [...prev, topic]
    );
  });
};


  useEffect(() => {
    const guest =
      localStorage.getItem('neuronaut_guest') === '1' || sp.get('guest') === '1';

    if (guest) {
      setIsGuest(true);
      setPhase('profile');
      setChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? null;
      setUserEmail(email);
      setPhase(email ? 'confirming' : 'profile');
      setChecked(true);
    });
  }, [sp]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: {
  name,
  pronoun,
  reason,
  lang,
  mode: 'conversation', // ← THIS
},

        }),
      });

      const data = await res.json();

      if (data?.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
        // ✅ NEW: capture highlights
        addNote(data.reply);
      }
    } catch {
      const fallback =
        "I'm here with you. Something went wrong on my side — can you try again?";
      setMessages((prev) => [...prev, { role: 'assistant', text: fallback }]);
      // ✅ NEW: capture highlights
      addNote(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/?lang=${lang}`);
  };

  if (!checked) return null;

  return (
    <div style={page}>
      <div className="ghost-symbol" style={ghostSymbol} />

      <div style={aiOrbWrap}>
        <div style={{ ...aiOrb, ...pulse }} />
      </div>

      <div style={topBar}>
        <button onClick={() => router.push(`/?lang=${lang}`)} style={linkBtn}>
          {T.back}
        </button>
        {userEmail ? (
          <button onClick={handleSignOut} style={linkBtn}>
            {T.signout}
          </button>
        ) : (
          <button
            onClick={() => router.push(`/sign-in?lang=${lang}`)}
            style={linkBtn}
          >
            {T.signin}
          </button>
        )}
      </div>

      {phase !== 'confirming' && (
        <div style={label}>
          <div>NEURONAUT</div>
          <div style={{ opacity: 0.6 }}>{T.listening}</div>
          {isGuest && <div style={{ color: '#7aa2ff' }}>{T.guest}</div>}
        </div>
      )}

      {phase === 'confirming' && userEmail && (
        <div style={confirmBox}>
          <div style={{ opacity: 0.85 }}>{T.confirmTitle}</div>
          <div style={{ color: '#7aa2ff', margin: '6px 0 14px' }}>
            {userEmail}
          </div>
          <button style={primaryBtn} onClick={() => setPhase('profile')}>
            {T.confirmBtn}
          </button>
        </div>
      )}

      {phase === 'profile' && (
        <div style={questionBox}>
          <div style={question}>{T.nameTitle}</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={T.namePlaceholder}
            style={nameInput}
          />

          <div style={{ marginTop: 12 }}>
            <button
              style={pronoun === 'neutral' ? optBtnActive : optBtn}
              onClick={() => setPronoun('neutral')}
            >
              {T.pronounNeutral}
            </button>
            <button
              style={pronoun === 'they' ? optBtnActive : optBtn}
              onClick={() => setPronoun('they')}
            >
              {T.pronounThey}
            </button>
            <button
              style={pronoun === 'he' ? optBtnActive : optBtn}
              onClick={() => setPronoun('he')}
            >
              {T.pronounHe}
            </button>
            <button
              style={pronoun === 'she' ? optBtnActive : optBtn}
              onClick={() => setPronoun('she')}
            >
              {T.pronounShe}
            </button>
          </div>

          <button
            style={{ ...primaryBtn, marginTop: 16 }}
            disabled={!name || !pronoun}
            onClick={() => setPhase('guided')}
          >
            {T.startTalking}
          </button>
        </div>
      )}

      {phase === 'guided' && (
        <div style={questionBox}>
          {step === 1 && (
            <>
              <div style={question}>{T.q1}</div>
              <button
                style={optBtn}
                onClick={() => {
                  setReason('work');
                  setStep(2);
                }}
              >
                {T.q1_work}
              </button>
              <button
                style={optBtn}
                onClick={() => {
                  setReason('finance');
                  setStep(2);
                }}
              >
                {T.q1_finance}
              </button>
              <button
                style={optBtn}
                onClick={() => {
                  setReason('future');
                  setStep(2);
                }}
              >
                {T.q1_future}
              </button>
            </>
          )}

          {step === 2 && reason && (
            <>
              <div style={question}>{T[`q2_${reason}` as keyof typeof T]}</div>
              {(T[`q2_${reason}_opts` as keyof typeof T] as string[]).map(
                (o) => (
                  <button key={o} style={optBtn} onClick={() => setStep(3)}>
                    {o}
                  </button>
                )
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ color: '#7aa2ff', marginBottom: 12 }}>
                {T.grounding}
              </div>
              <div style={question}>{T.q3}</div>
              <button
                style={primaryBtn}
                onClick={() => {
                  const intro = `Alright ${name}. ${
                    reason === 'work'
                      ? "Let's talk about what's happening with work."
                      : reason === 'finance'
                      ? "Let's unpack the financial stress together."
                      : "Let's get clarity on your direction."
                  }`;

                  setMessages([{ role: 'assistant', text: intro }]);

                  // ✅ NEW: capture highlights (intro counts)
                  addNote(intro);

                  setPhase('chat');
                }}
              >
                {T.startTalking}
              </button>
            </>
          )}
        </div>
      )}

      {phase === 'chat' && (
        <div style={chatWrapper}>
          <div style={chatMessages}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={m.role === 'assistant' ? aiMessage : userMessage}
              >
                {m.text}
              </div>
            ))}
            {isLoading && (
              <div style={aiMessage}>
                <em>typing...</em>
              </div>
            )}
          </div>

          <div style={chatBar}>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={T.chatPlaceholder}
                style={chatInput}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                style={{
                  ...primaryBtn,
                  opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                }}
              >
                {T.send}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKING NOTES – now ACTIVE */}
      <div
        style={{
          position: 'fixed',
          left: '38%',
          top: 120,
          width: 260,
          minHeight: 120,
          borderRadius: 16,
          background: 'rgba(122,162,255,0.08)',
          border: '1px dashed rgba(122,162,255,0.4)',
          color: '#7aa2ff',
          padding: 16,
          zIndex: 5,
        }}
      >
        <strong>Working Notes</strong>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
          {notes.length === 0 ? (
            <span style={{ opacity: 0.7 }}>(waiting for conversation…)</span>
          ) : (
            notes.map((n, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                • {n}
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .ghost-symbol {
            right: 18% !important;
            top: 18% !important;
          }
        }

        @media (max-width: 768px) {
          .ghost-symbol {
            right: 50% !important;
            top: 58% !important;
            transform: translate(50%, -50%) !important;
            width: 420px;
            height: 420px;
            opacity: 0.18;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 60px rgba(120, 160, 255, 0.35);
          }
          50% {
            transform: scale(1.06);
            box-shadow: 0 0 95px rgba(120, 160, 255, 0.65);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 60px rgba(120, 160, 255, 0.35);
          }
        }
      `}</style>
    </div>
  );
}

/* ================= STYLES ================= */
const page = {
  height: '100vh',
  position: 'relative' as const,
  overflow: 'hidden',
  color: '#fff',
};

const ghostSymbol: React.CSSProperties = {
  position: 'absolute',
  right: '10%',
  top: '46%',
  width: 520,
  height: 520,
  backgroundImage: "url('/neuronautavatar.png')",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize: 'contain',
  opacity: 0.22,
  pointerEvents: 'none',
  zIndex: 0,
};

const aiOrbWrap = {
  position: 'absolute' as const,
  top: 110,
  left: 48,
  zIndex: 2,
};

const aiOrb = {
  width: 180,
  height: 180,
  borderRadius: '50%',
  backgroundImage: "url('/ai-brain-face.png')",
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  boxShadow: '0 0 80px rgba(120,160,255,0.45)',
  animation: 'pulse 4s ease-in-out infinite',
};

const topBar = {
  position: 'absolute' as const,
  top: 16,
  right: 20,
  zIndex: 3,
  display: 'flex',
  gap: 12,
};

const label = {
  position: 'absolute' as const,
  top: 28,
  left: 32,
  fontSize: 12,
  zIndex: 3,
};

const linkBtn = {
  background: 'none',
  border: 'none',
  color: '#7aa2ff',
  cursor: 'pointer',
};

const confirmBox: React.CSSProperties = {
  position: 'absolute',
  bottom: 140,
  left: '50%',
  transform: 'translateX(-50%)',
  textAlign: 'center',
  zIndex: 3,
};

const questionBox = {
  position: 'absolute' as const,
  bottom: 160,
  left: 48,
  maxWidth: 520,
  zIndex: 3,
};

const question = {
  marginBottom: 14,
  fontSize: 15,
};

const nameInput = {
  width: 340,
  padding: '12px 14px',
  borderRadius: 12,
  background: '#111827',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.12)',
};

const primaryBtn = {
  padding: '10px 18px',
  borderRadius: 12,
  border: 'none',
  background: '#7aa2ff',
  fontWeight: 700,
  cursor: 'pointer',
  color: '#000',
};

const optBtn = {
  display: 'block',
  marginBottom: 10,
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(122,162,255,0.4)',
  background: 'transparent',
  color: '#fff',
  width: 340,
  textAlign: 'left' as const,
  cursor: 'pointer',
};

const optBtnActive = {
  ...optBtn,
  background: 'rgba(122,162,255,0.15)',
};

const chatWrapper = {
  position: 'fixed' as const,
  bottom: 0,
  left: 0,
  width: '100%',
  zIndex: 4,
};

const chatMessages = {
  padding: '0 48px 12px',
  maxHeight: '50vh',
  overflowY: 'auto' as const,
};

const aiMessage = {
  color: '#7aa2ff',
  marginBottom: 12,
  padding: '10px 14px',
  borderRadius: 12,
  maxWidth: 520,
};

const userMessage = {
  marginBottom: 8,
  background: '#1f2937',
  padding: '10px 14px',
  borderRadius: 12,
  maxWidth: 520,
};

const chatBar = {
  padding: 24,
  borderTop: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(6,10,20,0.95)',
};

const chatInput = {
  flex: 1,
  padding: 16,
  borderRadius: 14,
  background: '#111827',
  color: '#fff',
  border: 'none',
};

const pulse = {
  animation: 'pulse 3.2s ease-in-out infinite',
};
