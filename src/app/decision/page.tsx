'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Lang = 'en' | 'es';

const COPY = {
  en: {
    title: 'Recommended direction',
    subtitle: 'Based on your snapshot, this is the safest next step.',
    decision: 'Primary recommendation',
    why: 'Why this fits you',
    actions: 'Immediate actions',
    back: '← Back to dashboard',
  },
  es: {
    title: 'Dirección recomendada',
    subtitle: 'Según tu resumen, este es el siguiente paso más seguro.',
    decision: 'Recomendación principal',
    why: 'Por qué encaja contigo',
    actions: 'Acciones inmediatas',
    back: '← Volver al panel',
  },
};

type Context = {
  job_title: string;
  status: 'employed' | 'at_risk' | 'laid_off';
  concern: string;
};

function computeDecision(ctx: Context) {
  if (ctx.status === 'laid_off' || ctx.concern === 'income') {
    return {
      path: 'Path B — Faster stability',
      reason:
        'Income security matters most right now. Speed reduces stress and risk.',
      actions: [
        'Secure short-term income',
        'Reduce financial burn',
        'Delay long-term pivots',
      ],
    };
  }

  return {
    path: 'Path A — Lower disruption',
    reason:
      'You still have leverage. Staying close to your experience preserves options.',
    actions: [
      'Strengthen current skills',
      'Explore adjacent roles',
      'Prepare a fallback plan',
    ],
  };
}

export default function DecisionPage() {
  const sp = useSearchParams();
  const lang = (sp.get('lang') as Lang) || 'en';
  const T = COPY[lang];

  const [decision, setDecision] = useState<{
    path: string;
    reason: string;
    actions: string[];
  } | null>(null);

  useEffect(() => {
    const mockContext: Context = {
      job_title: 'Customer Support Specialist',
      status: 'employed',
      concern: 'stability',
    };

    setDecision(computeDecision(mockContext));
  }, []);

  if (!decision) return <p>Loading…</p>;

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, fontWeight: 700 }}>{T.title}</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>{T.subtitle}</p>

      <div style={{ marginTop: 30 }}>
        <p>
          <strong>{T.decision}:</strong> {decision.path}
        </p>

        <p style={{ marginTop: 16 }}>
          <strong>{T.why}:</strong>
          <br />
          {decision.reason}
        </p>

        <div style={{ marginTop: 20 }}>
          <strong>{T.actions}:</strong>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            {decision.actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        href={`/dashboard?lang=${lang}`}
        style={{
          display: 'inline-block',
          marginTop: 30,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        {T.back}
      </Link>
    </main>
  );
}
