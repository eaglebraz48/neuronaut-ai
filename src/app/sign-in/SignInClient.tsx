'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Lang = 'en' | 'es';

const COPY = {
  en: {
    title: 'Sign in',
    subtitle: 'Access your saved progress and recommendations.',
    note:
      'Authentication will be enabled soon. For now, continue as guest or explore freely.',
    guest: 'Continue as guest',
    back: '← Back to home',
  },
  es: {
    title: 'Iniciar sesión',
    subtitle: 'Accede a tu progreso y recomendaciones guardadas.',
    note:
      'La autenticación se activará pronto. Por ahora, continúa como invitado.',
    guest: 'Continuar como invitado',
    back: '← Volver al inicio',
  },
};

export default function SignInClient() {
  const sp = useSearchParams();
  const lang = (sp.get('lang') as Lang) || 'en';
  const T = COPY[lang];

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0a0f1c',
        color: '#fff',
        padding: 40,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          background: '#0f172a',
          borderRadius: 16,
          padding: 30,
          border: '1px solid #334155',
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>{T.title}</h1>
        <p style={{ marginTop: 6, color: '#9fb0c8' }}>{T.subtitle}</p>

        <p style={{ marginTop: 20, fontSize: 14, color: '#94a3b8' }}>
          {T.note}
        </p>

        <Link
          href={`/dashboard?lang=${lang}&guest=1`}
          style={{
            display: 'block',
            marginTop: 24,
            background: '#38bdf8',
            color: '#000',
            padding: '10px 14px',
            borderRadius: 8,
            textAlign: 'center',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          {T.guest}
        </Link>

        <Link
          href={`/?lang=${lang}`}
          style={{
            display: 'block',
            marginTop: 16,
            color: '#60a5fa',
            textDecoration: 'none',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {T.back}
        </Link>
      </div>
    </main>
  );
}
