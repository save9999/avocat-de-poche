import { ThemeCard } from "@/components/ThemeCard";
import {
  BriefcaseIcon,
  HomeIcon,
  ScaleIcon,
  ShieldIcon,
} from "@/components/ScaleIcon";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-midnight-50 via-white to-midnight-50">
      <header className="border-b border-midnight-100 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-midnight-900 text-white">
              <ScaleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold leading-none text-midnight-900">
                Avocat de Poche
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-midnight-500">
                Vulgarisation juridique
              </p>
            </div>
          </div>
          <a
            href="#themes"
            className="hidden text-sm font-medium text-midnight-700 hover:text-midnight-900 sm:inline-block"
          >
            Voir les thématiques
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-12 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-sage-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-sage-700">
          <span className="h-1.5 w-1.5 rounded-full bg-sage-600"></span>
          Outil d'information juridique français
        </span>
        <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-midnight-900 sm:text-5xl md:text-6xl">
          Comprendre la loi
          <br />
          <span className="text-sage-700">pour reprendre la main.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-midnight-700 sm:text-lg">
          Avocat de Poche vous accompagne dans la lecture du droit français,
          cite les articles applicables à votre situation et vous aide à
          construire un plan d'action concret : lettre de signalement,
          checklist des preuves, contacts utiles.
        </p>
        <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:text-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            <strong>Important :</strong> cet outil ne remplace pas la
            consultation d'un avocat.
          </span>
        </div>
      </section>

      <section id="themes" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold text-midnight-900 sm:text-3xl">
            Choisissez votre situation
          </h2>
          <p className="hidden text-sm text-midnight-500 sm:block">
            1 module disponible · 2 à venir
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ThemeCard
            title="Harcèlement scolaire"
            description="Identifier les faits, citer les articles applicables (Code pénal, Code de l'éducation), construire votre lettre de signalement et votre dossier de preuves."
            icon={<ShieldIcon className="h-6 w-6" />}
            href="/chat"
            accent="active"
          />
          <ThemeCard
            title="Droit du travail"
            description="Litiges contractuels, licenciement, harcèlement professionnel, droits du salarié et procédures aux prud'hommes."
            icon={<BriefcaseIcon className="h-6 w-6" />}
            disabled
          />
          <ThemeCard
            title="Logement & bail"
            description="Locataire et propriétaire, charges, dépôt de garantie, troubles de voisinage, expulsion et conciliation."
            icon={<HomeIcon className="h-6 w-6" />}
            disabled
          />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 rounded-3xl border border-midnight-100 bg-white p-8 sm:grid-cols-3 sm:p-10">
          <Feature
            title="Articles de loi vérifiés"
            description="Base de données structurée : Code pénal, Code de l'éducation, Code de procédure pénale."
          />
          <Feature
            title="Plan d'action concret"
            description="Lettre type, checklist des preuves, contacts d'urgence — générés à la fin du dialogue."
          />
          <Feature
            title="Ton neutre et empathique"
            description="Aucun avis personnel, aucune décision à votre place. Vous restez maître de vos choix."
          />
        </div>
      </section>

      <footer className="border-t border-midnight-100 bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-midnight-500">
          Avocat de Poche · Information juridique fondée sur le droit français
          en vigueur · Ce service ne constitue pas une consultation juridique.
        </div>
      </footer>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-sage-100 text-sage-700">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M5 12l5 5L20 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="font-serif text-lg font-semibold text-midnight-900">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-midnight-600">
        {description}
      </p>
    </div>
  );
}
