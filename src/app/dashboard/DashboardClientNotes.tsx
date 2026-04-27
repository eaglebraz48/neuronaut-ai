'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DisclaimerModal from '@/components/DisclaimerModal';
import { onForegroundMessage } from '@/lib/push';
import { requestNotificationPermission } from '@/lib/push';
import { getToken } from 'firebase/messaging';
import { getMessagingSafe } from '@/lib/firebase';



let voiceCooldown = false;

/* ================= TYPES ================= */

type Lang = 'en' | 'es' | 'pt' | 'fr';
type Phase = 'confirming' | 'profile' | 'guided' | 'chat';
type Reason = 'work' | 'finance' | 'future' | 'skills' | 'talk' | 'other' | null;

type Pronoun = 'neutral' | 'they' | 'he' | 'she' | null;

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

type CopySchema = {

qMood: string;
  voiceOn: string;
  voiceOff: string;
  voiceTurnOn: string;
  voiceTurnOff: string;
voiceTip: string;
  listening: string;
  back: string;
  guest: string;
  signin: string;
  signout: string;
  delete: string;

  confirmTitle: string;
  confirmBtn: string;

notifyTitle: string;
notifyBody: string;
notifyAllow: string;
notifyLater: string;

  nameTitle: string;
  namePlaceholder: string;

  pronounNeutral: string;
  pronounThey: string;
  pronounHe: string;
  pronounShe: string;

  startTalking: string;
  send: string;
  typing: string;

moodSelected: (mood: string) => string;
alertChoosePicture: string;
alertChooseReason: string;

dissatisfied: string;
neutral: string;
hopeful: string;
thriving: string;

reason_work: string;
reason_finance: string;
reason_future: string;
reason_skills: string;
reason_talk: string;

compareOrAsk: string;

notesTitle: string;
  notesEmpty: string;

  q1: string;
  q1_work: string;
  q1_finance: string;
  q1_future: string;
  q1_skills: string;
  q1_talk: string;
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
voiceTip: '🔊 Voice is ON. You can turn it off anytime.',

    listening: 'Agent AI · Listening',
    back: 'Back to start',
    guest: 'Guest mode',
    signin: 'Sign in',
    signout: 'Sign out',
    delete: 'Delete account',

    confirmTitle: 'Welcome',
    confirmBtn: 'Enter',

notifyTitle: 'Stay informed',
notifyBody: 'Get notified when your Neuronaut analysis is ready.',
notifyAllow: 'Allow notifications',
notifyLater: 'Not now',

    nameTitle: 'How should I address you?',
    namePlaceholder: 'Your name',


    pronounNeutral: 'Use neutral language',
    pronounThey: 'They / them',
    pronounHe: 'He / him',
    pronounShe: 'She / her',

dissatisfied: "Dissatisfied",
neutral: "Neutral",
hopeful: "Hopeful",
thriving: "Thriving",

reason_work: 'work',
reason_finance: 'finances',
reason_future: 'future',
reason_skills: 'skills',
reason_talk: 'conversation',

compareOrAsk: 'Want to compare or ask something?',

    startTalking: 'Start typing',
    send: 'Send',
    typing: 'typing…',
moodSelected: (mood) => `You selected ${mood}. Tell me what is happening.`,
alertChoosePicture: "Choose a picture first.",
alertChooseReason: "Now choose the reason (work, finances, etc).",
    notesTitle: 'Working Notes',
    notesEmpty: '(waiting for conversation…)',

    q1: 'What do you want help with today?',
qMood: 'Which picture feels closest to your current situation?',
    q1_work: 'Work or job',
    q1_finance: 'Money or finances',
    q1_future: 'Future direction',
    q1_skills: 'Skills',
    q1_talk: 'Talk freely',
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
voiceTip: '🔊 A voz está ligada. Você pode desligar quando quiser.',

    listening: 'Agente AI · Ouvindo',
    back: 'Voltar ao início',
    guest: 'Modo convidado',
    signin: 'Entrar',
    signout: 'Sair',
    delete: 'Excluir conta',

    confirmTitle: 'Bem-vindo',
    confirmBtn: 'Entrar',

notifyTitle: 'Fique por dentro',
notifyBody: 'Receba notificações quando sua análise estiver pronta.',
notifyAllow: 'Permitir notificações',
notifyLater: 'Agora não',

    nameTitle: 'Como devo te chamar?',
    namePlaceholder: 'Seu nome',

    pronounNeutral: 'Linguagem neutra',
    pronounThey: 'They / them',
    pronounHe: 'Ele / dele',
    pronounShe: 'Ela / dela',

dissatisfied: "Insatisfeito",
neutral: "Neutro",
hopeful: "Esperançoso",
thriving: "Prosperando",

reason_work: 'trabalho',
reason_finance: 'finanças',
reason_future: 'futuro',
reason_skills: 'habilidades',
reason_talk: 'conversa',

compareOrAsk: 'Quer comparar algo ou tirar uma dúvida?',

    startTalking: 'Comece a digitar',
    send: 'Enviar',
    typing: 'digitando…',
moodSelected: (mood) => `Você escolheu ${mood}. Me conta o que está acontecendo.`,
alertChoosePicture: "Escolha uma imagem primeiro.",
alertChooseReason: "Agora escolha o motivo (trabalho, finanças, etc).",
    notesTitle: 'Anotações',
    notesEmpty: '(aguardando conversa…)',

    q1: 'O que você quer resolver hoje?',
qMood: 'Qual imagem representa melhor sua situação atual?',
    q1_work: 'Trabalho',
    q1_finance: 'Dinheiro ou finanças',
    q1_future: 'Direção do futuro',
    q1_skills: 'Habilidades',
    q1_talk: 'Falar livremente',
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
voiceTip: '🔊 La voz está activada. Puedes apagarla en cualquier momento.',

    listening: 'Agente AI · Escuchando',
    back: 'Volver',
    guest: 'Empezar ahora (sin cuenta)',
    signin: 'Iniciar sesión',
    signout: 'Cerrar sesión',
    delete: 'Eliminar cuenta',

    confirmTitle: 'Bienvenido',
    confirmBtn: 'Entrar',

notifyTitle: 'Mantente informado',
notifyBody: 'Recibe notificaciones cuando tu análisis esté listo.',
notifyAllow: 'Permitir notificaciones',
notifyLater: 'Ahora no',

    nameTitle: '¿Cómo te llamo?',
    namePlaceholder: 'Tu nombre',

    pronounNeutral: 'Neutral',
    pronounThey: 'They / them',
    pronounHe: 'Él',
    pronounShe: 'Ella',

dissatisfied: "Insatisfecho",
neutral: "Neutral",
hopeful: "Esperanzado",
thriving: "Prosperando",

reason_work: 'trabajo',
reason_finance: 'finanzas',
reason_future: 'futuro',
reason_skills: 'habilidades',
reason_talk: 'conversación',

compareOrAsk: '¿Quieres comparar algo o hacer una pregunta?',


    startTalking: 'Empieza a escribir',
moodSelected: (mood) => `Elegiste ${mood}. Cuéntame qué está pasando.`,
    send: 'Enviar',
    typing: 'escribiendo…',
alertChoosePicture: "Primero elige una imagen.",
alertChooseReason: "Ahora elige el motivo (trabajo, finanzas, etc).",
    notesTitle: 'Notas',
    notesEmpty: '(esperando conversación…)',

    q1: '¿Qué tienes en mente hoy?',
qMood: '¿Qué imagen se acerca más a tu situación actual?',
    q1_work: 'Trabajo',
    q1_finance: 'Dinero',
    q1_future: 'Mi futuro',
    q1_skills: 'Habilidades',
    q1_talk: 'Hablar libremente',
    q1_other: 'Otra cosa',

    q2_work: '¿Cómo te sientes con el trabajo?',
    q2_other: 'Cuéntame. Te escucho.',
    q2_work_opts: ['Puedo perderlo','Ya lo perdí','Estancado','Estresado'],

    q2_finance: '¿Y el dinero?',
    q2_finance_opts: ['Muy justo','Atrasado','Estable pero preocupado','Inestable'],

    q2_future: '¿Tu camino se siente claro?',
    q2_future_opts: ['Nada claro','Confuso','Ideas sin plan','Bastante claro'],

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
voiceTip: '🔊 La voix est activée. Vous pouvez la désactiver à tout moment.',

    listening: 'Agent AI · À l’écoute',
    back: 'Retour',
    guest: 'Commencer maintenant (sans compte)',
    signin: 'Connexion',
    signout: 'Déconnexion',
    delete: 'Supprimer le compte',

    confirmTitle: 'Bienvenue',
    confirmBtn: 'Entrer',

notifyTitle: 'Restez informé',
notifyBody: 'Recevez des notifications quand votre analyse est prête.',
notifyAllow: 'Autoriser les notifications',
notifyLater: 'Pas maintenant',

    nameTitle: 'Comment dois-je t’appeler ?',
    namePlaceholder: 'Ton prénom',

    pronounNeutral: 'Neutre',
    pronounThey: 'They / them',
    pronounHe: 'Il',
    pronounShe: 'Elle',

dissatisfied: "Insatisfait",
neutral: "Neutre",
hopeful: "Plein d’espoir",
thriving: "Épanoui",

reason_work: 'travail',
reason_finance: 'finances',
reason_future: 'avenir',
reason_skills: 'compétences',
reason_talk: 'conversation',

compareOrAsk: 'Voulez-vous comparer quelque chose ou poser une question ?',


    startTalking: 'Commence à écrire',
moodSelected: (mood) => `Vous avez choisi ${mood}. Dites-moi ce qui se passe.`,
    send: 'Envoyer',
    typing: 'écrit…',
alertChoosePicture: "Choisissez une image d'abord.",
alertChooseReason: "Choisissez maintenant la raison (travail, finances, etc).",
    notesTitle: 'Notes',
    notesEmpty: '(en attente…)',

    q1: 'Qu’as-tu en tête aujourd’hui ?',
qMood: 'Quelle image correspond le mieux à votre situation actuelle ?',
    q1_work: 'Travail',
    q1_finance: 'Argent',
    q1_future: 'Mon avenir',
    q1_skills: 'Compétences',
    q1_talk: 'Parler librement',
    q1_other: 'Autre chose',

    q2_work: 'Comment te sens-tu au travail ?',
    q2_other: 'Dis-moi. Je t’écoute.',
    q2_work_opts: ['Risque de le perdre','Déjà perdu','Bloqué','Stressé'],

    q2_finance: 'Et côté argent ?',
    q2_finance_opts: ['Très serré','Retards de paiement','Stable mais inquiet','Instable'],

    q2_future: 'Ton chemin est clair ?',
    q2_future_opts: ['Pas clair','Confus','Idées sans plan','Plutôt clair'],

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
const isGuestMode = () =>
  localStorage.getItem('neuronaut_guest') === '1' ||
  sp.get('guest') === '1';
  const T = COPY[lang];

const [notifAsked, setNotifAsked] = useState(false);
const [showNotifModal, setShowNotifModal] = useState(false);
const [showIOSFix, setShowIOSFix] = useState(false);
const [showVoiceTip, setShowVoiceTip] = useState(false);

  const [phase, setPhase] = useState<Phase>('confirming');
  const [reason, setReason] = useState<Reason>(null);
const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [checked, setChecked] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
const [skipGuidedAfterProfile, setSkipGuidedAfterProfile] = useState(false);
const [name, setName] = useState('');

const isStandalone =
  typeof window !== 'undefined' &&
  window.matchMedia('(display-mode: standalone)').matches;


const cleanName =
  typeof name === 'string' && name.trim().length > 0
    ? name
        .trim()
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    : '';

const displayName =
  cleanName ||
  (typeof userEmail === 'string'
    ? userEmail.split('@')[0]
    : '') ||
  'there';
const [country, setCountry] = useState('');
const [voiceOn, setVoiceOn] = useState(true);

const [voiceUses, setVoiceUses] = useState(0);
const [aiSpeaking, setAiSpeaking] = useState(false);
const [waveTick, setWaveTick] = useState(0);

const isSigned = !!userId;

const FREE_GUEST_LIMIT = 3;
const FREE_USER_LIMIT = 6;

const limit = isSigned ? FREE_USER_LIMIT : FREE_GUEST_LIMIT;
const canUsePremiumVoice = voiceUses < limit;


/* ================= VOICE ================= */
/* ================= VOICE (ELEVENLABS) ================= */
const speak = async (text: string) => {
  if (!voiceOn) return;

  // LIMIT REACHED → force Google voice
  if (!canUsePremiumVoice) {
const utter = new SpeechSynthesisUtterance(text);
utter.lang = lang;

setAiSpeaking(true);
utter.onend = () => setAiSpeaking(false);

speechSynthesis.speak(utter);
return;
}
  try {
    const res = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error('Eleven failed');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

const audio = new Audio(url);

setAiSpeaking(true);

audio.onended = () => {
  setAiSpeaking(false);
};

await audio.play();

    // count only successful Eleven usage
    setVoiceUses(v => v + 1);

  } catch {
    // fallback ONLY if Eleven fails
   const utter = new SpeechSynthesisUtterance(text);
utter.lang = lang;

setAiSpeaking(true);
utter.onend = () => setAiSpeaking(false);

speechSynthesis.speak(utter);
  }
};

  const [pronoun, setPronoun] = useState<Pronoun>(null);
  const [inputValue, setInputValue] = useState('');
const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);

