'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DisclaimerModal from '@/components/DisclaimerModal';

/* ================= TYPES ================= */
type Lang = 'en' | 'es' | 'pt' | 'fr';
type Phase = 'confirming' | 'profile' | 'guided' | 'chat';
type Reason = 'work' | 'finance' | 'future' | null;
type Pronoun = 'neutral' | 'they' | 'he' | 'she' | null;

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};
type CopySchema = {
  listening: string;
  back: string;
  guest: string;
  signin: string;
  signout: string;
  confirmTitle: string;
  confirmBtn: string;
  nameTitle: string;
  namePlaceholder: string;
  pronounNeutral: string;
  pronounThey: string;
  pronounHe: string;
  pronounShe: string;
  startTalking: string;
  send: string;
  typing: string;
  notesTitle: string;
  notesEmpty: string;
  q1: string;
  q1_work: string;
  q1_finance: string;
  q1_future: string;
  q2_work: string;
  q2_work_opts: string[];
  q2_finance: string;
  q2_finance_opts: string[];
  q2_future: string;
  q2_future_opts: string[];
  q3: string;
  chatPlaceholder: string;
  grounding: string;
  intro_work: string;
  intro_finance: string;
  intro_future: string;
};

/* ================= COPY ================= */
const COPY: Record<Lang, CopySchema> = {
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
    typing: 'typing…',
    notesTitle: 'Working Notes',
    notesEmpty: '(waiting for conversation…)',
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
    intro_work: "Alright {name}. Let's talk about what's happening with work.",
    intro_finance: "Alright {name}. Let's unpack the financial stress together.",
    intro_future: "Alright {name}. Let's get clarity on your direction.",
  },

  pt: {
    listening: 'Agente AI · Ouvindo',
    back: 'Voltar ao início',
    guest: 'Modo convidado',
    signin: 'Entrar',
    signout: 'Sair',
    confirmTitle: 'Bem-vindo',
    confirmBtn: 'Entrar',
    nameTitle: 'Como devo me referir a você?',
    namePlaceholder: 'Seu nome',
    pronounNeutral: 'Linguagem neutra',
    pronounThey: 'They / them',
    pronounHe: 'Ele / dele',
    pronounShe: 'Ela / dela',
    startTalking: 'Começar',
    send: 'Enviar',
    typing: 'digitando…',
    notesTitle: 'Anotações',
    notesEmpty: '(aguardando conversa…)',
    q1: 'Você está aqui principalmente por:',
    q1_work: 'Incerteza no trabalho',
    q1_finance: 'Estresse financeiro',
    q1_future: 'Pensando no meu futuro',
    q2_work: 'Como está sua situação profissional agora?',
    q2_work_opts: [
      'Posso perder meu emprego',
      'Já perdi meu emprego',
      'Estou empregado, mas travado',
      'Trabalho com ansiedade',
    ],
    q2_finance: 'Como está sua situação financeira?',
    q2_finance_opts: [
      'Vivendo mês a mês',
      'Atrasando contas',
      'Estável, mas preocupado',
      'Renda incerta',
    ],
    q2_future: 'O quão claro está seu caminho agora?',
    q2_future_opts: [
      'Nada claro',
      'Pouco claro',
      'Tenho ideias, mas sem plano',
      'Relativamente claro',
    ],
    q3: 'O que mais te preocupa agora?',
    chatPlaceholder: 'Conte o que está te preocupando…',
    grounding: 'Estou aqui. Respire. Você não está sozinho.',
    intro_work: 'Certo, {name}. Vamos falar sobre o trabalho.',
    intro_finance: 'Certo, {name}. Vamos falar sobre as finanças.',
    intro_future: 'Certo, {name}. Vamos clarear o futuro.',
  },

  es: {
    listening: 'Agente AI · Escuchando',
    back: 'Volver al inicio',
    guest: 'Modo invitado',
    signin: 'Iniciar sesión',
    signout: 'Cerrar sesión',
    confirmTitle: 'Bienvenido',
    confirmBtn: 'Entrar',
    nameTitle: '¿Cómo debo llamarte?',
    namePlaceholder: 'Tu nombre',
    pronounNeutral: 'Lenguaje neutral',
    pronounThey: 'They / them',
    pronounHe: 'Él / lo',
    pronounShe: 'Ella / la',
    startTalking: 'Comenzar',
    send: 'Enviar',
    typing: 'escribiendo…',
    notesTitle: 'Notas',
    notesEmpty: '(esperando conversación…)',
    q1: '¿Estás aquí principalmente por:',
    q1_work: 'Incertidumbre laboral',
    q1_finance: 'Estrés financiero',
    q1_future: 'Pensando en mi futuro',
    q2_work: '¿Cómo describirías tu situación laboral?',
    q2_work_opts: [
      'Puedo perder mi trabajo',
      'Ya perdí mi trabajo',
      'Empleado pero estancado',
      'Trabajo con ansiedad',
    ],
    q2_finance: '¿Cómo está tu situación financiera?',
    q2_finance_opts: [
      'Viviendo al día',
      'Pagos atrasados',
      'Estable pero preocupado',
      'Ingresos inciertos',
    ],
    q2_future: '¿Qué tan claro ves tu camino?',
    q2_future_opts: [
      'Nada claro',
      'Algo confuso',
      'Ideas sin plan',
      'Bastante claro',
    ],
    q3: '¿Qué es lo que más te preocupa?',
    chatPlaceholder: 'Cuéntame qué te preocupa…',
    grounding: 'Estoy aquí. Respira. No estás solo.',
    intro_work: 'Bien, {name}. Hablemos del trabajo.',
    intro_finance: 'Bien, {name}. Hablemos de las finanzas.',
    intro_future: 'Bien, {name}. Aclaremos tu camino.',
  },

  fr: {
    listening: 'Agent AI · À l’écoute',
    back: 'Retour au début',
    guest: 'Mode invité',
    signin: 'Connexion',
    signout: 'Déconnexion',
    confirmTitle: 'Bienvenue',
    confirmBtn: 'Entrer',
    nameTitle: 'Comment dois-je m’adresser à vous ?',
    namePlaceholder: 'Votre nom',
    pronounNeutral: 'Langage neutre',
    pronounThey: 'They / them',
    pronounHe: 'Il / lui',
    pronounShe: 'Elle / elle',
    startTalking: 'Commencer',
    send: 'Envoyer',
    typing: 'écrit…',
    notesTitle: 'Notes',
    notesEmpty: '(en attente de la conversation…)',
    q1: 'Êtes-vous ici principalement pour :',
    q1_work: 'Incertitude professionnelle',
    q1_finance: 'Stress financier',
    q1_future: 'Réflexion sur l’avenir',
    q2_work: 'Quelle est votre situation professionnelle actuelle ?',
    q2_work_opts: [
      'Je risque de perdre mon emploi',
      "J'ai déjà perdu mon emploi",
      'Employé mais bloqué',
      'Je travaille avec anxiété',
    ],
    q2_finance: 'Comment est votre situation financière ?',
    q2_finance_opts: [
      'Je vis au jour le jour',
      'Paiements manqués',
      'Stable mais inquiet',
      'Revenus incertains',
    ],
    q2_future: 'Votre direction vous semble-t-elle claire ?',
    q2_future_opts: [
      'Pas du tout claire',
      'Plutôt floue',
      'Des idées sans plan',
      'Assez claire',
    ],
    q3: 'Qu’est-ce qui vous inquiète le plus ?',
    chatPlaceholder: 'Dites-moi ce qui vous préoccupe…',
    grounding: 'Je suis là. Respirez. Vous n’êtes pas seul.',
    intro_work: 'D’accord {name}. Parlons du travail.',
    intro_finance: 'D’accord {name}. Parlons des finances.',
    intro_future: 'D’accord {name}. Clarifions votre direction.',
  },
};

