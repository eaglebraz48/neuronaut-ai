'use client';

import Link from 'next/link';

type Props = {
  lang: 'en' | 'es';
  primaryRisk: string;
  reversibility: string;
  trajectory: string;
};

export default function DecisionSnapshot({
  lang,
  primaryRisk,
  reversibility,
  trajectory,
}: Props) {
  const T = {
    en: {
      title: 'Decision snapshot',
      risk: 'Primary risk',
      window: 'Reversibility window',
      trajectory: 'Trajectory',
      next: 'See paths',
      back: 'Back',
    },
    es: {
      title: 'Resumen de decisión',
      risk: 'Riesgo principal',
      window: 'Ventana de reversibilidad',
      trajectory: 'Trayectoria',
      next: 'Ver caminos',
      back: 'Volver',
    },
  }[lang];

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{T.title}</h1>

      <div className="space-y-4">
        <div>
          <div className="text-sm opacity-70">{T.risk}</div>
          <div className="font-semibold">{primaryRisk}</div>
        </div>

        <div>
          <div className="text-sm opacity-70">{T.window}</div>
          <div className="font-semibold">{reversibility}</div>
        </div>

        <div>
          <div className="text-sm opacity-70">{T.trajectory}</div>
          <div className="font-semibold">{trajectory}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Link
          href={`/paths?lang=${lang}`}
          className="bg-[#38bdf8] text-black py-2 px-6 rounded-md font-semibold text-sm hover:bg-[#2ec3e8]"
        >
          {T.next}
        </Link>

        <Link
          href={`/dashboard?lang=${lang}`}
          className="border border-white/30 text-white py-2 px-6 rounded-md font-semibold text-sm"
        >
          {T.back}
        </Link>
      </div>
    </main>
  );
}