const moods = [
  { id: "dissatisfied", src: "/moods/mood_dissatisfied.png", label: "Dissatisfied" },
  { id: "neutral", src: "/moods/mood_neutral.png", label: "Neutral" },
  { id: "hopeful", src: "/moods/mood_hopeful.png", label: "Hopeful" },
  { id: "thriving", src: "/moods/mood_thriving.png", label: "Thriving" },
];


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
     
  const guestId = generateGuestId();

  try {
    // 🚫 desativado para evitar erro 400
  } catch (err) {
    console.error('Error logging guest acceptance:', err);
  } finally {
    setHasAcceptedTerms(true);
    setShowDisclaimer(false);
  }
}
  };const handleDelete = async () => {
  const isReviewer = sp.get('reviewer') === '1';
  if (isReviewer) {
    alert('Review mode — do not delete this account.');
    return;
  }
  if (!confirm('Delete account and all stored data?')) return;

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch('/api/delete-account', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();

  if (json.ok) {
    await supabase.auth.signOut();
    router.push('/?lang=' + lang);
  }
};

const syncFCMToken = async (uid: string, email?: string | null) => {
  try {
    const messaging = getMessagingSafe();
    if (!messaging || !('serviceWorker' in navigator)) return;

    if (Notification.permission !== 'granted') return;

    const swReg = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) return;

    await supabase.from('profiles').upsert(
      {
        user_id: uid,
        email: email ?? null,
        fcm_token: token,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  } catch (err) {
    console.error('FCM ERROR:', err);
  }
};


// First useEffect - Check initial session on page load

useEffect(() => {
  if (showVoiceTip) {
    const t = setTimeout(() => setShowVoiceTip(false), 15000);
    return () => clearTimeout(t);
  }
}, [showVoiceTip]);



useEffect(() => {

const initializeUser = async () => {
setChecked(false); // 🔥 reset loading state
  try {

    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }

    }

    await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

if (user) {
  const uid = user.id;
  const email = user.email ?? null;


  setUserId(uid);
  setUserEmail(email);

  // 🔥 THIS is the missing piece
 let hasAccepted = false;

try {
  hasAccepted = await checkTermsAcceptance(uid);
} catch (err) {
  console.error('Terms check failed:', err);
}

  setHasAcceptedTerms(hasAccepted);
  setShowDisclaimer(!hasAccepted);
  setShowVoiceTip(true);

  // 👇 keep everything else BELOW this


const { data: existingProfile } = await supabase
  .from('profiles')
  .select('user_id')
  .eq('user_id', uid)
  .maybeSingle();

if (!existingProfile) {
  await supabase.from('profiles').insert({
    user_id: uid,
    email,
  
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  });
}
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, country, pronoun, onboarding_completed, fcm_token')
        .eq('user_id', uid)
        .maybeSingle();

      if (profile) {
        setName(profile.name || '');
        setCountry(profile.country || '');
        setPronoun(profile.pronoun || null);
      } else {
        setName(''); setCountry(''); setPronoun(null);
      }

     setIsFirstTimeUser(false);
    setPhase('guided');


      const { data: latestRecap } = await supabase
        .from('session_recaps').select('recap').eq('user_id', uid)
        .order('created_at', { ascending: false }).limit(1).single();

      const { data: existing } = await supabase
        .from('working_notes').select('id').eq('user_id', uid)
        .eq('source', 'login').order('created_at', { ascending: false }).limit(1).single();

      if (!existing && latestRecap?.recap) {
        await supabase.from('working_notes').insert({
          user_id: uid,
          content: `Session restarted. Last session summary: ${latestRecap.recap}`,
          source: 'login',
          created_at: new Date().toISOString(),
        });
      }

      const { data: notesData } = await supabase
        .from('working_notes').select('content').eq('user_id', uid)
        .order('created_at', { ascending: false }).limit(6);

      if (notesData && notesData.length > 0) {
        setNotes(notesData.map(n => n.content));
      }

      // 🔥 ALWAYS finish loading FIRST (prevents freeze)
setChecked(true);



// 🔥 FCM — fire and forget, no await, no blocking
(async () => {
  try {
    const permission = typeof Notification !== 'undefined'
      ? Notification.permission : 'default';

    if (permission === 'granted') {
      const messaging = getMessagingSafe();
      if (messaging && 'serviceWorker' in navigator) {
        const swReg = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });
        if (token) {
          await supabase.from('profiles').upsert({
  user_id: uid,
  fcm_token: token,
  updated_at: new Date().toISOString(),
}, { onConflict: 'user_id' });
        }
      }
    } else if (permission === 'default' && !notifAsked) {
      setShowNotifModal(true);
      if (isStandalone) setShowIOSFix(true);
    }
  } catch (err) {
    console.error('FCM init error:', err);
  }
})();

return;
}

// ================= GUEST FLOW =================
if (isGuestMode()) {
  setIsGuest(true);
  setPhase('guided');
  setStep(1);

  setShowVoiceTip(true);
  setShowDisclaimer(true);
  setHasAcceptedTerms(false);
  setChecked(true);
  return;
}

// ================= FALLBACK =================
setPhase('guided');
setShowVoiceTip(true);
setShowDisclaimer(true);
setHasAcceptedTerms(false);
setChecked(true);

} catch (error) {
  console.error('Error initializing user:', error);
  setPhase('profile');
  setChecked(true);
}
};

