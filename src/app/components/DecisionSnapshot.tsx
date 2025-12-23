'use client';

type Lang = 'en' | 'es';

type SnapshotProps = {
  lang?: Lang;
  primaryRisk: 'time' | 'money' | 'stress';
  reversibility: string; // e.g. "3–6 months"
  trajectory: 'improving' | 'stable' | 'worsening';
};

const copy: Record<Lang, any> = {
  en: {
    headline: {
      time: 'Your biggest risk right now is time drift.',
      money: 'Your biggest risk right now is financial pressure.',
      stress: 'Your biggest risk right now is emotional overload.',
    },
    happening:
      'The pressure isn’t coming from one event — it’s coming from accumulation. As time passes without a stabilizing move, options narrow and stress takes more energy to manage.',
    reversibilityLabel: 'Reversibility window',
    reversibilityHelp:
      'Decisions made inside this window are easier to adjust. After it closes, changes tend to be more reactive and expensive.',
    silentCostTitle: 'If nothing changes',
    silentCosts: [
      'Financial pressure increases',
      'Mental bandwidth decreases',
      'Decisions become rushed, not clearer',
    ],
    closing: 'You’re not late — but momentum matters.',
  },
  es: {
    headline: {
      time: 'Tu mayor riesgo ahora es perder tiempo sin avanzar.',
      money: 'Tu mayor riesgo ahora es la presión financiera.',
      stress: 'Tu mayor riesgo ahora es la carga emocional.',
    },
    happening:
      'La presión no viene de un solo evento — viene de la acumulación. Con el tiempo, sin un movimiento estabilizador, las opciones se reducen y el estrés consume más energía.',
    reversibilityLabel: 'Ventana de reversibilidad',
    reversibilityHelp:
      'Las decisiones dentro de esta ventana son más fáciles de ajustar. Después, los cambios suelen ser más reactivos y costosos.',
    silentCostTitle: 'Si nada cambia',
    silentCosts: [
      'La presión financiera aumenta',
      'La claridad mental disminuye',
      'Las decisiones se vuelven apresuradas',
    ],
    closing: 'No es tarde — pero el impulso importa.',
  },
};

export default function DecisionSnapshot({
  lang = 'en',
  primaryRisk,
  reversibility,
}: SnapshotProps) {
  const t = copy[lang];

  return (
    <section className="mx-auto max-w-3xl px-6 py-10 text-neutral-200">
      <h2 className="mb-4 text-xl font-semibold">
        {t.headline[primaryRisk]}
      </h2>

      <p className="mb-6 text-sm text-neutral-300">
        {t.happening}
      </p>

      <div className="mb-6 rounded-md border border-neutral-700 p-4">
        <p className="text-sm font-medium">
          {t.reversibilityLabel}: <span className="font-semibold">{reversibility}</span>
        </p>
        <p className="mt-2 text-xs text-neutral-400">
          {t.reversibilityHelp}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium">
          {t.silentCostTitle}
        </h3>
        <ul className="list-disc pl-5 text-sm text-neutral-300 space-y-1">
          {t.silentCosts.map((c: string) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <p className="italic text-neutral-400">{t.closing}</p>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Link
          href={`/paths?lang=${lang}`}
          className="bg-[#38bdf8] text-black py-2 px-6 rounded-md font-semibold text-sm hover:bg-[#2ec3e8]"
        >
          Back to paths
        </Link>

        <Link
          href={`/dashboard?lang=${lang}`}
          className="bg-[#111827] text-white py-2 px-6 rounded-md font-semibold text-sm hover:bg-[#333c51]"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
