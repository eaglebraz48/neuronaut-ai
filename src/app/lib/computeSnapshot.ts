export type Risk = 'Low' | 'Medium' | 'Medium–High' | 'High';
export type Lang = 'en' | 'es';

export type SnapshotResult = {
  risk: Risk;
  window: string;
  pulse: string;
  text: string;
};

type Profile = {
  job_title: string;
  industry: string;
  status: 'employed' | 'at_risk' | 'laid_off';
  concern: string;
};

export function computeSnapshot(
  profile: Profile,
  lang: Lang
): SnapshotResult {
  const COPY = {
    en: {
      base: {
        risk: 'Medium' as Risk,
        window: '3–6 months',
        pulse: 'Moderate (≈ 6 months)',
        text:
          'You still have time to prepare calmly. Focus on strengthening your position, not rushing decisions.',
      },
      atRisk: {
        risk: 'Medium–High' as Risk,
        window: '3–6 months',
        pulse: 'Fast (≈ 3 months)',
        text:
          'Your environment is shifting quickly. This is a preparation phase: stabilize, reduce exposure, and widen options.',
      },
      laidOff: {
        risk: 'High' as Risk,
        window: 'Immediate',
        pulse: 'Very fast (weeks)',
        text:
          'Stability comes first. Secure income and routine before making long-term or identity-level changes.',
      },
      stable: {
        risk: 'Low' as Risk,
        window: '6–12 months',
        pulse: 'Slow',
        text:
          'Your situation is stable. Small proactive moves now can compound into long-term security.',
      },
    },
    es: {
      base: {
        risk: 'Medium' as Risk,
        window: '3–6 meses',
        pulse: 'Moderado (≈ 6 meses)',
        text:
          'Aún tienes tiempo para prepararte con calma. Concéntrate en fortalecer tu posición, no en apresurarte.',
      },
      atRisk: {
        risk: 'Medium–High' as Risk,
        window: '3–6 meses',
        pulse: 'Rápido (≈ 3 meses)',
        text:
          'Tu entorno está cambiando rápidamente. Esta es una fase de preparación: estabiliza, reduce exposición y amplía opciones.',
      },
      laidOff: {
        risk: 'High' as Risk,
        window: 'Inmediato',
        pulse: 'Muy rápido (semanas)',
        text:
          'La estabilidad es lo primero. Asegura ingresos y rutina antes de cambios a largo plazo.',
      },
      stable: {
        risk: 'Low' as Risk,
        window: '6–12 meses',
        pulse: 'Lento',
        text:
          'Tu situación es estable. Pequeños movimientos ahora pueden generar seguridad a largo plazo.',
      },
    },
  };

  // Ensure the selected language and the necessary data exist
  const langData = COPY[lang] || COPY['en'];

  // Default to 'base' in case of issues with status or other properties
  let result = langData.base || {
    risk: 'Medium' as Risk,
    window: 'Unknown',
    pulse: 'Moderate',
    text: 'No data available',
  };

  // Check profile status and update result accordingly
  if (profile.status === 'at_risk') {
    result = langData.atRisk || result;
  }

  if (profile.status === 'laid_off') {
    result = langData.laidOff || result;
  }

  if (profile.status === 'employed' && profile.industry === 'stable') {
    result = langData.stable || result;
  }

  return result;
}
