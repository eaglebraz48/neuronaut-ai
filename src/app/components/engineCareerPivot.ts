export type Lang = 'en' | 'es';

export type CareerPivotInput = {
  incomePressure: 'low' | 'medium' | 'high';
  skillRelevance: 'growing' | 'stagnant' | 'declining';
  optionality: 'high' | 'medium' | 'low';
  stress: 'low' | 'medium' | 'high';
};

export function evaluateCareerPivot(input: CareerPivotInput) {
  let primaryRisk: 'time' | 'money' | 'stress' = 'time';
  let reversibility = '6–12 months';

  if (input.incomePressure === 'high') {
    primaryRisk = 'money';
    reversibility = '1–3 months';
  }

  if (input.skillRelevance === 'declining') {
    primaryRisk = 'time';
    reversibility = '3–6 months';
  }

  if (input.optionality === 'low' || input.stress === 'high') {
    primaryRisk = 'stress';
  }

  return {
    primaryRisk,
    reversibility,
    trajectory: 'worsening' as const,
  };
}

export const careerPivotQuestions: Record<Lang, string[]> = {
  en: [
    'How strong is your current income pressure?',
    'Are your skills becoming more or less relevant?',
    'How many realistic options do you have right now?',
    'How much stress is this decision causing?',
  ],
  es: [
    '¿Qué tan fuerte es la presión sobre tus ingresos?',
    '¿Tus habilidades están ganando o perdiendo relevancia?',
    '¿Cuántas opciones reales tienes ahora?',
    '¿Cuánto estrés te genera esta decisión?',
  ],
};
