'use client';

import { useSearchParams, useRouter } from 'next/navigation';

type Lang = 'en' | 'es';

export default function LangSwitch() {
  const sp = useSearchParams();
  const router = useRouter();

  const lang: Lang = (sp.get('lang') as Lang) || 'en';

  const switchLang = (next: Lang) => {
    const params = new URLSearchParams(sp.toString());
    params.set('lang', next);
    router.push(`?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={() => switchLang('en')}
        style={{
          padding: '6px 10px',
          fontWeight: 700,
          opacity: lang === 'en' ? 1 : 0.5,
          background: lang === 'en' ? '#38bdf8' : '#111827',
          color: lang === 'en' ? 'black' : 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        EN
      </button>
      <button
        onClick={() => switchLang('es')}
        style={{
          padding: '6px 10px',
          fontWeight: 700,
          opacity: lang === 'es' ? 1 : 0.5,
          background: lang === 'es' ? '#38bdf8' : '#111827',
          color: lang === 'es' ? 'black' : 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        ES
      </button>
    </div>
  );
}