initializeUser();

}, []);

/* ================= WELCOME VOICE ================= */


// Second useEffect - Listen for auth state changes (magic link, sign in, sign out)
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (isGuestMode()) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const uid = session.user.id;
        const email = session.user.email ?? null;

        setUserId(uid);
        setUserEmail(email);
        setIsGuest(false);

        const hasAccepted = await checkTermsAcceptance(uid);
        setHasAcceptedTerms(hasAccepted);
        setShowDisclaimer(!hasAccepted);

        const notesResult = await supabase
          .from('working_notes')
          .select('content')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(6);

        if (notesResult.data) {
          setNotes(notesResult.data.map((n: { content: string }) => n.content));
        }

        setPhase('confirming');
        setShowVoiceTip(true);
        setChecked(true);

// Show notification prompt immediately on sign-in
const currentPermission = typeof Notification !== 'undefined'
  ? Notification.permission : 'default';
if (currentPermission === 'default') {
  setShowNotifModal(true);
  if (isStandalone) setShowIOSFix(true);
}

// FCM — fire and forget
(async () => {
  try {
    const permission = typeof Notification !== 'undefined'
      ? Notification.permission : 'default';
    if (permission === 'granted') {
      const messaging = getMessagingSafe();
      if (messaging && 'serviceWorker' in navigator) {
        const swReg = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });
        if (token) {
      await supabase.from('profiles').upsert({
  user_id: uid,
  fcm_token: token,
  updated_at: new Date().toISOString(),
}, { onConflict: 'user_id' });
        }
      }
    }
  } catch (err) {
    console.error('FCM init error:', err);
  }
})();

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


