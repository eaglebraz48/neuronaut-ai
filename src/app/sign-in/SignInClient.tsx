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

/*
  REVIEWER LOGIN
  stays available but invisible.
  Flip to true ONLY if you need to expose it for store review.
*/
const SHOW_REVIEWER_UI = false;

const L: Record<Lang, any> = {
  en: {
    title: 'Sign in',
    email: 'Email',
    send: 'Email me a sign-in link',
    sent: 'Check your email and tap the secure login link.',
    hint: 'Enter your email and we’ll send you a magic link to sign in.',
    back: '← Back to home',
    guest: 'Continue as guest',

    reviewerEmail: 'Reviewer access email',
    password: 'Password (reviewers only)',
    signinpw: 'Sign in with password',
  },

  /* 🇧🇷 Brazilian Portuguese (your preference) */
  pt: {
    title: 'Entrar',
    email: 'E-mail',
    send: 'Enviar link de acesso',
    sent: 'Verifique seu e-mail e toque no link seguro.',
    hint: 'Digite seu e-mail e enviaremos um link mágico para entrar.',
    back: '← Voltar ao início',
    guest: 'Continuar como visitante',

    reviewerEmail: 'E-mail do revisor',
    password: 'Senha (apenas revisores)',
    signinpw: 'Entrar com senha',
  },

  es: {
    title: 'Iniciar sesión',
    email: 'Correo',
    send: 'Envíame un enlace de acceso',
    sent: 'Revisa tu correo y toca el enlace seguro.',
    hint: 'Ingresa tu correo y te enviaremos un enlace mágico.',
    back: '← Volver al inicio',
    guest: 'Entrar como invitado',

    reviewerEmail: 'Correo del revisor',
    password: 'Contraseña (solo revisores)',
    signinpw: 'Entrar con contraseña',
  },

  fr: {
    title: 'Connexion',
    email: 'E-mail',
    send: 'M’envoyer un lien de connexion',
    sent: 'Vérifiez votre e-mail et ouvrez le lien sécurisé.',
    hint: 'Entrez votre e-mail et nous vous enverrons un lien magique.',
    back: '← Retour à l’accueil',
    guest: 'Continuer en invité',

    reviewerEmail: 'E-mail du réviseur',
    password: 'Mot de passe (réviseurs uniquement)',
    signinpw: 'Se connecter avec mot de passe',
  },
};
function PageInner() {
  const sp = useSearchParams();
  const router = useRouter();

  const rawLang = sp.get('lang');
  const lang: Lang = isLang(rawLang) ? rawLang : 'en';
  const t = L[lang];

  const [magicEmail, setMagicEmail] = React.useState('');
  const [reviewerEmail, setReviewerEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'sent'>('idle');
  const [busy, setBusy] = React.useState(false);

  async function sendMagicLink() {
    if (!magicEmail.includes('@')) return;

    setBusy(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard&lang=${lang}`,
      },
    });

    setBusy(false);

    if (!error) setStatus('sent');
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
    <div className="flex flex-col items-center gap-6 p-8">

      <h1>{t.title}</h1>

      {status === 'sent' ? (
        <p>{t.sent}</p>
      ) : (
        <>
          {/* MAGIC LINK (ONLY THING USERS SEE) */}

          <p style={{ opacity: 0.7, fontSize: 14, textAlign: 'center' }}>
            {t.hint}
          </p>

          <input
            type="email"
            value={magicEmail}
            placeholder={t.email}
            onChange={(e) => setMagicEmail(e.target.value)}
            disabled={busy}
            style={{
              width: 320,
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#000',
              fontSize: 16,
            }}
          />

          <button onClick={sendMagicLink} disabled={busy}>
            {t.send}
          </button>

          <button onClick={guestLogin} disabled={busy}>
            {t.guest}
          </button>

          {/* REVIEWER (HIDDEN BY DEFAULT) */}
          {SHOW_REVIEWER_UI && (
            <>
              <input
                type="email"
                value={reviewerEmail}
                placeholder={t.reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
              />

              <input
                type="password"
                value={password}
                placeholder={t.password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button onClick={reviewerLogin}>
                {t.signinpw}
              </button>
            </>
          )}
        </>
      )}

      <Link href={`/?lang=${lang}`}>{t.back}</Link>
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
