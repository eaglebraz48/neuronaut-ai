'use client';

type Props = {
  onAgree: () => void;
};

export default function PrivacyLiteModal({ onAgree }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-lg bg-neutral-900 text-neutral-200 shadow-xl">
        
        {/* Header */}
        <div className="border-b border-neutral-700 px-6 py-4">
          <h2 className="text-lg font-semibold">Privacy & Memory</h2>
          <p className="text-xs text-neutral-400">
            Please read before continuing
          </p>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[55vh] overflow-y-auto px-6 py-4 text-sm space-y-8">

          {/* ENGLISH */}
          <section>
            <h3 className="font-medium mb-2">EN — Privacy & Memory</h3>

            <Block
              title="What Neuronaut remembers"
              items={[
                'Your answers to decision questions',
                'Changes you choose to share (income, stress, time)',
                'Past decision snapshots to track progress',
              ]}
            />

            <Block
              title="What Neuronaut does NOT store"
              items={[
                'Legal documents',
                'Exact dollar amounts',
                'Employer names',
                'Immigration case numbers',
                'Personal messages or files',
              ]}
            />

            <Block
              title="How your data is used"
              items={[
                'Only to show how your situation changes over time',
                'Never to give legal advice',
                'Never sold or shared with third parties',
              ]}
            />

            <Block
              title="Your control"
              items={[
                'You choose when to save',
                'You can stop tracking anytime',
                'You can delete your history',
              ]}
            />

            <p className="italic text-neutral-400 mt-3">
              Neuronaut exists to help you think clearly — not to collect data.
            </p>
          </section>

          {/* SPANISH */}
          <section>
            <h3 className="font-medium mb-2">ES — Privacidad y memoria</h3>

            <Block
              title="Lo que Neuronaut recuerda"
              items={[
                'Tus respuestas a las decisiones',
                'Cambios que elijas compartir (ingresos, estrés, tiempo)',
                'Estados anteriores para seguir tu progreso',
              ]}
            />

            <Block
              title="Lo que Neuronaut NO guarda"
              items={[
                'Documentos legales',
                'Cantidades exactas de dinero',
                'Nombres de empleadores',
                'Números de casos migratorios',
                'Mensajes personales o archivos',
              ]}
            />

            <Block
              title="Cómo se usa tu información"
              items={[
                'Solo para mostrar cómo cambia tu situación con el tiempo',
                'Nunca para dar asesoría legal',
                'Nunca se vende ni se comparte con terceros',
              ]}
            />

            <Block
              title="Tu control"
              items={[
                'Tú decides cuándo guardar',
                'Puedes dejar de usar el seguimiento cuando quieras',
                'Puedes borrar tu historial',
              ]}
            />

            <p className="italic text-neutral-400 mt-3">
              Neuronaut existe para ayudarte a pensar con claridad — no para recolectar datos.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-700 px-6 py-4 flex justify-end">
          <button
            onClick={onAgree}
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium hover:bg-blue-500"
          >
            I Agree / Estoy de acuerdo
          </button>
        </div>
      </div>
    </div>
  );
}

function Block({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="mb-3">
      <h4 className="font-medium mb-1">{title}</h4>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