useEffect(() => {
  const unsub = onForegroundMessage((payload) => {
    alert(
      payload.notification?.title + ' - ' +
      payload.notification?.body
    );
  });

  return () => {
    if (unsub) unsub();
  };
}, []);

/* ================= AUTO SAVE PROFILE ================= */
useEffect(() => {
  if (!aiSpeaking) return;

  const interval = setInterval(() => {
    setWaveTick(v => v + 1);
  }, 120); // speed of vibration

  return () => clearInterval(interval);
}, [aiSpeaking]);



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
await saveWorkingNote(userId, data.note);

  
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

if (!checked) {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#7aa2ff",
      fontSize: 14
    }}>
      Loading Neuronaut…
    </div>
  );
}
const isReviewer = sp.get('reviewer') === '1';

  return (
  <>
{showDisclaimer && (
  <DisclaimerModal
    onAccept={handleDisclaimerAccept}
  />
)}


    {showNotifModal && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  }}>
    <div style={{  
      background: '#0f1533', borderRadius: 20, padding: 32, maxWidth: 320,
      border: '1px solid rgba(122,162,255,0.3)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔔</div>

      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#e5ecff' }}>
        {T.notifyTitle}
      </div>

      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
        {T.notifyBody}
      </div>

      <button
        onClick={async () => {
  setShowNotifModal(false);
  setNotifAsked(true);

  try {
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') return;

  const swReg = await navigator.serviceWorker.ready;
  const messaging = getMessagingSafe();

  if (!messaging) return;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });

  if (token) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
  await supabase
  .from('profiles')
  .update({
    fcm_token: token,
    updated_at: new Date().toISOString(),
  })
  .eq('user_id', user.id);
    }
  }
} catch (err) {
  console.error('Token error:', err);
}
}}
        style={{
          width: '100%', padding: '12px', borderRadius: 12,
          background: '#7aa2ff', color: '#000', border: 'none',
          fontWeight: 700, cursor: 'pointer', fontSize: 15, marginBottom: 10,
        }}
      >
        {T.notifyAllow}
      </button>

      <button
        onClick={() => {
          setShowNotifModal(false);
        }}

        style={{
          width: '100%', padding: '10px', borderRadius: 12,
          background: 'transparent', color: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: 13,
        }}
      >
        {T.notifyLater}
      </button>
    </div>
  </div>
)}

