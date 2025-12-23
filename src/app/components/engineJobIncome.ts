export type Lang = 'en' | 'es';

export type JobIncomeInput = {
  incomeStatus: 'stable' | 'unstable' | 'lost' | 'none';
  runway: '<1' | '1-3' | '3-6' | '6+';
  stress: 'low' | 'medium' | 'high' | 'severe';
  dependents: 'none' | 'partial' | 'full';
  trajectory: 'improving' | 'stable' | 'worsening';
};

export function evaluateJobIncome(input: JobIncomeInput) {
  let primaryRisk: 'time' | 'money' | 'stress' = 'time';
  let reversibility = '3–6 months';

  if (input.runway === '<1' || input.runway === '1-3') {
    primaryRisk = 'money';
    reversibility = 'Immediate';
  }

  if (input.stress === 'high' || input.stress === 'severe') {
    primaryRisk = 'stress';
  }

  if (input.trajectory === 'worsening' && input.runway === '<1') {
    primaryRisk = 'money';
    reversibility = 'Weeks';
  }

  return {
    primaryRisk,
    reversibility,
    trajectory: input.trajectory,
  };
}

export const jobIncomeQuestions: Record<Lang, string[]> = {
  en: [
    'How stable is your income right now?',
    'How long could you cover expenses if nothing changes?',
    'How much mental energy is this situation taking?',
    'Does anyone depend on your income?',
    'Compared to 3 months ago, does this feel better or worse?',
  ],
  es: [
    '¿Qué tan estable es tu ingreso actualmente?',
    '¿Cuánto tiempo podrías cubrir tus gastos si nada cambia?',
    '¿Cuánta energía mental te está consumiendo esta situación?',
    '¿Alguien depende de tus ingresos?',
    'Comparado con hace 3 meses, ¿esto se siente mejor o peor?',
  ],
};
