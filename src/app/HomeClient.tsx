'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Lang = 'en' | 'es';
const LANGS = ['en', 'es'] as const;

function safeLang(v: string | null): Lang {
  return (LANGS as readonly string[]).includes(v ?? '') ? (v as Lang) : 'en';
}

export default function HomeClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const lang = safeLang(sp.get('lang'));

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 50% 20%, rgba(56,189,248,0.15) 0%, rgba(0,0,0,0) 70%) #0a0f1c',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 80,
      }}
    >
      {/* Emblem */}
      <img
        src="/neuronautavatar.png"
        alt="Neuronaut emblem"
        style={{
          width: 260,
          marginBottom: 24,
          animation: 'neuronPulseStrong 4.5s ease-in-out infinite',
          filter:
            'drop-shadow(0 0 28px rgba(120,180,255,0.7)) drop-shadow(0 0 60px rgba(120,180,255,0.35))',
          willChange: 'transform, opacity',
        }}
      />

      {/* Language */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <Link
          href="?lang=en"
          style={{
            fontWeight: lang === 'en' ? 700 : 400,
            opacity: lang === 'en' ? 1 : 0.6,
            textDecoration: 'none',
          }}
        >
          English
        </Link>
        <Link
          href="?lang=es"
          style={{
            fontWeight: lang === 'es' ? 700 : 400,
            opacity: lang === 'es' ? 1 : 0.6,
            textDecoration: 'none',
          }}
        >
          Español
        </Link>
      </div>

      {/* Text */}
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
        {lang === 'en' ? 'Welcome to Neuronaut' : 'Bienvenido a Neuronaut'}
      </h1>

      <p style={{ opacity: 0.85, marginBottom: 32 }}>
        {lang === 'en'
          ? 'Navigate job uncertainty with clarity.'
          : 'Navega la incertidumbre laboral con claridad.'}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Link href={`/sign-in?lang=${lang}`}>Sign in</Link>

        <button
          onClick={() => router.push(`/dashboard?lang=${lang}&guest=1`)}
          style={{
            background: '#38bdf8',
            color: '#000',
            padding: '10px 16px',
            borderRadius: 8,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Continue without account
        </button>
      </div>

      {/* Animation */}
      <style jsx global>{`
        @keyframes neuronPulseStrong {
          0% {
            transform: scale(1);
            opacity: 0.85;
          }
          40% {
            transform: scale(1.08);
            opacity: 1;
          }
          70% {
            transform: scale(1.04);
            opacity: 0.95;
          }
          100% {
            transform: scale(1);
            opacity: 0.85;
          }
        }
      `}</style>
    </main>
  );
}