{showIOSFix && (
  <div style={{
    position: 'fixed',
    bottom: 20,
    left: 20,
    right: 20,
    background: '#111',
    border: '1px solid rgba(122,162,255,0.4)',
    borderRadius: 12,
    padding: 14,
    zIndex: 999,
    fontSize: 13,
    color: '#fff',
    textAlign: 'center'
  }}>
    Notifications need a quick fix on iPhone.  
    Please reinstall the app from Safari to enable them.

    <div
      onClick={() => setShowIOSFix(false)}
      style={{
        marginTop: 8,
        fontSize: 12,
        opacity: 0.6,
        cursor: 'pointer'
      }}
    >
      Got it
    </div>
  </div>
)}

{showVoiceTip && voiceOn && (
  <div
    style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(255,255,255,0.9)',
      color: '#0f1533',
      border: '1px solid rgba(122,162,255,0.4)',
      backdropFilter: 'blur(12px)',
      borderRadius: 12,
      padding: '10px 16px',
      fontSize: 13,
      fontWeight: 600,
      zIndex: 999,
      boxShadow: '0 0 20px rgba(122,162,255,0.6)',
    }}
  >
    🔊 {T.voiceTip}
  </div>
)}

)


    <div style={page}>


      <div className="ghost-symbol" style={ghostSymbol} />

    <div style={aiOrbWrap}>
  <div style={{ ...aiOrb, ...pulse }} />

  {/* 🔊 AI VOICE WAVE */}
{/* 🔊 VOICE WAVE — FIXED SIDE */}
<div
  style={{
    position: 'fixed',

    left: isMobile ? '75%' : 300,
    transform: isMobile ? 'translateX(-50%)' : 'none',

    top: isMobile ? 50 : 160,

    display: 'flex',
    gap: 4,
    alignItems: 'center',
    height: 24,

    zIndex: 4,
  }}