const TERMS_VERSION = '2026-01-02';

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
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [pronoun, setPronoun] = useState<Pronoun>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
const [notesOpen, setNotesOpen] = useState(
  typeof window !== 'undefined' ? window.innerWidth > 768 : true
);

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const addNote = (text: string) => {
    if (!text) return;

    const clean = text
      .replace(/\*\*|###|##|#/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const topics: string[] = [];
    const bulletMatch = clean.match(/[-•*]\s*([^-•*]+?)(?=[-•*]|$)/g);
    
    if (bulletMatch) {
      bulletMatch.slice(0, 4).forEach(bullet => {
        const topic = bullet
          .replace(/[-•*]\s*/, '')
          .split(':')[0]
          .split('.')[0]
          .trim();
        if (topic.length > 10 && topic.length < 60) {
          topics.push(topic);
        }
      });
    }

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

    topics.forEach(topic => {
      setNotes((prev) =>
        prev.some(n => n.toLowerCase().includes(topic.toLowerCase().substring(0, 15))) 
          ? prev 
          : [...prev, topic]
      );
    });
  };

  // Check if user has already accepted current terms version
  const checkTermsAcceptance = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('terms_acceptance')
        .select('*')
        .eq('user_id', uid)
        .eq('terms_version', TERMS_VERSION)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking terms:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Error checking terms acceptance:', err);
      return false;
    }
  };

  // Log terms acceptance to Supabase
  const logTermsAcceptance = async (uid: string) => {
    try {
      const { error } = await supabase
        .from('terms_acceptance')
        .insert({
          user_id: uid,
          terms_version: TERMS_VERSION,
          accepted_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error logging terms acceptance:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error logging terms acceptance:', err);
      return false;
    }
  };

  // Handle disclaimer acceptance
  const handleDisclaimerAccept = async () => {
    if (!isGuest && userId) {
      // Authenticated user - log to Supabase
      const success = await logTermsAcceptance(userId);
      if (success) {
        setHasAcceptedTerms(true);
        setShowDisclaimer(false);
      } else {
        console.error('Failed to save acceptance');
        // Still allow them to proceed
        setHasAcceptedTerms(true);
        setShowDisclaimer(false);
      }
    } else {
      // Guest mode - create anonymous record in Supabase
      const anonymousId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const { error } = await supabase
          .from('terms_acceptance')
          .insert({
            user_id: anonymousId,
            terms_version: TERMS_VERSION,
            accepted_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error logging guest acceptance:', error);
        }
      } catch (err) {
        console.error('Error logging guest acceptance:', err);
      } finally {
        // Always allow them to proceed
        setHasAcceptedTerms(true);
        setShowDisclaimer(false);
      }
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const guest = localStorage.getItem('neuronaut_guest') === '1' || sp.get('guest') === '1';

        if (guest) {
          setIsGuest(true);
          setPhase('profile');
          setShowDisclaimer(true);
          setHasAcceptedTerms(false);
          setChecked(true);
          return;
        }

        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        
        if (session?.user) {
          const uid = session.user.id;
          const email = session.user.email ?? null;
          
          setUserId(uid);
          setUserEmail(email);

          // Check if user has accepted current terms
          const hasAccepted = await checkTermsAcceptance(uid);
          setHasAcceptedTerms(hasAccepted);
          setShowDisclaimer(!hasAccepted);
          
          setPhase('confirming');
        } else {
          // No auth - show disclaimer
          setPhase('profile');
          setShowDisclaimer(true);
          setHasAcceptedTerms(false);
        }
        
        setChecked(true);
      } catch (error) {
        console.error('Error initializing user:', error);
        setPhase('profile');
        setChecked(true);
      }
    };

    initializeUser();
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
            mode: 'conversation',
          },
        }),
      });

      const data = await res.json();

      if (data?.reply) {
  setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
}

