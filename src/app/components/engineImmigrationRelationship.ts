export type Lang = 'en' | 'es';

export type ImmigrationRelationshipInput = {
  legalStatus: 'independent' | 'in-process' | 'dependent';
  relationshipStability: 'stable' | 'uncertain' | 'fragile';
  financialIndependence: 'independent' | 'partial' | 'dependent';
  emotionalSecurity: 'secure' | 'anxious' | 'unstable';
};

export function evaluateImmigrationRelationship(
  input: ImmigrationRelationshipInput
) {
  let primaryRisk: 'time' | 'money' | 'stress' = 'time';
  let reversibility = '6–12 months';

  if (input.legalStatus === 'dependent') {
    primaryRisk = 'time';
    reversibility = '3–6 months';
  }

  if (input.financialIndependence === 'dependent') {
    primaryRisk = 'money';
    reversibility = '1–3 months';
  }

  if (
    input.relationshipStability === 'fragile' ||
    input.emotionalSecurity === 'unstable'
  ) {
    primaryRisk = 'stress';
  }

  return {
    primaryRisk,
    reversibility,
    trajectory: 'worsening' as const,
  };
}

export const immigrationRelationshipQuestions: Record<Lang, string[]> = {
  en: [
    'How independent is your legal status right now?',
    'How stable does this relationship feel?',
    'How financially independent are you?',
    'Emotionally, how secure do you feel in this situation?',
  ],
  es: [
    '¿Qué tan independiente es tu estatus legal ahora?',
    '¿Qué tan estable se siente esta relación?',
    '¿Qué tan independiente eres financieramente?',
    'Emocionalmente, ¿qué tan seguro te sientes en esta situación?',
  ],
};
