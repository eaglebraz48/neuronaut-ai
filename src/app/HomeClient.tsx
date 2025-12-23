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

export default function HomeClient() {
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
    <main style={{ padding: 48, color: 'white' }}>
      <h1>{T.welcome}</h1>
      <p>{T.tagline}</p>

      <div style={{ marginTop: 24 }}>
        <strong>{T.langLabel}</strong>{' '}
        <button onClick={() => setLang('en')}>EN</button>{' '}
        <button onClick={() => setLang('es')}>ES</button>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link href={signInHref}>{T.signin}</Link>
        <br />
        <Link href={dashHref}>{T.dashboard}</Link>
        <br />
        <button onClick={handleGuestClick}>{T.guest}</button>
        <p style={{ opacity: 0.7 }}>{T.guestNote}</p>
      </div>
    </main>
  );
}
