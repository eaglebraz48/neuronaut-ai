// Example code for move decision engine
export type MoveDecisionInput = {
  locationPreference: 'urban' | 'suburban' | 'rural';
  jobAvailability: 'high' | 'medium' | 'low';
  familyConsiderations: 'yes' | 'no';
};

export function evaluateMoveDecision(input: MoveDecisionInput) {
  let decision = 'stay_in_current_location';
  let riskFactor = 'low';

  if (input.jobAvailability === 'low') {
    decision = 'move_to_new_location';
    riskFactor = 'high';
  }

  if (input.locationPreference === 'suburban' && input.familyConsiderations === 'yes') {
    decision = 'move_to_suburban_area';
    riskFactor = 'medium';
  }

  return {
    decision,
    riskFactor,
    recommendation: 'research_new_location',
  };
}
