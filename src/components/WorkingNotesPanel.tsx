'use client';

import { useEffect, useState } from 'react';

type WorkingNote = {
  id: string;
  text: string;
};

export default function WorkingNotesPanel() {
  const [notes, setNotes] = useState<WorkingNote[]>([]);

  useEffect(() => {
    fetch('/api/working-notes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.notes)) {
          setNotes(data.notes);
        }
      })
      .catch(() => {});
  }, []);

  if (notes.length === 0) return null;

  return (
    <div style={panel}>
      <div style={title}>Working notes</div>

      {notes.map((n) => (
        <div key={n.id} style={note}>
          • {n.text}
        </div>
      ))}

      <div style={hint}>
        High-level notes only. No plans. No pressure.
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const panel = {
  position: 'fixed' as const,
  top: 120,
  right: 36,
  width: 280,
  padding: 16,
  borderRadius: 14,
  background: 'rgba(12,18,32,0.92)',
  border: '1px solid rgba(122,162,255,0.25)',
  color: '#fff',
  zIndex: 3,
};

const title = {
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 10,
  color: '#7aa2ff',
};

const note = {
  fontSize: 13,
  marginBottom: 8,
  lineHeight: 1.4,
};

const hint = {
  marginTop: 10,
  fontSize: 11,
  opacity: 0.5,
};
