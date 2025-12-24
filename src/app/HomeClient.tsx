'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Lang = 'en' | 'es';
const LANGS = ['en', 'es'] as const;

function safeLang(v: string | null): Lang {
  return (LANGS as readonly string[]).includes(v ?? '') ? (v as Lang) : 'en';
}

const COPY: Record<
  Lang,
  {
    welcome: string;
    tagline: string;
    signin: string;
    dashboard: string;
    guest: string;
    guestNote: string;
    langLabel: string;
  }
> = {
  en: {
    welcome: 'Welcome to Neuronaut',
    tagline: 'Navigate job uncertainty with clarity and control',
    signin: 'Sign in',
    dashboard: 'Go to dashboard',
    guest: 'Continue without account',
    guestNote: 'You can explore freely. Create an account to save your progress.',
    langLabel: 'Language:',
  },
  es: {
    welcome: 'Bienvenido a Neuronaut',
    tagline: 'Navega la incertidumbre laboral con claridad y control',
    signin: 'Iniciar sesión',
    dashboard: 'Ir al panel',
    guest: 'Continuar sin cuenta',
    guestNote: 'Puedes explorar libremente. Crea una cuenta para guardar tu progreso.',
    langLabel: 'Idioma:',
  },
};

export default function HomePageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const lang = safeLang(sp.get('lang'));
  const T = COPY[lang];

  const handleGuestClick = () => {
    localStorage.setItem('neuronaut_guest', '1');
    router.push(`/dashboard?lang=${lang}&guest=1`);
  };

  const qp = new URLSearchParams();
  qp.set('lang', lang);

  const signInHref = `/sign-in?${qp.toString()}`;
  const dashHref = `/dashboard?${qp.toString()}`;

  const setLang = (next: Lang) => {
    const p = new URLSearchParams(Array.from(sp.entries()));
    p.set('lang', next);
    router.replace(`/?${p.toString()}`);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 50% 20%, rgba(56,189,248,0.12) 0%, rgba(0,0,0,0) 70%) #0a0f1c',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: '3rem 1rem 6rem',
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: '100%',
          background:
            'radial-gradient(circle at 50% 0%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%) #0f172a',
          borderRadius: 16,
          boxShadow:
            '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(56,189,248,0.35) inset',
          border: '1px solid rgba(56,189,248,0.3)',
          padding: '2rem 1.5rem 1.5rem',
        }}
      >
        {/* Emblem */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: 14,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 60%, transparent 70%)',
            }}
          >
            <img
              src="/neuronautavatar.png"
              alt="Neuronaut emblem"
              style={{
                width: 300,  // Increase the width to make the image bigger
                height: 'auto',  // Ensure the height adjusts proportionally
                opacity: 0.95,
                animation: 'neuronPulse 5s ease-in-out infinite', // Adjust the timing for a stronger pulse
                filter:
                  'drop-shadow(0 0 18px rgba(120,180,255,0.55)) drop-shadow(0 0 40px rgba(120,180,255,0.25))',
                willChange: 'transform, opacity',
              }}
            />
          </div>
        </div>

        {/* "Back to Sign In" Button */}
        <div
          style={{
            marginTop: 12,
            marginBottom: 16,
          }}
        >
          <Link
            href={signInHref}
            style={{
              color: '#38bdf8',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            Back to Sign In
          </Link>
        </div>

        {/* Language Switch */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {(['en', 'es'] as Lang[]).map((code) => {
            const active = code === lang;
            return (
              <button
                key={code}
                onClick={() => setLang(code)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 10,
                  background: active
                    ? 'rgba(56,189,248,0.15)'
                    : 'rgba(255,255,255,0.06)',
                  border: active
                    ? '1px solid rgba(56,189,248,0.6)'
                    : '1px solid rgba(255,255,255,0.15)',
                  color: '#e5e7eb',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {code.toUpperCase()}
              </button>
            );
          })}
        </div>

        <h1
          style={{
            fontWeight: 800,
            fontSize: '1.75rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
            textShadow:
              '0 0 20px rgba(56,189,248,0.6), 0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          {T.welcome}
        </h1>

        <div
          style={{
            fontSize: '0.95rem',
            color: '#94a3b8',
            marginBottom: '1.5rem',
          }}
        >
          {T.tagline}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <button
            onClick={handleGuestClick}
            style={{
              backgroundColor: '#38bdf8',
              color: '#000',
              padding: '10px 14px',
              borderRadius: 8,
              width: '100%',
              maxWidth: 260,
              fontWeight: 800,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {T.guest}
          </button>

          <div style={{ fontSize: 12, color: '#94a3b8', maxWidth: 260 }}>
            {T.guestNote}
          </div>

          <Link
            href={signInHref}
            style={{
              backgroundColor: '#111827',
              color: '#fff',
              borderRadius: 8,
              padding: '10px 14px',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              width: '100%',
              maxWidth: 260,
              textAlign: 'center',
            }}
          >
            {T.signin}
          </Link>

          <Link
            href={dashHref}
            style={{
              backgroundColor: '#1e293b',
              color: '#fff',
              borderRadius: 8,
              padding: '10px 14px',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              width: '100%',
              maxWidth: 260,
              textAlign: 'center',
              border: '1px solid rgba(148,163,184,0.4)',
            }}
          >
            {T.dashboard}
          </Link>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
            {T.langLabel}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {(['en', 'es'] as Lang[]).map((code) => {
              const active = code === lang;
              return (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 10,
                    background: active
                      ? 'rgba(56,189,248,0.15)'
                      : 'rgba(255,255,255,0.06)',
                    border: active
                      ? '1px solid rgba(56,189,248,0.6)'
                      : '1px solid rgba(255,255,255,0.15)',
                    color: '#e5e7eb',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', fontSize: 10, color: '#64748b' }}>
          © 2025 Arison8™, LLC. All rights reserved.
        </div>
      </div>
    </main>
  );
}

<style jsx global>{`
  @keyframes neuronPulse {
    0% {
      transform: scale(1);
      opacity: 0.85;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.85;
    }
  }
`}</style>
