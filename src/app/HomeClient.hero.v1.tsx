'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';


type Lang = 'en' | 'pt' | 'es' | 'fr';

const COPY: Record<Lang, { tagline: string; guest: string; signin: string }> = {
  en: {
    tagline: 'When life feels uncertain, you don’t have to think alone.',
    guest: 'Continue as guest',
    signin: 'Sign in',
  },
  pt: {
    tagline: 'Quando o futuro parece incerto, você não está sozinho.',
    guest: 'Continuar como convidado',
    signin: 'Entrar',
  },
  es: {
    tagline: 'Cuando el futuro parece incierto, no tienes que pensar solo.',
    guest: 'Entrar como invitado',
    signin: 'Iniciar sesión',
  },
  fr: {
    tagline: 'Quand l’avenir semble incertain, vous n’êtes pas seul.',
    guest: 'Continuer en invité',
    signin: 'Connexion',
  },
};

export default function HomeClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const lang = (sp.get('lang') as Lang) || 'en';
  const T = COPY[lang];

  const go = (path: string) => router.push(`${path}?lang=${lang}`);

  return (
    <div style={page}>


      <div style={bg} />
      <div style={overlay} />

      <div style={centerWrap}>
        <div style={card}>
          {/* LANGUAGES */}
          <div style={langInline}>
            {(['en', 'pt', 'es', 'fr'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => router.push(`/?lang=${l}`)}
                style={{
                  ...langBtn,
                  color: l === lang ? '#a5b4fc' : '#e5e7eb',
                  fontWeight: l === lang ? 700 : 500,
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* BUTTONS */}
          <button style={primaryBtn} onClick={() => go('/sign-in')}>
            {T.signin}
          </button>

          {/* TAGLINE */}
          <div style={tagline}>{T.tagline}</div>

          <button style={secondaryBtn} onClick={() => go('/dashboard?guest=1')}>
            {T.guest}
          </button>
        </div>
      </div>

      <div style={footer}>© 2026 Arison8, LLC · Neuronaut AI</div>

      <style jsx global>{`
        @keyframes slowPulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

/* ================= STYLES ================= */

const page: React.CSSProperties = {
  height: '100vh',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  background: '#04060f',
  color: '#fff',
};

const bg: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: "url('/neuronaut-hero.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  animation: 'slowPulse 12s ease-in-out infinite',
};

const overlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at center, rgba(80,110,255,0.25), rgba(6,11,24,0.92) 70%)',
};

const centerWrap: React.CSSProperties = {
  position: 'relative',
  zIndex: 3,
  minHeight: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  paddingTop: '28vh',
  paddingLeft: 20,
  paddingRight: 20,
};

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 360,
  margin: '0 auto',
  padding: 0,
  background: 'transparent',
  boxShadow: 'none',
  textAlign: 'center',
};

const langInline: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 18,
  marginBottom: 26,
};

const langBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  letterSpacing: 0.6,
};

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '16px 26px',
  borderRadius: 22,
  border: 'none',
  background: 'linear-gradient(135deg, #8fa6ff 0%, #6f88ff 100%)',
  color: '#020617',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  marginBottom: 14,
  boxShadow:
    '0 20px 60px rgba(122,162,255,0.55), 0 0 0 1px rgba(255,255,255,0.15) inset',
};

const secondaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '15px 26px',
  borderRadius: 22,
  border: '1px solid rgba(130,160,255,0.45)',
  background: 'rgba(10,15,28,0.55)',
  color: '#c9d4ff',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 22,
};

const tagline: React.CSSProperties = {
  marginTop: 12,
  fontSize: 15,
  lineHeight: 1.6,
  opacity: 0.9,
  letterSpacing: 0.2,
  textShadow: '0 2px 12px rgba(0,0,0,0.45)',
};

const footer: React.CSSProperties = {
  position: 'absolute',
  bottom: 18,
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: 12,
  opacity: 0.55,
};
