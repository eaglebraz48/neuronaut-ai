// app/lib/computePaths.ts

export type Risk = 'Low' | 'Medium' | 'High';
export type Pulse = 'Slow' | 'Moderate' | 'Fast';
export type Lang = 'en' | 'es';

export type PathResult = {
  id: 'A' | 'B';
  title: string;
  framing: string;
  tradeoff: string;
};

export function computePaths(input: {
  risk: Risk;
  pulse: Pulse;
  lang: Lang;
}): { pathA: PathResult; pathB: PathResult } {
  const { risk, pulse, lang } = input;

  const COPY = {
    en: {
      A: {
        title: 'Stabilize where you are',
        framing:
          'This path emphasizes continuity. You reduce disruption and create breathing room.',
        tradeoff:
          'Stress stays lower now, but relief arrives more gradually.',
      },
      B: {
        title: 'Create faster stability',
        framing:
          'This path emphasizes movement. You accept short-term friction.',
        tradeoff:
          'Effort increases upfront, but clarity arrives earlier.',
      },
    },
    es: {
      A: {
        title: 'Estabilizar donde estás',
        framing:
          'Este camino prioriza la continuidad. Reduces la disrupción y ganas margen.',
        tradeoff:
          'El estrés baja ahora, pero el alivio llega más gradualmente.',
      },
      B: {
        title: 'Crear estabilidad más rápida',
        framing:
          'Este camino prioriza el movimiento. Aceptas fricción a corto plazo.',
        tradeoff:
          'Más esfuerzo ahora, pero claridad antes.',
      },
    },
  }[lang];

  let pathA: PathResult = {
    id: 'A',
    title: COPY.A.title,
    framing: COPY.A.framing,
    tradeoff: COPY.A.tradeoff,
  };

  let pathB: PathResult = {
    id: 'B',
    title: COPY.B.title,
    framing: COPY.B.framing,
    tradeoff: COPY.B.tradeoff,
  };

  if (risk === 'High') {
    pathA.tradeoff +=
      lang === 'en'
        ? ' Pressure may continue underneath.'
        : ' La presión puede continuar debajo.';
    pathB.tradeoff +=
      lang === 'en'
        ? ' Disruption is likely but safer.'
        : ' Habrá disrupción, pero es más seguro.';
  }

  if (pulse === 'Fast') {
    pathA.tradeoff +=
      lang === 'en'
        ? ' Timing risk increases.'
        : ' El riesgo de tiempo aumenta.';
    pathB.tradeoff +=
      lang === 'en'
        ? ' Acting fast matters.'
        : ' Actuar rápido importa.';
  }

  return { pathA, pathB };
}
