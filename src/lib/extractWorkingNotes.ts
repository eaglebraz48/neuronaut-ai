export type WorkingNote = {
  id: string;
  text: string;
};

/**
 * Extracts high-level, non-binding working notes from a conversation.
 * Notes are exploratory, short-term, and concrete — never commitments.
 */
export function extractWorkingNotes(
  messages: { role: 'user' | 'assistant'; text: string }[],
  lang: 'en' | 'es'
): WorkingNote[] {
  const notes: WorkingNote[] = [];

  const userMessages = messages.filter((m) => m.role === 'user');

  userMessages.forEach((m, index) => {
    const t = m.text.toLowerCase();

    // ENGLISH
    if (lang === 'en') {
      if (t.includes('class') || t.includes('course') || t.includes('learn')) {
        notes.push({
          id: `note-${index}`,
          text: 'Exploring learning or classes as a short-term option.',
        });
      }

      if (t.includes('job') && (t.includes('lose') || t.includes('layoff'))) {
        notes.push({
          id: `note-${index}`,
          text: 'Concern about possible job loss; exploring backup paths.',
        });
      }

      if (t.includes('pet sitting') || t.includes('dogs')) {
        notes.push({
          id: `note-${index}`,
          text: 'Considering pet sitting as a potential income option.',
        });
      }

      if (t.includes('certificate') || t.includes('certification')) {
        notes.push({
          id: `note-${index}`,
          text: 'Looking into certifications to support a new skill or role.',
        });
      }
    }

    // SPANISH
    if (lang === 'es') {
      if (t.includes('curso') || t.includes('clase') || t.includes('aprender')) {
        notes.push({
          id: `note-${index}`,
          text: 'Explorando cursos o aprendizaje como opción a corto plazo.',
        });
      }

      if (
        t.includes('trabajo') &&
        (t.includes('perder') || t.includes('despido'))
      ) {
        notes.push({
          id: `note-${index}`,
          text: 'Preocupación por posible pérdida de trabajo; explorando alternativas.',
        });
      }

      if (t.includes('mascota') || t.includes('perros')) {
        notes.push({
          id: `note-${index}`,
          text: 'Considerando cuidado de mascotas como posible ingreso.',
        });
      }

      if (t.includes('certificado') || t.includes('certificación')) {
        notes.push({
          id: `note-${index}`,
          text: 'Buscando certificaciones para apoyar una nueva habilidad.',
        });
      }
    }
  });

  return dedupe(notes);
}

/* ================= HELPERS ================= */

function dedupe(notes: WorkingNote[]) {
  const seen = new Set<string>();
  return notes.filter((n) => {
    if (seen.has(n.text)) return false;
    seen.add(n.text);
    return true;
  });
}
