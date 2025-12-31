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


  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'sent'>('idle');
  const [busy, setBusy] = React.useState(false);

  // ❌ NO auto-redirect on mount
  // Sign-in page must NEVER decide auth state

  async function sendMagicLink() {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }

    setBusy(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?redirect=/dashboard&lang=${lang}`;

      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus('sent');
    } catch (err: any) {
      alert(err?.message ?? 'Unexpected error.');
    } finally {
      setBusy(false);
    }
  }

  async function reviewerLogin() {
    if (!email || !password) {
      alert('Enter email + password.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.replace(`/dashboard?lang=${lang}`);
    } finally {
      setBusy(false);
    }
  }

  function guestLogin() {
    localStorage.setItem('neuronaut_guest', '1');
    router.replace(`/dashboard?lang=${lang}`);
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1>{t.title}</h1>

      {status === 'sent' ? (
        <p>{t.sent}</p>
      ) : (
        <>
          <input
            type="email"
            value={email}
            placeholder={t.email}
            onChange={(e) => setEmail(e.target.value)}
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

          <div style={{ marginTop: 10, opacity: 0.7 }}>Reviewer sign in</div>

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
