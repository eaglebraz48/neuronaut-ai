export type CareerPivotInput = {
  incomePressure: 'low' | 'medium' | 'high';
  skillRelevance: 'growing' | 'stagnant' | 'declining';
  fearSource: 'money' | 'identity' | 'time';
  optionality: 'high' | 'medium' | 'low';
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

  if (input.optionality === 'low') {
    primaryRisk = 'stress';
  }

  return {
    primaryRisk,
    reversibility,
    trajectory: 'worsening' as const,
  };
}
