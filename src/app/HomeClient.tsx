'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Lang = 'en' | 'pt' | 'es' | 'fr';

const SUPPORT_COPY: Record<
  Lang,
  { main: string; signin: string; guest: string }
> = {

  /* 🇺🇸 EN */
  en: {
    main: 'Feeling stuck? Neuronaut helps you think clearly.',
    signin: 'Sign in',
    guest: 'Start instantly (no account)',
  },

  /* 🇧🇷 PT (natural Brazilian) */
  pt: {
    main: 'Se sentindo travado? O Neuronaut te ajuda a pensar com clareza.',
    signin: 'Entrar',
    guest: 'Começar agora (sem conta)',
  },

  /* 🇪🇸 ES */
  es: {
    main: '¿Te sientes estancado? Neuronaut te ayuda a pensar con claridad.',
    signin: 'Iniciar sesión',
    guest: 'Comenzar al instante (sin cuenta)',
  },

  /* 🇫🇷 FR */
  fr: {
    main: 'Vous vous sentez bloqué ? Neuronaut vous aide à penser clairement.',
    signin: 'Connexion',
    guest: 'Démarrer instantanément (sans compte)',
  },
};

export default function HomeClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const lang = (sp.get('lang') as Lang) || 'en';
  const T = SUPPORT_COPY[lang];

  const go = (path: string) => router.push(`${path}?lang=${lang}`);

  return (
    <div style={page}>
      <div style={bg} />
      <div style={overlay} />

      <div style={centerWrap}>
        <div style={card}>
          {/* LANG */}
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

          {/* SIGN IN */}
          <button style={primaryBtn} onClick={() => go('/sign-in')}>
            {T.signin}
          </button>

          {/* HERO */}
          <div style={heroWrap}>
            <img
              src="/neuronaut-woman-smiling.png"
              alt="Support"
              style={heroImg}
            />
            <div style={heroText}>{T.main}</div>
          </div>

          {/* GUEST */}
          <button style={secondaryBtn} onClick={() => go('/dashboard?guest=1')}>
            {T.guest}
          </button>
        </div>
      </div>

      <div style={footer}>© 2026 Arison8, LLC · Neuronaut AI</div>

      <style jsx global>{`
     @keyframes slowPulse {
  0% {
    transform: scale(1);
    opacity: 0.95;
    filter: brightness(1);
  }

  50% {
    transform: scale(1.10);
    opacity: 1;
    filter: brightness(1.18);
  }

  100% {
    transform: scale(1);
    opacity: 0.95;
    filter: brightness(1);
  }
}


        @keyframes fadeInHero {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ================= STYLES ================= */

const page: React.CSSProperties = {
  minHeight: '100vh',
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
  animation: 'slowPulse 6s ease-in-out infinite',

};

const overlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at center, rgba(20,40,120,0.35), rgba(4,6,15,0.95) 72%)',
};

const centerWrap: React.CSSProperties = {
  position: 'relative',
  zIndex: 5,
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 20px',
};

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 360,
  textAlign: 'center',
};

const langInline: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 18,
  marginBottom: 22,
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
  marginBottom: 16,
};

const heroWrap: React.CSSProperties = {
  marginBottom: 16,
  animation: 'fadeInHero 1.2s ease forwards',
  opacity: 0,
};

const heroImg: React.CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: '50%',
  objectFit: 'cover',
  boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
  marginBottom: 10,
};

const heroText: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1.5,
};

const secondaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '15px 26px',
  borderRadius: 22,
  border: '1px solid rgba(130,160,255,0.45)',
  background: 'rgba(10,15,28,0.6)',
  color: '#c9d4ff',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
};

const footer: React.CSSProperties = {
  position: 'absolute',
  bottom: 18,
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: 12,
  opacity: 0.55,
};
