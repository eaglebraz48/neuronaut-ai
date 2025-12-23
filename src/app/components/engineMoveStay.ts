export type Lang = 'en' | 'es';

export type MoveStayInput = {
  financialFlexibility: 'low' | 'medium' | 'high';
  localOpportunities: 'improving' | 'stable' | 'declining';
  personalTies: 'weak' | 'moderate' | 'strong';
  emotionalState: 'calm' | 'uneasy' | 'stuck';
};

export function evaluateMoveStay(input: MoveStayInput) {
  let primaryRisk: 'time' | 'money' | 'stress' = 'time';
  let reversibility = '6–12 months';

  if (input.financialFlexibility === 'low') {
    primaryRisk = 'money';
    reversibility = '1–3 months';
  }

  if (input.localOpportunities === 'declining') {
    primaryRisk = 'time';
    reversibility = '3–6 months';
  }

  if (input.emotionalState === 'stuck' || input.personalTies === 'strong') {
    primaryRisk = 'stress';
  }

  return {
    primaryRisk,
    reversibility,
    trajectory: 'worsening' as const,
  };
}

export const moveStayQuestions: Record<Lang, string[]> = {
  en: [
    'How flexible are you financially right now?',
    'Are opportunities where you live improving or declining?',
    'How strong are your personal ties to this place?',
    'Emotionally, how does staying here feel?',
  ],
  es: [
    '¿Qué tan flexible estás financieramente ahora?',
    '¿Las oportunidades donde vives están mejorando o empeorando?',
    '¿Qué tan fuertes son tus vínculos personales en este lugar?',
    'Emocionalmente, ¿cómo se siente quedarte aquí?',
  ],
};
