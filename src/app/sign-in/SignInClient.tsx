'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Lang = 'en' | 'es';
const LANGS: readonly Lang[] = ['en', 'es'] as const;
const isLang = (v: string | null): v is Lang =>
  !!v && (LANGS as readonly string[]).includes(v as Lang);

const L: Record<Lang, any> = {
  en: {
    title: 'Sign in',
    email: 'Email',
    send: 'Send magic link',
    back: '← Back to home',
    sent: 'Check your email for the login link!',
    reviewerEmail: 'Reviewer access email',
    password: 'Password (reviewers only)',
    signinpw: 'Sign in with password',
    guest: 'Continue as guest',
  },
  es: {
    title: 'Iniciar sesión',
    email: 'Correo',
    send: 'Enviar enlace mágico',
    back: '← Volver al inicio',
    sent: '¡Revisa tu correo para el enlace!',
    reviewerEmail: 'Correo del revisor',
    password: 'Contraseña (solo revisores)',
    signinpw: 'Entrar con contraseña',
    guest: 'Entrar como invitado',
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
    if (!magicEmail || !magicEmail.includes('@')) {
      alert('Enter a valid email.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard&phase=confirming&lang=${lang}`,
        },
      });
      if (error) throw error;
      setStatus('sent');
    } catch (err: any) {
      alert(err?.message ?? 'Unexpected error.');
    } finally {
      setBusy(false);
    }
  }

  async function reviewerLogin() {
    if (!reviewerEmail || !password) {
      alert('Enter email + password.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: reviewerEmail,
        password,
      });
      if (error) {
        alert(error.message);
      } else {
        router.replace(`/dashboard?phase=confirming&lang=${lang}&reviewer=1`);
      }
    } finally {
      setBusy(false);
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
          {/* MAGIC LINK */}
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

          {/* REVIEWER */}
          <input
            type="email"
            value={reviewerEmail}
            placeholder={t.reviewerEmail}
            onChange={(e) => setReviewerEmail(e.target.value)}
            disabled={busy}
            style={{
              marginTop: 18,
              width: 320,
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#000',
              fontSize: 16,
            }}
          />

          <input
            type="password"
            value={password}
            placeholder={t.password}
            onChange={(e) => setPassword(e.target.value)}
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

          <button onClick={reviewerLogin} disabled={busy}>
            {t.signinpw}
          </button>

          <button onClick={guestLogin} disabled={busy}>
            {t.guest}
          </button>
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
