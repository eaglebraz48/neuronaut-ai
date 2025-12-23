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
    <div style={{ padding: 40 }}>
      <h1>Welcome to Neuronaut</h1>

      <p>
        {lang === 'en'
          ? 'Navigate job uncertainty with clarity.'
          : 'Navega la incertidumbre laboral con claridad.'}
      </p>

      <div style={{ marginTop: 24 }}>
        <Link href={`/sign-in?lang=${lang}`}>Sign in</Link>
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => router.push(`/dashboard?lang=${lang}&guest=1`)}
        >
          Continue without account
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="?lang=en">English</Link> |{' '}
        <Link href="?lang=es">Español</Link>
      </div>
    </div>
  );
}