if (data?.note) {
  setNotes((prev) =>
    prev.includes(data.note) ? prev : [...prev, data.note]
  );
}

    } catch {
      const fallback = "I'm here with you. Something went wrong on my side — can you try again?";
      setMessages((prev) => [...prev, { role: 'assistant', text: fallback }]);
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
    <>
      {showDisclaimer && (
        <DisclaimerModal 
          termsVersion={TERMS_VERSION}
          persistence="none"
          onAccept={handleDisclaimerAccept}
          onDecline={() => router.push(`/?lang=${lang}`)}
        />
      )}

      <div style={page}>
        <div className="ghost-symbol" style={ghostSymbol} />

        <div style={aiOrbWrap}>
          <div style={{ ...aiOrb, ...pulse }} />
        </div>

       <div style={notesAuthBar}>
  {/* Language switch */}
  <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
    {(['en', 'pt', 'es', 'fr'] as Lang[]).map(l => (
      <button
        key={l}
        onClick={() => router.push(`/dashboard?lang=${l}`)}
        style={{
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          border: '1px solid rgba(122,162,255,0.4)',
          background: l === lang ? '#7aa2ff' : 'transparent',
          color: l === lang ? '#000' : '#7aa2ff',
          cursor: 'pointer',
        }}
      >
        {l.toUpperCase()}
      </button>
    ))}
  </div>

  {/* Back */}
  <button onClick={() => router.push(`/?lang=${lang}`)} style={linkBtn}>
    {T.back}
  </button>

  {/* Auth */}
  {userEmail ? (
    <button onClick={handleSignOut} style={signOutBtn}>
      {T.signout}
    </button>
  ) : (
    <button onClick={() => router.push(`/sign-in?lang=${lang}`)} style={signInBtn}>
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
            <div style={{ color: '#7aa2ff', margin: '6px 0 14px' }}>{userEmail}</div>
            <button style={primaryBtn} onClick={() => setPhase('profile')}>
              {T.confirmBtn}
            </button>
          </div>
        )}

        {phase === 'profile' && (
          <div style={questionBox}>
           <div style={question} className="question-text-mobile">{T.nameTitle}</div>
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
              style={{ 
                ...primaryBtn, 
                marginTop: 16,
                opacity: (!name || !pronoun || !hasAcceptedTerms) ? 0.5 : 1,
                cursor: (!name || !pronoun || !hasAcceptedTerms) ? 'not-allowed' : 'pointer'
              }}
              disabled={!name || !pronoun || !hasAcceptedTerms}
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
               <div style={question} className="question-text-mobile">{T.q1}</div>
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
                <div style={question} className="question-text-mobile">{T[`q2_${reason}` as keyof typeof T]}</div>
                {(T[`q2_${reason}_opts` as keyof typeof T] as string[]).map((o) => (
                  <button key={o} style={optBtn} onClick={() => setStep(3)}>
                    {o}
                  </button>
                ))}
              </>
            )}

            {step === 3 && (
              <>
                <div style={{ color: '#1E2A5A', marginBottom: 12, fontWeight: 600 }}>{T.grounding}</div>
                <div style={question} className="question-text-mobile">{T.q3}</div>
                <button
                  style={primaryBtn}
                  onClick={() => {
                    const intro =
  reason === 'work'
    ? T.intro_work.replace('{name}', name)
    : reason === 'finance'
    ? T.intro_finance.replace('{name}', name)
    : T.intro_future.replace('{name}', name);

                    setMessages([{ role: 'assistant', text: intro }]);
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
    className={m.role === 'assistant' ? 'ai-message-mobile' : 'user-message-mobile'}
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
  className="chat-input-mobile"
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

       <div
  style={{
    position: 'fixed',
    left: '38%',
    top: 120,
    width: 280,
    borderRadius: 18,
    background: '#F3F4FF',
    border: '1px solid #D6D9FF',
    color: '#2B2E5F',
    padding: 16,
    boxShadow: '0 20px 60px rgba(120,130,255,0.35)',
    zIndex: 5,
  }}
>
  {/* HEADER */}
<div
  onClick={() => setNotesOpen(v => !v)}
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    userSelect: 'none',
  }}
>
  <strong>{T.notesTitle}</strong>
  <span
    style={{
      fontSize: 16,
      opacity: 0.7,
      transform: notesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
    }}
  >
    ⌄
  </span>
</div>


  {/* BODY */}
  {notesOpen && (
    <>
      {notes.length === 0 ? (
        <span style={{ color: '#141a33', opacity: 0.9 }}>
          {T.notesEmpty}
        </span>
      ) : (
        notes.map((n, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            • {n}
          </div>
        ))
      )}
    </>
  )}
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
    
    /* ADD THESE NEW RULES FOR TEXT READABILITY */
    .ai-message-mobile {
      font-size: 16px !important;
      line-height: 1.6 !important;
    }
    
    .user-message-mobile {
      font-size: 16px !important;
      line-height: 1.6 !important;
    }
    
    .chat-input-mobile {
      font-size: 16px !important;
    }
    
    .question-text-mobile {
      font-size: 16px !important;
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
    </>
  );
}

/* ================= STYLES ================= */

const page: React.CSSProperties = {
  height: '100vh',
  position: 'relative',
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

const aiOrbWrap: React.CSSProperties = {
  position: 'absolute',
  top: 110,
  left: 48,
  zIndex: 2,
};

// Replace your aiOrb style with this (human face only)

const aiOrb = {
  width: 200,
  height: 200,
  borderRadius: '50%',
  backgroundImage: "url('/ai-brain-face.png')", // <-- put the final face image here
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',

  // soften + humanize
  filter: 'brightness(1.05) contrast(0.98) saturate(0.95)',
  boxShadow: `
    0 0 40px rgba(120,140,255,0.25),
    inset 0 0 0 1px rgba(255,255,255,0.06)
  `,
};



const label: React.CSSProperties = {
  position: 'absolute',
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

/* === AUTH BUTTONS (ABOVE WORKING NOTES) === */
const notesAuthBar: React.CSSProperties = {
  position: 'fixed',
  left: '38%',
  top: 80,
  display: 'flex',
  gap: 12,
  zIndex: 6,
};

const signInBtn = {
  padding: '6px 12px',
  borderRadius: 8,
  background: '#ffffff',
  color: '#000',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
};

const signOutBtn = {
  padding: '6px 12px',
  borderRadius: 8,
  background: '#dc2626',
  color: '#000',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
};

const confirmBox: React.CSSProperties = {
  position: 'absolute',
  bottom: 140,
  left: '50%',
  transform: 'translateX(-50%)',
  textAlign: 'center',
  zIndex: 3,
};

const questionBox: React.CSSProperties = {
  position: 'absolute',
  bottom: 80, // desce a caixa
  left: 48,
  maxWidth: 520,
  zIndex: 3,

  background: '#EEF3FF', // mesmo tom do Working Notes
  border: '1px solid rgba(92,124,250,0.45)',
  borderRadius: 18,
  padding: 20,
  boxShadow: '0 14px 40px rgba(92,124,250,0.25)',
  color: '#1E2A5A', // texto mais vivo
};

const question = {
  marginBottom: 14,
  fontSize: 15,
  color: '#1E2A5A',  // NEW - dark blue, matches questionBox text
  fontWeight: 600,   // ADD - makes it bold
};

const nameInput = {
  width: 340,
  padding: '12px 14px',
  borderRadius: 12,
background: '#11172e',
color: '#e5ecff',
border: '1px solid rgba(122,162,255,0.3)',


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

const optBtn: React.CSSProperties = {
  display: 'block',
  marginBottom: 10,
  padding: '10px 14px',
  borderRadius: 10,
 background: '#141a33',
color: '#e5ecff',
border: '1px solid rgba(122,162,255,0.35)',
boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  width: 340,
  textAlign: 'left',
  cursor: 'pointer',
};

const optBtnActive = {
  ...optBtn,
  background: '#7aa2ff',  // NEW - bright blue
  color: '#000',          // ADD - dark text
  fontWeight: 700,        // ADD - bold
  border: '2px solid #5c7cfa',  // ADD - stronger border
};

const chatWrapper: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  zIndex: 4,
};

const chatMessages: React.CSSProperties = {
  padding: '0 48px 12px',
  maxHeight: '50vh',
  overflowY: 'auto',
};

const aiMessage: React.CSSProperties = {
  marginBottom: 12,
  padding: '12px 16px',
  borderRadius: 14,
  maxWidth: 520,

  background: 'linear-gradient(135deg, #E6EBFF 0%, #F2F5FF 100%)',
  color: '#1E2A5A',

  border: '1px solid rgba(122,162,255,0.45)',
  boxShadow: '0 12px 36px rgba(122,162,255,0.35)',
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

const chatInput: React.CSSProperties = {
  flex: 1,
  padding: 16,
  borderRadius: 16,

  background: '#0F1533',
  color: '#E5ECFF',

  border: '1px solid rgba(122,162,255,0.35)',
  boxShadow: '0 0 0 2px rgba(122,162,255,0.45)',

  outline: 'none',
};


const pulse = {
  animation: 'pulse 3.2s ease-in-out infinite',
};