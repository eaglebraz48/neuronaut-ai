'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Lang = 'en' | 'es';
type Risk = 'Low' | 'Medium' | 'High';
type Pulse = 'Slow' | 'Moderate' | 'Fast';

function pathBCopy(risk: Risk, pulse: Pulse, lang: Lang) {
  const T = {
    en: {
      highFast: {
        body:
          'This path compresses uncertainty. You act decisively to regain control before pressure compounds.',
        note: 'Disruption is likely, but delay materially increases downside.',
      },
      high: {
        body:
          'This path prioritizes early intervention. You trade comfort for earlier stabilization.',
        note: 'Short-term friction is expected. The benefit is reduced tail risk.',
      },
      low: {
        body:
          'This path is optional. You move now to position ahead of future shifts.',
        note: 'Energy spent now pays off later. Moving too early may add noise.',
      },
      default: {
        body:
          'This path accelerates correction. You accept effort now to simplify later.',
        note: 'Timing matters. Acting too late erodes the advantage.',
      },
      title: 'Path B — Create faster stability',
      tradeoff: 'Tradeoff',
      backPaths: '← Back to paths',
      backDashboard: '← Back to dashboard',
    },
    es: {
      highFast: {
        body:
          'Este camino comprime la incertidumbre. Actúas con decisión para recuperar control antes de que la presión aumente.',
        note:
          'La disrupción es probable, pero retrasar aumenta significativamente el riesgo.',
      },
      high: {
        body:
          'Este camino prioriza la intervención temprana. Cambias comodidad por estabilización más rápida.',
        note:
          'Se espera fricción a corto plazo. El beneficio es menor riesgo prolongado.',
      },
      low: {
        body:
          'Este camino es opcional. Te mueves ahora para posicionarte antes de cambios futuros.',
        note:
          'La energía invertida ahora rinde después. Moverse muy pronto puede añadir ruido.',
      },
      default: {
        body:
          'Este camino acelera la corrección. Aceptas esfuerzo ahora para simplificar después.',
        note:
          'El momento importa. Actuar tarde reduce la ventaja.',
      },
      title: 'Camino B — Crear estabilidad más rápido',
      tradeoff: 'Compensación',
      backPaths: '← Volver a caminos',
      backDashboard: '← Volver al panel',
    },
  }[lang];

  if (risk === 'High' && pulse === 'Fast') return { ...T.highFast, T };
  if (risk === 'High') return { ...T.high, T };
  if (risk === 'Low') return { ...T.low, T };
  return { ...T.default, T };
}

export default function PathBClient() {
  const sp = useSearchParams();

  const lang: Lang = (sp.get('lang') as Lang) || 'en';
  const risk: Risk = (sp.get('risk') as Risk) || 'Medium';
  const pulse: Pulse = (sp.get('pulse') as Pulse) || 'Moderate';

  const copy = pathBCopy(risk, pulse, lang);

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: '0 auto' }}>
      <h1>{copy.T.title}</h1>

      <p style={{ marginTop: 16 }}>{copy.body}</p>

      <p style={{ marginTop: 16 }}>
        <strong>{copy.T.tradeoff}:</strong> {copy.note}
      </p>

      <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
        <Link href={`/paths?lang=${lang}&risk=${risk}&pulse=${pulse}`}>
          {copy.T.backPaths}
        </Link>
        <Link href={`/dashboard?lang=${lang}`}>
          {copy.T.backDashboard}
        </Link>
      </div>
    </main>
  );
}