>
  {Array.from({ length: 12 }).map((_, i) => (
    <div
      key={i}
      style={{
        width: 4,
       height: aiSpeaking
  ? 6 + Math.random() * 20
  : 4,
        borderRadius: 8,
        background:
          'linear-gradient(180deg,#7aa2ff,#8b5cf6,#4cc9f0)',
        transition: 'height 0.15s ease',
      }}
    />
  ))}
</div>
</div>
      <div style={notesAuthBar} className="notes-auth-mobile">


  


  {/* LANG BUTTONS */}
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
  </div>

  {/* EDIT PROFILE BUTTON */}
  {userEmail && (
    <button
      onClick={() => {
        setStep(1);
        setReason(null);
      setPhase('guided');
      }}
      style={{
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        border: '1px solid #fecaca',
        background: '#fee2e2',
        color: '#7f1d1d',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      Edit
    </button>
  )}

  {/* VOICE */}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <button onClick={() => setVoiceOn((v) => !v)} style={linkBtn}>
      {voiceOn ? T.voiceOn : T.voiceOff}
    </button>

    <span style={{ fontSize: 11, opacity: 0.7 }}>
      {voiceOn ? T.voiceTurnOff : T.voiceTurnOn}
    </span>
  </div>

  {/* AUTH BUTTONS */}
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
     onClick={async () => {

if (isFirstTimeUser) {
  setPhase('guided');
  setStep(1);
  return;
}

setPhase('guided');
setStep(1);    


 // PHASE GUIDED  -RETURNING USERS → CHAT


const welcome =
  lang === 'pt'
    ? `Bem-vindo de volta ${displayName}.`
    : lang === 'es'
    ? `Bienvenido de nuevo ${displayName}.`
    : lang === 'fr'
    ? `Bon retour ${displayName}.`
    : `Welcome back ${displayName}.`;

  setMessages([
    { role: 'assistant', text: welcome }
  ]);

  speak(welcome);
}}
    >
      {T.confirmBtn}
    </button>
  </div>
)}


      {false && (
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
        onClick={async () => {
  console.log('SAVE ATTEMPT:', { userId, name, cleanName }); // ← ADD HERE

  

// SAVE PROFILE + FCM (FINAL)
if (userId) {
  (async () => {
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

if (existing) {
  await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
} else {
  await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      email: userEmail ?? null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });
}
      // FCM
      const messaging = getMessagingSafe();

      if (messaging && 'serviceWorker' in navigator) {
        if (Notification.permission === 'granted') {
          const swReg = await navigator.serviceWorker.ready;

          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: swReg,
          });

          if (token) {
            await supabase
              .from('profiles')
              .update({
                fcm_token: token,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);

            console.log('✅ FCM saved');
          }
        }
      }

    } catch (err) {
      console.error('❌ SAVE FLOW ERROR:', err);
    }
  })();
}

  // 🔥 INSTANT LOCAL UPDATE (NO LOGOUT NEEDED)
  setName(name.trim());

  // ❤️ HUMAN ACKNOWLEDGEMENT
  const confirmName =
    lang === 'pt'
      ? `Entendido — vou te chamar de ${name.trim()} agora.`
      : lang === 'es'
      ? `Perfecto — ahora te llamaré ${name.trim()}.`
      : lang === 'fr'
      ? `D’accord — je vais t’appeler ${name.trim()} maintenant.`
      : `Got it — I’ll call you ${name.trim()} from now on.`;

 setMessages([{ role: 'assistant', text: confirmName }]);
speak(confirmName);
setPhase('chat');

// 🔥 FCM SAVE (NON-BLOCKING)

