'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Phase = 'intro';

export default function HomeClient() {
  const [phase] = useState<Phase>('intro');

  const router = useRouter();
  const sp = useSearchParams();
  const lang = sp.get('lang') || 'en';

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        background: '#0a0f1c',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ===== STAGE ===== */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 1s ease',
        }}
      >
        {/* Brain / Core */}
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 30%, #7aa2ff, #1b2b5f 60%, #0a0f1c)',
            boxShadow: '0 0 60px rgba(120,160,255,0.35)',
            transition: 'all 1s ease',
          }}
        />
      </div>

      {/* ===== ENTRY CONTROLS ===== */}
      {phase === 'intro' && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => router.push(`/dashboard?guest=1&lang=${lang}`)}
            style={{
              padding: '10px 22px',
              borderRadius: 14,
              border: 'none',
              background: '#7aa2ff',
              color: '#000',
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: 220,
            }}
          >
            {lang === 'es' ? 'Entrar como invitado' : 'Continue as guest'}
          </button>

          <button
            onClick={() => router.push(`/sign-in?lang=${lang}`)}
            style={{
              padding: '10px 22px',
              borderRadius: 14,
              border: '1px solid rgba(122,162,255,0.6)',
              background: 'transparent',
              color: '#7aa2ff',
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: 220,
            }}
          >
            {lang === 'es' ? 'Iniciar sesión' : 'Sign in'}
          </button>
        </div>
      )}
    </div>
  );
}

