'use client';

import DecisionSnapshot from '../components/DecisionSnapshot';
import { evaluateCareerPivot } from '../components/engineCareerPivot';

export default function TestCareerPage() {
  const result = evaluateCareerPivot({
    incomePressure: 'high',
    skillRelevance: 'declining',
    fearSource: 'time',
    optionality: 'low',
  });

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: '0 auto' }}>
      <DecisionSnapshot
        lang="en"
        primaryRisk={result.primaryRisk}
        reversibility={result.reversibility}
        trajectory={result.trajectory}
      />

      <div style={{ marginTop: 40, display: 'flex', gap: 16 }}>
        <Link href={`/dashboard?lang=en`} style={secondaryBtn}>
          Back to Dashboard
        </Link>

        <Link href={`/paths?lang=en`} style={primaryBtn}>
          Explore Next Path
        </Link>
      </div>
    </main>
  );
}

/* ---------- UI helpers ---------- */
const primaryBtn = {
  padding: '12px 18px',
  borderRadius: 8,
  background: 'linear-gradient(135deg, #4fa3ff, #7ab8ff)',
  color: '#000',
  fontWeight: 700,
  textDecoration: 'none',
};

const secondaryBtn = {
  padding: '12px 18px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.25)',
  color: '#fff',
  textDecoration: 'none',
};