// Show notification modal after profile completion
setTimeout(() => {
  const permission = typeof Notification !== 'undefined'
    ? Notification.permission
    : 'default';
  if (permission !== 'denied') {
    setShowNotifModal(true);
    if (isStandalone) setShowIOSFix(true);
  }
}, 500);
}}
          >
            {T.startTalking}
          </button>
        </div>
      )}



      {phase === 'guided' && (
        <div style={questionBox}>
     {step === 1 && (
  <div
    style={{
      position: 'relative',
      width: 420,
      height: 320,
      margin: '0 auto',
    }}
  >

    {/* ================= MOOD + REASON SELECTOR ================= */}

<div
  style={{
    position: 'relative',
    width: 420,
    height: 320,
    margin: '0 auto',
  }}
>

{/* MOODS */}
<div style={{ marginBottom: 20 }}>
<div style={{ marginBottom: 10, fontWeight: 600 }}>
  {T.qMood}
</div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    {moods.map((m) => (
      <button
        key={m.id}
        style={{
          ...moodBtn,
          outline: selectedMood === m.label ? "3px solid #7aa2ff" : "none"
        }}

        onMouseEnter={(e) => {
          const img = e.currentTarget.querySelector("img");
          if (img) img.style.opacity = "0.85";
        }}

        onMouseLeave={(e) => {
          const img = e.currentTarget.querySelector("img");
          if (img) img.style.opacity = "0.38";
        }}

       onClick={() => {
  setSelectedMood(m.id);

  if (!reason) {
  alert(T.alertChooseReason);
  return;
}

const moodMap = {
  dissatisfied: T.dissatisfied,
  neutral: T.neutral,
  hopeful: T.hopeful,
  thriving: T.thriving,
};

const reasonMap = {
  work: T.reason_work,
  finance: T.reason_finance,
  future: T.reason_future,
  skills: T.reason_skills,
  talk: T.reason_talk,
};

const moodText = moodMap[m.id as keyof typeof moodMap];
const reasonText = reasonMap[reason as keyof typeof reasonMap];
const intro = `${moodText} • ${reasonText}. ${T.compareOrAsk}`;

setMessages([{ role: "assistant", text: intro }]);
speak(intro);
setPhase("chat");



  setMessages([{ role: "assistant", text: intro }]);
  speak(intro);
  setPhase("chat");
}}
      >
        <img src={m.src} style={moodImg} />
      </button>
    ))}
  </div>
</div>

{/* AI CORE */}
<div
  style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 110,
    height: 110,
    borderRadius: '50%',
    background: 'rgba(122,162,255,0.25)',
    border: '2px solid rgba(122,162,255,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    boxShadow: '0 0 25px rgba(122,162,255,0.5)',
  }}
>


AI Core
</div>

{/* FUTURE */}
<button
  style={{
    ...orbitBtn,
    left: '50%',
    top: 18,
    outline: reason === "future" ? "3px solid #7aa2ff" : "none"
  }}

  onClick={() => {

    setReason('future');

   if (!selectedMood) {
  alert(T.alertChoosePicture);
  return;
}
  const starter = T.q1_future;

    setMessages([{ role: 'assistant', text: starter }]);
    speak(starter);
    setPhase('chat');
  }}
>
{T.q1_future}
</button>


{/* WORK */}
<button
  style={{
    ...orbitBtn,
    left: '10%',
    top: 110,
    outline: reason === "work" ? "3px solid #7aa2ff" : "none"
  }}
  onClick={() => {

    setReason('work');

 alert(T.alertChoosePicture);

   const starter = T.q1_work;

    setMessages([{ role: 'assistant', text: starter }]);
    speak(starter);
    setPhase('chat');
  }}
>
{T.q1_work}
</button>


{/* FINANCE */}
<button
  style={{
    ...orbitBtn,
    left: '100%',
    top: 110,
    outline: reason === "finance" ? "3px solid #7aa2ff" : "none"
  }}
  onClick={() => {

    setReason('finance');

 alert(T.alertChoosePicture);

const starter = T.q1_finance;

    setMessages([{ role: 'assistant', text: starter }]);
    speak(starter);
    setPhase('chat');
  }}
>
{T.q1_finance}
</button>


{/* SKILLS */}
<button
  style={{
    ...orbitBtn,
    left: '20%',
    top: 240,
    outline: reason === "skills" ? "3px solid #7aa2ff" : "none"
  }}
  onClick={() => {

    setReason('skills');

 alert(T.alertChoosePicture);

   const starter = T.q1_skills;

    setMessages([{ role: 'assistant', text: starter }]);
    speak(starter);
    setPhase('chat');
  }}
>
{T.q1_skills}
</button>


{/* TALK */}
<button
  style={{
    ...orbitBtn,
    left: '80%',
    top: 240,
    outline: reason === "talk" ? "3px solid #7aa2ff" : "none"
  }}
  onClick={() => {

    setReason('talk');

  alert(T.alertChoosePicture);

  const starter = T.q1_talk;

    setMessages([{ role: 'assistant', text: starter }]);
    speak(starter);
    setPhase('chat');
  }}
>
{T.q1_talk}
</button>

</div>
</div>
)}
          
          {step === 3 && (
            <>
             {!userId && (
 <div
  style={{
    color: 'rgba(255,255,255,0.95)',
    textShadow: '0 2px 10px rgba(0,0,0,0.45)',
    marginBottom: 12,
    fontWeight: 600,
  }}
>
    {T.grounding}
  </div>
)}

              <div style={question} className="question-text-mobile">
                {T.q3}
              </div>

              <button
                style={primaryBtn}
                onClick={async () => {
                  // SAVE PROFILE — get fresh session first
const { data: { user: freshUser } } = await supabase.auth.getUser();
const freshUid = freshUser?.id;

if (freshUid) {
  const { error } = await supabase.from('profiles').upsert({
  user_id: freshUid,
  email: userEmail ?? null, // 👈 add this
  onboarding_completed: true,
  updated_at: new Date().toISOString(),
}, { onConflict: 'user_id' });

  if (error) console.error('Profile save error:', error);
}

                  const intro =
                    lang === 'pt'
                      ? 'Bem-vindo ao Neuronaut. Você está ouvindo uma voz… formada por muitas vidas.'
                      : lang === 'es'
                      ? 'Bienvenido a Neuronaut. Estás escuchando una voz… formada por muchas vidas.'
                      : lang === 'fr'
                      ? 'Bienvenue sur Neuronaut. Vous entendez une voix… formée par de nombreuses vies.'
                      : "Welcome to Neuronaut. You're hearing one voice… formed from many lives.";

                  setMessages([{ role: 'assistant', text: intro }]);
                  speak(intro);
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


    {/* MOOD SELECTOR */}
    {messages.length === 0 && (
      <div style={moodPanel}>
        <div style={moodTitle}>
  {T.qMood}
</div>

        <div style={moodGrid}>
          {moods.map((m) => (
            <button
              key={m.id}
              style={moodBtn}
              onClick={() => {

const moodMap = {
  dissatisfied: T.dissatisfied,
  neutral: T.neutral,
  hopeful: T.hopeful,
  thriving: T.thriving,
};

const moodText = moodMap[m.id as keyof typeof moodMap];
const intro = T.moodSelected(moodText);

                setMessages([{ role: 'assistant', text: intro }]);
                speak(intro);
              }}
            >
              <img src={m.src} style={moodImg} />
            </button>
          ))}
        </div>
      </div>
    )}




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
const isMobile =
  typeof window !== 'undefined' && window.innerWidth < 768;

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
const orbitBtn: React.CSSProperties = {
  position: 'absolute',
  transform: 'translateX(-50%)',
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid rgba(122,162,255,0.45)',
  background: '#141a33',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
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
  left: '50%',
  transform: 'translateX(-50%)',
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

  bottom: isMobile ? 24 : 80,
  left: isMobile ? 12 : 48,
  right: isMobile ? 12 : undefined,
  maxWidth: isMobile ? 'none' : 520,

  zIndex: 3,

  /* GLASS EFFECT */
  background: 'rgba(255,255,255,0.14)',
  backdropFilter: 'blur(26px) saturate(140%)',
  WebkitBackdropFilter: 'blur(26px) saturate(140%)',
  border: '1px solid rgba(255,255,255,0.28)',

  /* SHAPE + SPACING */
  borderRadius: isMobile ? 14 : 18,
  padding: isMobile ? 18 : 28,

  /* LIGHT + DEPTH */
  boxShadow:
    '0 0 80px rgba(130,160,255,0.22), 0 8px 30px rgba(40,80,220,0.25), inset 0 1px 0 rgba(255,255,255,0.35)',

  color: 'rgba(255,255,255,0.95)',
};

const question: React.CSSProperties = {
  marginBottom: 6,
  marginTop: -4, // 👈 ADD THIS LINE
  fontSize: 18,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.95)',
  textShadow: '0 2px 10px rgba(0,0,0,0.45)',
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

const moodTitle: React.CSSProperties = {
  marginBottom: 14,
  fontWeight: 600,
  opacity: 0.9,
};

const moodPanel: React.CSSProperties = {
  padding: 24,
  maxWidth: 420,
  margin: '0 auto 20px',
  textAlign: 'center',

 };
 const moodGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
};

const moodBtn: React.CSSProperties = {
  borderRadius: 16,
  overflow: 'hidden',
  border: '1px solid rgba(122,162,255,0.25)',
  background: 'transparent',
  cursor: 'pointer',
};

const moodImg: React.CSSProperties = {
  width: '100%',
  display: 'block',

  opacity: 0.38,          // ghost transparency
  filter: 'brightness(1.1) contrast(0.9) saturate(0.9)',

  transition: 'all 0.25s ease',
};

