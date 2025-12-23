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
    /* 🔥 TODO O JSX ORIGINAL DA HOME — SEM ALTERAÇÃO */
    /* Copia exatamente o JSX que você já tem */
    /* Nada de lógica fora daqui */
    /* OMITIDO AQUI POR BREVIDADE — USE O MESMO JSX */
    /* 👆 NÃO MUDA ESTILO, TEXTO OU HTML */
    /* Só mudou o arquivo */
    <></>
  );
}
