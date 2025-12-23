'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { computeSnapshot } from '../lib/computeSnapshot';

type Lang = 'en' | 'es';

const profileMock = {
  status: 'employed' as const,
  industry: 'tech',
  job_title: 'engineer',
  concern: 'stability',
};

export default function SnapshotClient() {
  const sp = useSearchParams();
  const lang: Lang = (sp.get('lang') as Lang) || 'en';

  const T = {
    en: {
      title: 'Stability snapshot',
      subtitle: 'A clear view of where you stand right now.',
      risk: 'Risk',
      window: 'Window',
      pulse: 'Pace',
      meaning: 'What this means',
      next: 'Next moves',
      back: 'Back to dashboard',
    },
    es: {
      title: 'Resumen de estabilidad',
      subtitle: 'Una vista clara de tu situación actual.',
      risk: 'Riesgo',
      window: 'Ventana',
      pulse: 'Ritmo',
      meaning: 'Qué significa esto',
      next: 'Próximos pasos',
      back: 'Volver al panel',
    },
  }[lang];

  const snapshot = computeSnapshot(profileMock, lang);
  const { risk, pulse, window, text } = snapshot;

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 40 }}>
      <h1 style={{ fontSize: 34, fontWeight: 800 }}>{T.title}</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>{T.subtitle}</p>

      <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
        <Badge label={T.risk} value={risk} />
        <Badge label={T.window} value={window} />
        <Badge label={T.pulse} value={pulse} />
      </div>

      <section style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 8 }}>{T.meaning}</h3>
        <p style={{ lineHeight: 1.6, opacity: 0.9 }}>{text}</p>
      </section>

      <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link href={`/paths?lang=${lang}`} style={primaryBtn}>
          {T.next}
        </Link>

        <Link href={`/dashboard?lang=${lang}`} style={secondaryBtn}>
          {T.back}
        </Link>
      </div>
    </main>
  );
}

/* ---------- UI helpers ---------- */

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '10px 14px',
        borderRadius: 8,
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.6 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const primaryBtn = {
  padding: '12px 18px',
  borderRadius: 8,
  background: 'linear-gradient(135deg, #4fa3ff, #7ab8ff)',
  color: '#000',
  fontWeight: 700,
  textDecoration: 'none',
};

const secondaryBtn = {
  padding: '12px 18px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.25)',
  color: '#fff',
  textDecoration: 'none',
};
