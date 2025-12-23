'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { computePaths } from '../../lib/computePaths'; // Adjust the path if necessary

type Lang = 'en' | 'es';
type Risk = 'Low' | 'Medium' | 'High';
type Pulse = 'Slow' | 'Moderate' | 'Fast';

const TEXT = {
  en: {
    title: 'Path A — Minimize Disruption',
    intro: 'This path prioritizes stability and minimizes disruption, preserving your current position while maintaining flexibility.',
    tradeoff: 'Tradeoff',
    backPaths: '← Back to available paths',
    backDashboard: '← Back to dashboard',
    nextSteps: 'Next steps',
    nextStepsDesc: 'Continue building on your current position by strengthening existing skills and exploring new opportunities in the same field.'
  },
  es: {
    title: 'Camino A — Minimizar la Disrupción',
    intro: 'Este camino prioriza la estabilidad y minimiza la disrupción, preservando tu posición actual mientras mantienes flexibilidad.',
    tradeoff: 'Compensación',
    backPaths: '← Volver a los caminos disponibles',
    backDashboard: '← Volver al panel',
    nextSteps: 'Próximos pasos',
    nextStepsDesc: 'Continúa fortaleciendo tu posición actual mejorando habilidades existentes y explorando nuevas oportunidades dentro del mismo campo.'
  },
};

export default function PathAPage() {
  const sp = useSearchParams();

  const lang: Lang = (sp.get('lang') as Lang) || 'en';
  const risk: Risk = (sp.get('risk') as Risk) || 'Medium';
  const pulse: Pulse = (sp.get('pulse') as Pulse) || 'Moderate';

  const T = TEXT[lang];
  const { pathA } = computePaths({ risk, pulse, lang });

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: '0 auto' }}>
      <h1>{T.title}</h1>
      <p style={{ marginTop: 12 }}>{T.intro}</p>

      <section style={{ marginTop: 28 }}>
        <p>{pathA.framing}</p>
        <p style={{ marginTop: 12 }}>
          <strong>{T.tradeoff}:</strong> {pathA.tradeoff}
        </p>
      </section>

      {/* Next Steps */}
      <section style={{ marginTop: 32 }}>
        <h3>{T.nextSteps}</h3>
        <p>{T.nextStepsDesc}</p>
      </section>

      <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
        <Link href={`/paths?lang=${lang}&risk=${risk}&pulse=${pulse}`}>
          {T.backPaths}
        </Link>
        <Link href={`/dashboard?lang=${lang}`}>
          {T.backDashboard}
        </Link>
      </div>
    </main>
  );
}
