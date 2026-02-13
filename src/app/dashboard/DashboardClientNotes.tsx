'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DisclaimerModal from '@/components/DisclaimerModal';

/* ================= TYPES ================= */
type Lang = 'en' | 'es' | 'pt' | 'fr';
type Phase = 'confirming' | 'profile' | 'guided' | 'chat';
type Reason = 'work' | 'finance' | 'future' | 'other' | null;

type Pronoun = 'neutral' | 'they' | 'he' | 'she' | null;

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

type CopySchema = {
voiceOn: string;
voiceOff: string;
voiceTurnOn: string;
voiceTurnOff: string;

  listening: string;
  back: string;
  guest: string;
  signin: string;
  signout: string;
  delete: string;

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
  q1_other: string;

  q2_work: string;
  q2_other: string;
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

  calmNote: string;
};

/* ================= COPY ================= */
const COPY: Record<Lang, CopySchema> = {

  /* ================= EN ================= */
  en: {
    voiceOn: '🔊 Voice On',
voiceOff: '🔇 Voice Off',
voiceTurnOn: 'turn on',
voiceTurnOff: 'turn off',

listening: 'Agent AI · Listening',
    back: 'Back to start',
    guest: 'Guest mode',
    signin: 'Sign in',
    signout: 'Sign out',
    delete: 'Delete account',

    confirmTitle: 'Welcome',
    confirmBtn: 'Enter',

    nameTitle: 'How should I address you?',
    namePlaceholder: 'Your name',

    pronounNeutral: 'Use neutral language',
    pronounThey: 'They / them',
    pronounHe: 'He / him',
    pronounShe: 'She / her',

    startTalking: 'Start typing',
    send: 'Send',
    typing: 'typing…',

    notesTitle: 'Working Notes',
    notesEmpty: '(waiting for conversation…)',

    q1: 'What do you want help with today?',
    q1_work: 'Work or job',
    q1_finance: 'Money or finances',
    q1_future: 'Future direction',
    q1_other: 'Something else',

    q2_work: 'What best describes your work situation?',
    q2_other: 'Tell me what’s going on. I’m listening.',
    q2_work_opts: [
      'I may lose my job',
      'I already lost my job',
      'Stuck but employed',
      'Working but stressed',
    ],

    q2_finance: 'How are your finances right now?',
    q2_finance_opts: [
      'Paycheck to paycheck',
      'Missing payments',
      'Stable but worried',
      'Uncertain income',
    ],

    q2_future: 'How clear is your direction?',
    q2_future_opts: [
      'Very unclear',
      'Somewhat unclear',
      'Ideas but no plan',
      'Mostly clear',
    ],

    q3: 'What do you want to fix today?',
    chatPlaceholder: 'Example: I need a better job fast',

    grounding: 'Good. Let’s solve this together.',

    intro_work: 'Tell me the problem. I’ll build your action plan.',
    intro_finance: 'Show me the numbers. Let’s fix this step by step.',
    intro_future: 'Let’s design your next move together.',

    calmNote: 'Clear thinking. Smart steps. Let’s move forward.',
  },


  /* ================= PT ================= */
  pt: {
voiceOn: '🔊 Voz ligada',
voiceOff: '🔇 Voz desligada',
voiceTurnOn: 'ligar',
voiceTurnOff: 'desligar',

    listening: 'Agente AI · Ouvindo',
    back: 'Voltar ao início',
    guest: 'Modo convidado',
    signin: 'Entrar',
    signout: 'Sair',
    delete: 'Excluir conta',

    confirmTitle: 'Bem-vindo',
    confirmBtn: 'Entrar',

    nameTitle: 'Como devo te chamar?',
    namePlaceholder: 'Seu nome',

    pronounNeutral: 'Linguagem neutra',
    pronounThey: 'They / them',
    pronounHe: 'Ele / dele',
    pronounShe: 'Ela / dela',

    startTalking: 'Comece a digitar',
    send: 'Enviar',
    typing: 'digitando…',

    notesTitle: 'Anotações',
    notesEmpty: '(aguardando conversa…)',

    q1: 'O que você quer resolver hoje?',
    q1_work: 'Trabalho',
    q1_finance: 'Dinheiro ou finanças',
    q1_future: 'Direção do futuro',
    q1_other: 'Outra coisa',

    q2_work: 'Como está sua situação profissional?',
    q2_other: 'Me conta o que está acontecendo. Estou ouvindo.',
    q2_work_opts: [
      'Posso perder o emprego',
      'Já perdi o emprego',
      'Empregado mas travado',
      'Trabalhando com estresse',
    ],

    q2_finance: 'Como estão suas finanças?',
    q2_finance_opts: [
      'Vivendo mês a mês',
      'Contas atrasadas',
      'Estável mas preocupado',
      'Renda incerta',
    ],

    q2_future: 'Quão claro está seu caminho?',
    q2_future_opts: [
      'Nada claro',
      'Pouco claro',
      'Ideias sem plano',
      'Relativamente claro',
    ],

    q3: 'O que você quer consertar hoje?',
    chatPlaceholder: 'Exemplo: preciso de um emprego melhor rápido',

    grounding: 'Beleza. Vamos resolver isso juntos.',

    intro_work: 'Me diga o problema. Vou montar seu plano de ação.',
    intro_finance: 'Me mostra os números. Vamos resolver passo a passo.',
    intro_future: 'Vamos planejar seu próximo passo juntos.',

    calmNote: 'Clareza. Próximos passos inteligentes. Vamos avançar.',
  },


  /* ================= ES ================= */
  es: {
voiceOn: '🔊 Voz activada',
voiceOff: '🔇 Voz desactivada',
voiceTurnOn: 'encender',
voiceTurnOff: 'apagar',

    listening: 'Agente AI · Escuchando',
    back: 'Volver',
    guest: 'Empezar ahora (sin cuenta)',
    signin: 'Iniciar sesión',
    signout: 'Cerrar sesión',
    delete: 'Eliminar cuenta',

    confirmTitle: 'Bienvenido',
    confirmBtn: 'Entrar',

    nameTitle: '¿Cómo te llamo?',
    namePlaceholder: 'Tu nombre',

    pronounNeutral: 'Neutral',
    pronounThey: 'They / them',
    pronounHe: 'Él',
    pronounShe: 'Ella',

    startTalking: 'Empieza a escribir',
    send: 'Enviar',
    typing: 'escribiendo…',

    notesTitle: 'Notas',
    notesEmpty: '(esperando conversación…)',

    q1: '¿Qué tienes en mente hoy?',
    q1_work: 'Trabajo',
    q1_finance: 'Dinero',
    q1_future: 'Mi futuro',
    q1_other: 'Otra cosa',

    q2_work: '¿Cómo te sientes con el trabajo?',
    q2_other: 'Cuéntame. Te escucho.',
    q2_work_opts: ['Puedo perderlo', 'Ya lo perdí', 'Estancado', 'Estresado'],

    q2_finance: '¿Y el dinero?',
    q2_finance_opts: ['Muy justo', 'Atrasado', 'Estable pero preocupado', 'Inestable'],

    q2_future: '¿Tu camino se siente claro?',
    q2_future_opts: ['Nada claro', 'Confuso', 'Ideas sin plan', 'Bastante claro'],

    q3: '¿En qué te ayudo hoy?',
    chatPlaceholder: 'Escribe con normalidad…',

    grounding: 'Bien. Lo resolvemos juntos.',

    intro_work: 'Cuéntame qué pasa.',
    intro_finance: 'Veamos esto con calma.',
    intro_future: 'Planeemos tu siguiente paso.',

    calmNote: 'Aquí para ayudarte, nada más.',
  },


  /* ================= FR ================= */
  fr: {
voiceOn: '🔊 Voix activée',
voiceOff: '🔇 Voix désactivée',
voiceTurnOn: 'activer',
voiceTurnOff: 'désactiver',

    listening: 'Agent AI · À l’écoute',
    back: 'Retour',
    guest: 'Commencer maintenant (sans compte)',
    signin: 'Connexion',
    signout: 'Déconnexion',
    delete: 'Supprimer le compte',

    confirmTitle: 'Bienvenue',
    confirmBtn: 'Entrer',

    nameTitle: 'Comment dois-je t’appeler ?',
    namePlaceholder: 'Ton prénom',

    pronounNeutral: 'Neutre',
    pronounThey: 'They / them',
    pronounHe: 'Il',
    pronounShe: 'Elle',

    startTalking: 'Commence à écrire',
    send: 'Envoyer',
    typing: 'écrit…',

    notesTitle: 'Notes',
    notesEmpty: '(en attente…)',

    q1: 'Qu’as-tu en tête aujourd’hui ?',
    q1_work: 'Travail',
    q1_finance: 'Argent',
    q1_future: 'Mon avenir',
    q1_other: 'Autre chose',

    q2_work: 'Comment te sens-tu au travail ?',
    q2_other: 'Dis-moi. Je t’écoute.',
    q2_work_opts: ['Risque de le perdre', 'Déjà perdu', 'Bloqué', 'Stressé'],

    q2_finance: 'Et côté argent ?',
    q2_finance_opts: ['Très serré', 'Retards de paiement', 'Stable mais inquiet', 'Instable'],

    q2_future: 'Ton chemin est clair ?',
    q2_future_opts: ['Pas clair', 'Confus', 'Idées sans plan', 'Plutôt clair'],

    q3: 'Comment puis-je aider ?',
    chatPlaceholder: 'Parle normalement…',

    grounding: 'D’accord. On avance ensemble.',

    intro_work: 'Raconte-moi.',
    intro_finance: 'Regardons ça calmement.',
    intro_future: 'Construisons la suite.',

    calmNote: 'Simplement là pour t’aider.',
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
const [country, setCountry] = useState('');
const [voiceOn, setVoiceOn] = useState(true);

/* ================= VOICE ================= */
/* ================= VOICE (ELEVENLABS) ================= */
const speak = async (text: string) => {
  if (!voiceOn) return;

  try {
    const res = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.play();
  } catch (err) {
    console.error('voice error', err);
  }
};

  const [pronoun, setPronoun] = useState<Pronoun>(null);
  const [inputValue, setInputValue] = useState('');
const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
const [aiReplyCount, setAiReplyCount] = useState(0);
const [showCalmNote, setShowCalmNote] = useState(false);


  const [notesOpen, setNotesOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  );

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // Generate a unique guest ID (for terms acceptance only)
  const generateGuestId = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  // Save working note - ONLY for authenticated users
  const saveWorkingNote = async (uid: string, content: string) => {
    if (!content || content.trim().length === 0) {
      console.log('Skipping empty note');
      return;
    }

    console.log('Attempting to save note:', { uid, content });

    const { error } = await supabase
      .from('working_notes')
      .insert({
        user_id: uid,
        content: content.trim(),
      });

    if (error) {
      console.error('Error saving working note:', error);
    } else {
      console.log('Successfully saved note');
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
        setHasAcceptedTerms(true);
        setShowDisclaimer(false);
      }
    } else {
      // Guest mode - create anonymous terms acceptance record only
      const guestId = generateGuestId();
      
      try {
        const { error } = await supabase
          .from('terms_acceptance')
          .insert({
            user_id: guestId,
            terms_version: TERMS_VERSION,
            accepted_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error logging guest acceptance:', error);
        }
      } catch (err) {
        console.error('Error logging guest acceptance:', err);
      } finally {
        setHasAcceptedTerms(true);
        setShowDisclaimer(false);
      }
    }
  };
const handleDelete = async () => {
  const isReviewer = sp.get('reviewer') === '1';

  if (isReviewer) {
    alert('Review mode — do not delete this account.\n\nThis popup demonstrates what users would see when deleting.');
    return;
  }

  if (!confirm('Delete account and all stored data?')) return;

  const res = await fetch('/api/delete-account', { method: 'POST' });
  const json = await res.json();

  if (json.ok) {
    await supabase.auth.signOut();
    router.push('/?lang=' + lang);
  }
};


// First useEffect - Check initial session on page load
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
        const hasAccepted = await checkTermsAcceptance(uid);
        setHasAcceptedTerms(hasAccepted);
        setShowDisclaimer(!hasAccepted);
        
        // Load past notes for returning users
        const { data: notesData } = await supabase
          .from('working_notes')
          .select('content')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(6);
        if (notesData && notesData.length > 0) {
          setNotes(notesData.map(n => n.content));
        }
        
        setPhase('confirming');
      } else {
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

/* ================= WELCOME VOICE ================= */


// Second useEffect - Listen for auth state changes (magic link, sign in, sign out)
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth event:', event, session); // Debug log
      
      if (event === 'SIGNED_IN' && session?.user) {
        const uid = session.user.id;
        const email = session.user.email ?? null;
        
        setUserId(uid);
        setUserEmail(email);
        setIsGuest(false);
        
        const hasAccepted = await checkTermsAcceptance(uid);
        setHasAcceptedTerms(hasAccepted);
        setShowDisclaimer(!hasAccepted);



        
        // Load past notes
        const { data: notesData } = await supabase
          .from('working_notes')
          .select('content')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(6);

        if (notesData && notesData.length > 0) {
          setNotes(notesData.map(n => n.content));
        }
        
        setPhase('confirming');
        setChecked(true);
   } else if (event === 'SIGNED_OUT') {
  setUserId(null);
  setUserEmail(null);
  setNotes([]);
  router.push(`/?lang=${lang}`);
}

    }
  );

  return () => {
    authListener.subscription.unsubscribe();
  };
}, []);
const handleSend = async () => {
  if (!inputValue.trim() || isLoading) return;

  const userMsg: ChatMessage = { role: 'user', text: inputValue };
  setMessages((prev) => [...prev, userMsg]);
  setInputValue('');
  setIsLoading(true);

  try {
    const form = new FormData();

form.append(
  'messages',
  JSON.stringify([...messages, userMsg])
);

form.append(
  'context',
  JSON.stringify({
    name,
    pronoun,
    reason,
    lang,
    userId,
    country,
    mode: 'conversation',
  })
);

/* se tiver imagem selecionada */
if (selectedImage) {
  form.append('image', selectedImage);
}

const res = await fetch('/api/agent', {
  method: 'POST',
  body: form,
});

    const data = await res.json();

    // 1️⃣ Render AI reply
if (typeof data?.reply === 'string') {
  setMessages((prev) => [
    ...prev,
    { role: 'assistant', text: data.reply },
  ]);

  speak(data.reply); // 🔥 THIS LINE MAKES IT TALK
}

setAiReplyCount(c => {
  const next = c + 1;

  if (next === 2) {
    setShowCalmNote(true);
    setTimeout(() => setShowCalmNote(false), 9000); // 9 seconds
  }

  return next;
});


    // 2️⃣ Save working note (UI + Supabase)
    if (
      typeof data?.note === 'string' &&
      data.note.trim().length > 0 &&
      typeof userId === 'string'
    ) {
      setNotes((prev) =>
        prev.includes(data.note) ? prev : [...prev, data.note]
      );

  
    }

  } catch (error) {
    console.error('Error sending message:', error);
 } finally {
  setIsLoading(false);
  setSelectedImage(null); // ← CLEAR uploaded file after send
}

};



  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/?lang=${lang}`);
  };

  if (!checked) return null;
const isReviewer = sp.get('reviewer') === '1';

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

      <div style={notesAuthBar} className="notes-auth-mobile">
        <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
          {(['en', 'pt', 'es', 'fr'] as Lang[]).map((l) => (
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

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <button onClick={() => setVoiceOn((v) => !v)} style={linkBtn}>
  {voiceOn ? T.voiceOn : T.voiceOff}
</button>


            <span style={{ fontSize: 11, opacity: 0.7 }}>
              {voiceOn ? T.voiceTurnOff : T.voiceTurnOn}
            </span>
          </div>

          {userEmail ? (
            <>
              <button onClick={handleSignOut} style={signOutBtn} className="auth-btn-mobile">
                {T.signout}
              </button>

              <button
                onClick={handleDelete}
                style={{ ...signOutBtn, background: '#6b7280' }}
                className="auth-btn-mobile"
              >
                {T.delete}
              </button>
            </>
          ) : (
            <button onClick={() => router.push(`/sign-in?lang=${lang}`)} style={signInBtn}>
              {T.signin}
            </button>
          )}
        </div>
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

    <button
      style={primaryBtn}
      onClick={() => {
        setPhase('profile');

        const welcome =
          lang === 'pt'
            ? (name ? `Bem-vindo de volta ${name}. Como posso te ajudar hoje?` : `Bem-vindo ao Neuronaut. Como posso te ajudar hoje?`)
          : lang === 'es'
            ? (name ? `Bienvenido de nuevo ${name}. ¿Cómo puedo ayudarte hoy?` : `Bienvenido a Neuronaut. ¿Cómo puedo ayudarte hoy?`)
          : lang === 'fr'
            ? (name ? `Bon retour ${name}. Comment puis-je vous aider aujourd’hui ?` : `Bienvenue sur Neuronaut. Comment puis-je vous aider aujourd’hui ?`)
          : (name ? `Welcome back ${name}. How can I help you today?` : `Welcome to Neuronaut. How can I help you today?`);

        speak(welcome);
      }}
    >
      {T.confirmBtn}
    </button>
  </div>
)}


      {phase === 'profile' && (
        <div style={questionBox}>
          <div style={question} className="question-text-mobile">
            {T.nameTitle}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={T.namePlaceholder}
            style={nameInput}
          />

          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Your country"
            style={{ ...nameInput, marginTop: 8 }}
          />

          <div style={{ marginTop: 12 }}>
            <button
              style={pronoun === 'neutral' ? optBtnActive : optBtn}
              onClick={() => setPronoun('neutral')}
            >
              {T.pronounNeutral}
            </button>

            <button style={pronoun === 'they' ? optBtnActive : optBtn} onClick={() => setPronoun('they')}>
              {T.pronounThey}
            </button>

            <button style={pronoun === 'he' ? optBtnActive : optBtn} onClick={() => setPronoun('he')}>
              {T.pronounHe}
            </button>

            <button style={pronoun === 'she' ? optBtnActive : optBtn} onClick={() => setPronoun('she')}>
              {T.pronounShe}
            </button>
          </div>

          <button
            style={{
              ...primaryBtn,
              marginTop: 16,
              opacity: !name || !pronoun || !hasAcceptedTerms ? 0.5 : 1,
              cursor: !name || !pronoun || !hasAcceptedTerms ? 'not-allowed' : 'pointer',
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
              <div style={question} className="question-text-mobile">
                {T.q1}
              </div>

              <button style={optBtn} onClick={() => { setReason('work'); setStep(2); }}>
                {T.q1_work}
              </button>

              <button style={optBtn} onClick={() => { setReason('finance'); setStep(2); }}>
                {T.q1_finance}
              </button>

              <button style={optBtn} onClick={() => { setReason('future'); setStep(2); }}>
                {T.q1_future}
              </button>
            </>
          )}

          {step === 2 && reason && (
            <>
              <div style={question} className="question-text-mobile">
                {T[`q2_${reason}` as keyof typeof T]}
              </div>

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

              <div style={question} className="question-text-mobile">
                {T.q3}
              </div>

              <button
                style={primaryBtn}
                onClick={() => {
                  const intro =
                    reason === 'work'
                      ? T.intro_work.replace('{name}', name)
                      : reason === 'finance'
                      ? T.intro_finance.replace('{name}', name)
                      : T.intro_future.replace('{name}', name)

                  setMessages([{ role: 'assistant', text: intro }])
                  speak(intro)
                  setPhase('chat')
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
          {/* ================= MESSAGES ================= */}
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
                <em>{T.typing}</em>
              </div>
            )}
          </div>

          {/* ================= INPUT BAR ================= */}
          <div style={chatBar}>
            <div className="chat-controls">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                style={{ marginBottom: 8 }}
              />

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
                disabled={isLoading || (!inputValue.trim() && !selectedImage)}
                style={{
                  ...primaryBtn,
                  width: '100%',
                  marginTop: 8,
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {T.send}
              </button>
            </div>
          </div>

          {/* ================= NOTES ================= */}
          <div
            style={{
              position: 'fixed',
              left: '38%',
              top: 120,
              width: 280,
              maxHeight: 320,
              overflowY: 'auto',
              borderRadius: 18,
              background: '#F3F4FF',
              border: '1px solid #D6D9FF',
              color: '#2B2E5F',
              padding: 16,
              boxShadow: '0 20px 60px rgba(120,130,255,0.35)',
              zIndex: 5,
            }}
          >
            <div
              onClick={() => setNotesOpen((v) => !v)}
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

            {notesOpen && (
              <>
                {notes.length === 0 ? (
                  <span style={{ color: '#141a33', opacity: 0.9 }}>{T.notesEmpty}</span>
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

          {/* ================= CALM NOTE ================= */}
          {showCalmNote && (
            <div
              className="calm-note"
              style={{
                position: 'fixed',
                left: '38%',
                top: notesOpen ? 360 : 320,
                width: 280,
                borderRadius: 14,
                background: 'rgba(15,21,51,0.95)',
                border: '1px solid rgba(122,162,255,0.35)',
                color: '#E5ECFF',
                padding: 14,
                boxShadow: '0 14px 40px rgba(92,124,250,0.35)',
                zIndex: 5,
              }}
            >
              {T.calmNote}
            </div>
          )}
        </div>
      )}
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

const aiOrb = {
  width: 200,
  height: 200,
  borderRadius: '50%',
  backgroundImage: "url('/neuronaut.people.png')",
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  filter: 'brightness(1.05) contrast(0.98) saturate(0.95)',
  boxShadow: '0 0 40px rgba(120,140,255,0.25), inset 0 0 1px rgba(255,255,255,0.06)',

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
  bottom: 80,
  left: 48,
  maxWidth: 520,
  zIndex: 3,
  background: '#EEF3FF',
  border: '1px solid rgba(92,124,250,0.45)',
  borderRadius: 18,
  padding: 20,
  boxShadow: '0 14px 40px rgba(92,124,250,0.25)',
  color: '#1E2A5A',
};

const question = {
  marginBottom: 14,
  fontSize: 15,
  color: '#1E2A5A',
  fontWeight: 600,
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
  background: '#7aa2ff',
  color: '#000',
  fontWeight: 700,
  border: '2px solid #5c7cfa',
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

  fontSize: 16,   // ✅ ADD THIS
};


const pulse = {
  animation: 'pulse 3.2s ease-in-out infinite',
};

const calmNote: React.CSSProperties = {
  position: 'absolute',
  top: 180,
  left: 10,
  maxWidth: 360,
  color: '#8FA6FF',
  fontSize: 18,
  lineHeight: 1.55,
  fontWeight: 500,
  opacity: 0.9,
  textShadow: '0 0 18px rgba(120,160,255,0.35)',
  zIndex: 2,
  pointerEvents: 'none',
 };
   
