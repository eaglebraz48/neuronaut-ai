'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Lang = 'en' | 'pt' | 'es' | 'fr';
const LANGS: readonly Lang[] = ['en', 'pt', 'es', 'fr'] as const;

const isLang = (v: string | null): v is Lang =>
  !!v && (LANGS as readonly string[]).includes(v as Lang);

const SHOW_REVIEWER_UI = false;

const L: Record<
  Lang,
  {
    title: string;
    email: string;
    code: string;
    send: string;
    verify: string;
    sent: string;
    hint: string;
    back: string;
    guest: string;
    reviewerEmail: string;
    password: string;
    signinpw: string;
magicLink: string;
  }
> = {
  en: {
    title: 'Sign in',
    email: 'Email',
    code: 'Verification code',
    send: 'Send login code',
    verify: 'Verify code',
    sent: 'Check your email for the login code.',
    hint: "Enter your email and we'll send you a login code.",
    back: '← Back to home',
    guest: 'Continue as guest',
    reviewerEmail: 'Reviewer access email',
    password: 'Password (reviewers only)',
    signinpw: 'Sign in with password',
magicLink: 'Or click the link in your email',
  },
  pt: {
    title: 'Entrar',
    email: 'E-mail',
    code: 'Código de verificação',
    send: 'Enviar código',
    verify: 'Verificar código',
    sent: 'Verifique seu e-mail para o código.',
    hint: 'Digite seu e-mail e enviaremos um código de acesso.',
    back: '← Voltar ao início',
    guest: 'Continuar como visitante',
    reviewerEmail: 'E-mail do revisor',
    password: 'Senha (apenas revisores)',
    signinpw: 'Entrar com senha',
magicLink: 'Ou clique no link no seu e-mail',
  },
  es: {
    title: 'Iniciar sesión',
    email: 'Correo',
    code: 'Código de verificación',
    send: 'Enviar código',
    verify: 'Verificar código',
    sent: 'Revisa tu correo para el código.',
    hint: 'Ingresa tu correo y enviaremos un código.',
    back: '← Volver al inicio',
    guest: 'Entrar como invitado',
    reviewerEmail: 'Correo del revisor',
    password: 'Contraseña (solo revisores)',
    signinpw: 'Entrar con contraseña',
magicLink: 'O haz clic en el enlace de tu correo',
  },
  fr: {
    title: 'Connexion',
    email: 'E-mail',
    code: 'Code de vérification',
    send: 'Envoyer le code',
    verify: 'Vérifier le code',
    sent: 'Vérifiez votre e-mail pour le code.',
    hint: 'Entrez votre e-mail et recevez un code.',
    back: '← Retour à l\'accueil',
    guest: 'Continuer en invité',
    reviewerEmail: 'E-mail du réviseur',
    password: 'Mot de passe (réviseurs uniquement)',
    signinpw: 'Se connecter avec mot de passe',
magicLink: 'Ou cliquez sur le lien dans votre e-mail',
  },
};

function PageInner() {
  const sp = useSearchParams();
  const router = useRouter();

  const rawLang = sp.get('lang');
  const lang: Lang = isLang(rawLang) ? rawLang : 'en';
  const t = L[lang];

  const [magicEmail, setMagicEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [reviewerEmail, setReviewerEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'sent'>('idle');
  const [busy, setBusy] = React.useState(false);

  async function sendCode() {
  if (!magicEmail.includes('@')) return;
  setBusy(true);

  const { error } = await supabase.auth.signInWithOtp({
    email: magicEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/dashboard?lang=${lang}`,
    },
  });

  setBusy(false);
  if (error) {
    alert(error.message);
    return;
  }
  setStatus('sent');
}

  async function verifyCode() {
    if (!code) return;
    setBusy(true);

    const { error } = await supabase.auth.verifyOtp({
      email: magicEmail,
      token: code,
      type: 'email',
    });

    setBusy(false);

    if (!error) {
      router.replace(`/dashboard?lang=${lang}`);
    }
  }

  async function reviewerLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email: reviewerEmail,
      password,
    });

    if (!error) {
      router.replace(`/dashboard?lang=${lang}&reviewer=1`);
    }
  }

  function guestLogin() {
    localStorage.setItem('neuronaut_guest', '1');
    router.replace(`/dashboard?lang=${lang}&guest=1`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#04060f]">
      <div className="w-full max-w-[360px] text-center">

        <h1 className="text-3xl font-semibold mb-4 text-white">
          {t.title}
        </h1>

        {status === 'sent' ? (
          <div className="flex flex-col gap-4">
            <p className="text-gray-300">{t.sent}</p>

            <input
              type="text"
              value={code}
              placeholder={t.code}
              onChange={(e) => setCode(e.target.value)}
              disabled={busy}
              className="w-full h-[70px] px-6 box-border rounded-[22px] bg-white text-black text-2xl md:text-xl outline-none"
            />

           <button
              onClick={verifyCode}
              disabled={busy}
              className="w-full h-[70px] px-6 box-border rounded-[22px] text-[#020617] font-bold text-[16px]"
              style={{ background: 'linear-gradient(135deg,#8fa6ff 0%,#6f88ff 100%)' }}
            >
              {t.verify}
            </button>

            <p className="text-sm text-[#38bdf8] mt-2">{t.magicLink}</p>

          </div>

        ) : (
          <div className="flex flex-col gap-4">

            <p className="text-sm text-gray-400">{t.hint}</p>

            <input
              type="email"
              value={magicEmail}
              placeholder={t.email}
              onChange={(e) => setMagicEmail(e.target.value)}
              disabled={busy}
              className="w-full h-[70px] px-6 box-border rounded-[22px] bg-white text-black text-2xl md:text-xl outline-none"
            />

            <button
              onClick={sendCode}
              disabled={busy}
              className="w-full h-[70px] px-6 box-border rounded-[22px] text-[#020617] font-bold text-[16px]"
              style={{ background: 'linear-gradient(135deg,#8fa6ff 0%,#6f88ff 100%)' }}
            >
              {t.send}
            </button>

            <div className="flex items-center my-2">
              <div className="flex-grow h-px bg-gray-700"></div>
              <span className="px-3 text-xs text-gray-400">or</span>
              <div className="flex-grow h-px bg-gray-700"></div>
            </div>

            <button
              onClick={guestLogin}
              disabled={busy}
              className="w-full py-4 rounded-[22px] border text-[#c9d4ff] text-[15px] font-semibold"
              style={{
                border: '1px solid rgba(130,160,255,0.45)',
                background: 'rgba(10,15,28,0.6)',
              }}
            >
              {t.guest}
            </button>

          </div>
        )}

        <Link
          href={`/?lang=${lang}`}
          className="block mt-6 text-sm text-blue-300 hover:text-blue-400"
        >
          {t.back}
        </Link>

      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}