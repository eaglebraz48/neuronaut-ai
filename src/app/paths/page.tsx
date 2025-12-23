'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { computePaths } from '../lib/computePaths'; // Correct the relative path

type Lang = 'en' | 'es';
type Risk = 'Low' | 'Medium' | 'High';
type Pulse = 'Slow' | 'Moderate' | 'Fast';

function waitContext(risk: Risk, pulse: Pulse, lang: Lang) {
  const copy = {
    en: {
      highFast: 'If nothing changes, pressure is likely to increase before relief appears.',
      high: 'If nothing changes, stability may narrow before it improves.',
      mediumFast: 'If nothing changes, options may become more limited over time.',
      medium: 'If nothing changes, conditions may hold briefly, then shift.',
      low: 'If nothing changes, your situation is likely to remain steady for now.',
    },
    es: {
      highFast: 'Si nada cambia, la presión probablemente aumentará antes de que llegue el alivio.',
      high: 'Si nada cambia, la estabilidad puede reducirse antes de mejorar.',
      mediumFast: 'Si nada cambia, las opciones pueden volverse más limitadas con el tiempo.',
      medium: 'Si nada cambia, las condiciones pueden mantenerse brevemente y luego cambiar.',
      low: 'Si nada cambia, tu situación probablemente se mantendrá estable por ahora.',
    },
  }[lang];

  if (risk === 'High' && pulse === 'Fast') return copy.highFast;
  if (risk === 'High') return copy.high;
  if (risk === 'Medium' && pulse === 'Fast') return copy.mediumFast;
  if (risk === 'Medium') return copy.medium;
  return copy.low;
}

function recommendedPath(risk: Risk, pulse: Pulse): 'A' | 'B' {
  if (risk === 'High' || pulse === 'Fast') return 'B';
  return 'A';
}

export default function PathsPage() {
  const sp = useSearchParams();

  const lang: Lang = (sp.get('lang') as Lang) || 'en';
  const risk: Risk = (sp.get('risk') as Risk) || 'Medium';
  const pulse: Pulse = (sp.get('pulse') as Pulse) || 'Moderate';

  const text = {
    en: {
      title: 'Recommended direction',
      subtitle: 'Based on your current stability.',
      alternative: 'Prefer the alternative path?',
      tradeoff: 'Tradeoff',
      back: 'Back to dashboard',
    },
    es: {
      title: 'Dirección recomendada',
      subtitle: 'Basado en tu estabilidad actual.',
      alternative: '¿Prefieres el camino alternativo?',
      tradeoff: 'Compensación',
      back: 'Volver al panel',
    },
  }[lang];

  const { pathA, pathB } = computePaths({ risk, pulse, lang });
  const waitLine = waitContext(risk, pulse, lang);

  const recommended = recommendedPath(risk, pulse);
  const mainPath = recommended === 'A' ? pathA : pathB;
  const altPath = recommended === 'A' ? pathB : pathA;
  const mainHref =
    recommended === 'A'
      ? `/paths/a?lang=${lang}&risk=${risk}&pulse=${pulse}`
      : `/paths/b?lang=${lang}&risk=${risk}&pulse=${pulse}`;

  const altHref =
    recommended === 'A'
      ? `/paths/b?lang=${lang}&risk=${risk}&pulse=${pulse}`
      : `/paths/a?lang=${lang}&risk=${risk}&pulse=${pulse}`;

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: '0 auto' }}>
      <h1>{text.title}</h1>
      <p style={{ opacity: 0.85 }}>{text.subtitle}</p>

      <p style={{ marginTop: 12, fontStyle: 'italic' }}>{waitLine}</p>

      {/* MAIN RECOMMENDED PATH */}
      <section
        style={{
          marginTop: 32,
          padding: 24,
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <h2>{mainPath.title}</h2>
        <p style={{ marginTop: 8 }}>{mainPath.framing}</p>
        <p style={{ marginTop: 12 }}>
          <strong>{text.tradeoff}:</strong> {mainPath.tradeoff}
        </p>

        <Link
          href={mainHref}
          style={{
            display: 'inline-block',
            marginTop: 20,
            padding: '10px 16px',
            borderRadius: 8,
            background: '#60a5fa',
            color: '#000',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Continue →
        </Link>
      </section>

      {/* ALTERNATIVE */}
      <div style={{ marginTop: 28, opacity: 0.8 }}>
        <p>{text.alternative}</p>
        <Link href={altHref} style={{ textDecoration: 'underline' }}>
          {altPath.title}
        </Link>
      </div>

      <div style={{ marginTop: 40 }}>
        <Link href={`/dashboard?lang=${lang}`}>← {text.back}</Link>
      </div>
    </main>
  );
}
