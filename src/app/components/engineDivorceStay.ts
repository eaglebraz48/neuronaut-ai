export type Lang = 'en' | 'es';

export type DivorceStayInput = {
  emotionalDrain: 'low' | 'medium' | 'high';
  financialEntanglement: 'low' | 'medium' | 'high';
  communicationQuality: 'healthy' | 'strained' | 'broken';
  dependencyLevel: 'none' | 'partial' | 'high';
};

export function evaluateDivorceStay(input: DivorceStayInput) {
  let primaryRisk: 'time' | 'money' | 'stress' = 'stress';
  let reversibility = '6–12 months';

  if (input.emotionalDrain === 'high') {
    primaryRisk = 'stress';
    reversibility = '3–6 months';
  }

  if (input.financialEntanglement === 'high' || input.dependencyLevel === 'high') {
    primaryRisk = 'money';
    reversibility = '1–3 months';
  }

  if (input.communicationQuality === 'broken') {
    primaryRisk = 'time';
  }

  return {
    primaryRisk,
    reversibility,
    trajectory: 'worsening' as const,
  };
}

export const divorceStayQuestions: Record<Lang, string[]> = {
  en: [
    'How emotionally draining is this relationship right now?',
    'How financially entangled are you?',
    'How would you describe communication between you?',
    'How dependent is one partner on the other?',
  ],
  es: [
    '¿Qué tan emocionalmente agotadora es esta relación ahora?',
    '¿Qué tan entrelazados están financieramente?',
    '¿Cómo describirías la comunicación entre ustedes?',
    '¿Qué tan dependiente es una persona de la otra?',
  ],
};
