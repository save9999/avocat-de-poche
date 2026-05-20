"use client";

interface LawyerHandoffProps {
  onOpenPlan: () => void;
  specialtyLabel?: string | null;
}

export function LawyerHandoff({
  onOpenPlan,
  specialtyLabel,
}: LawyerHandoffProps) {
  return (
    <div className="fade-in rounded-2xl border border-sage-200 bg-gradient-to-br from-sage-50 to-white p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sage-700 text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M16 11a4 4 0 11-8 0 4 4 0 018 0zM12 14v7M5 21h14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-sage-700">
            Étape suivante recommandée
          </p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-midnight-900">
            Parlez à un avocat spécialisé
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-midnight-700">
            {specialtyLabel ? (
              <>
                Selon votre situation, la spécialité pertinente est{" "}
                <span className="font-semibold text-midnight-900">
                  {specialtyLabel}
                </span>
                . Nous vous proposons 3 voies sérieuses pour entrer en
                relation avec un avocat compétent — annuaire officiel,
                plateforme de mise en relation, ou aide juridictionnelle.
              </>
            ) : (
              <>
                Nous identifions automatiquement la spécialité juridique
                adaptée à votre cas, puis nous vous proposons 3 voies
                sérieuses pour consulter un avocat.
              </>
            )}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPlan}
              className="inline-flex items-center gap-2 rounded-xl bg-sage-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-800"
            >
              Voir les options de mise en relation
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14m-6-6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <p className="text-xs text-midnight-500">
              Lettre de signalement, preuves et contacts d'urgence
              également disponibles dans le panneau.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
