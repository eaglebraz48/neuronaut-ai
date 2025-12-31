export type WorkingNote = {
  id: string;
  text: string;
};

/*
  Rules:
  - Only capture concrete user-stated options or decisions
  - No dates
  - No pressure
  - Rephrased, high-level
*/

export function extractWorkingNote(message: string): string | null {
  const lower = message.toLowerCase();

  if (
    lower.includes('i will') ||
    lower.includes('i might') ||
    lower.includes('i am thinking about') ||
    lower.includes('i plan to') ||
    lower.includes('option')
  ) {
    return message
      .replace(/^i\s+/i, '')
      .replace(/\.$/, '')
      .trim();
  }

  return null;
}
