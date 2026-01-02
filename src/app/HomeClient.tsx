'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function HomeClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const lang = sp.get('lang') || 'en';

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#04060f',
        color: '#fff',
      }}
    >
      {/* ===== IMMERSIVE BACKGROUND IMAGE ===== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/neuronaut-hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.85) saturate(1.1)',
          animation: 'slowPulse 10s ease-in-out infinite',
        }}
      />

      {/* ===== COLOR OVERLAY (BLEND) ===== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, rgba(80,110,255,0.25), rgba(6,11,24,0.92) 65%)',
        }}
      />

      {/* ===== CONTENT ===== */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        {/* ===== TAGLINE ===== */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            lineHeight: 1.5,
            maxWidth: 560,
            marginBottom: 42,
            textShadow: '0 2px 20px rgba(0,0,0,0.6)',
          }}
        >
          When life feels uncertain, you don’t have to think alone.
        </div>

        {/* ===== ACTION BUTTONS ===== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => router.push(`/dashboard?guest=1&lang=${lang}`)}
            style={{
              padding: '14px 28px',
              borderRadius: 18,
              border: 'none',
              background: '#7aa2ff',
              color: '#000',
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: 260,
              boxShadow: '0 12px 40px rgba(122,162,255,0.45)',
            }}
          >
            {lang === 'es' ? 'Entrar como invitado' : 'Continue as guest'}
          </button>

          <button
            onClick={() => router.push(`/sign-in?lang=${lang}`)}
            style={{
              padding: '14px 28px',
              borderRadius: 18,
              border: '1px solid rgba(122,162,255,0.6)',
              background: 'rgba(10,15,28,0.55)',
              color: '#7aa2ff',
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: 260,
              backdropFilter: 'blur(6px)',
            }}
          >
            {lang === 'es' ? 'Iniciar sesión' : 'Sign in'}
          </button>
        </div>
      </div>

      {/* ===== ANIMATION ===== */}
      <style jsx global>{`
        @keyframes slowPulse {
          0% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.03);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}
