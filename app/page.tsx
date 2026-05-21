import Link from "next/link";
import { ScaleIcon, ShieldIcon, BriefcaseIcon, HomeIcon } from "@/components/ScaleIcon";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StepProps {
  number: string;
  title: string;
  description: string;
}

interface SituationProps {
  emoji: string;
  title: string;
  examples: string;
}

interface TestimonialProps {
  quote: string;
  author: string;
}

interface FaqItemProps {
  question: string;
  answer: string;
}

// ─── Composants locaux ────────────────────────────────────────────────────────

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </div>
      <h3 className="font-serif text-lg font-semibold text-midnight-900">{title}</h3>
      <p className="text-sm leading-relaxed text-midnight-600">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-midnight-900 font-serif text-xl font-semibold text-white">
        {number}
      </div>
      <div className="mt-1 h-px w-12 bg-midnight-200 sm:hidden" />
      <h3 className="mt-4 font-serif text-xl font-semibold text-midnight-900">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-midnight-600">{description}</p>
    </div>
  );
}

function Situation({ emoji, title, examples }: SituationProps) {
  return (
    <div className="rounded-2xl border border-midnight-100 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm">
      <div className="mb-3 text-2xl">{emoji}</div>
      <h3 className="font-serif text-base font-semibold text-midnight-900">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-midnight-500">{examples}</p>
    </div>
  );
}

function Testimonial({ quote, author }: TestimonialProps) {
  return (
    <div className="rounded-2xl border border-midnight-100 bg-white p-6">
      <svg className="mb-4 h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <p className="text-sm leading-relaxed text-midnight-700 italic">{quote}</p>
      <p className="mt-4 text-xs font-medium text-midnight-500">{author}</p>
    </div>
  );
}

function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <div className="border-b border-midnight-100 py-5 last:border-0">
      <h3 className="font-serif text-base font-semibold text-midnight-900">{question}</h3>
      <p className="mt-2 text-sm leading-relaxed text-midnight-600">{answer}</p>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-midnight-50 via-white to-midnight-50">

      {/* ── Bandeau urgence ── */}
      <div className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-center text-xs text-red-800">
        <strong>Urgence ?</strong>{" "}
        Appelez le{" "}
        <a href="tel:3018" className="font-bold underline hover:text-red-900">3018</a>{" "}
        (Net Écoute, gratuit 24h/24) ou le{" "}
        <a href="tel:119" className="font-bold underline hover:text-red-900">119</a>{" "}
        (Allô Enfance en Danger)
      </div>

      {/* ── Header ── */}
      <header className="border-b border-midnight-100 bg-white/80 backdrop-blur-sm">
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
                Information juridique
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 sm:flex">
            <a href="#comment-ca-marche" className="text-sm text-midnight-600 hover:text-midnight-900">
              Comment ça marche
            </a>
            <a href="#situations" className="text-sm text-midnight-600 hover:text-midnight-900">
              Situations
            </a>
            <a href="#faq" className="text-sm text-midnight-600 hover:text-midnight-900">
              FAQ
            </a>
          </nav>
          <Link
            href="/chat"
            className="rounded-xl bg-midnight-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-midnight-800"
          >
            Poser une question
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Gratuit · Disponible 24h/24 · Droit français
        </span>

        <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-midnight-900 sm:text-5xl">
          Vous n'êtes pas seuls.
          <br />
          <span className="text-blue-700">Comprenez vos droits, passez à l'action.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-midnight-700 sm:text-lg">
          Face au harcèlement scolaire, chaque famille mérite des réponses claires et rapides.
          Notre assistant juridique cite les lois applicables, guide vos démarches et vous
          aide à construire un dossier solide — 24h/24, en toute confidentialité.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-2xl bg-midnight-900 px-8 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-midnight-800"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Poser ma première question
          </Link>
          <a
            href="#comment-ca-marche"
            className="text-sm font-medium text-midnight-600 underline-offset-2 hover:text-midnight-900 hover:underline"
          >
            Comment ça fonctionne ?
          </a>
        </div>

        {/* Disclaimer visible */}
        <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:text-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          <span>
            <strong>Information :</strong> cet outil ne remplace pas la consultation d'un avocat. Il vous aide à comprendre vos droits.
          </span>
        </div>
      </section>

      {/* ── Numéros d'urgence ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-8">
          <div className="mb-6 text-center">
            <h2 className="font-serif text-2xl font-semibold text-midnight-900">
              Numéros d'urgence — disponibles maintenant
            </h2>
            <p className="mt-2 text-sm text-midnight-600">
              Si vous ou votre enfant êtes en danger immédiat, contactez ces services gratuitement.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="tel:3018"
              className="flex flex-col items-center rounded-2xl border border-red-200 bg-white p-5 text-center transition hover:border-red-300 hover:shadow-sm"
            >
              <span className="font-serif text-4xl font-bold text-red-600">3018</span>
              <span className="mt-2 text-sm font-semibold text-midnight-900">Net Écoute</span>
              <span className="mt-1 text-xs text-midnight-500">Cyberharcèlement · 24h/24 · Gratuit</span>
            </a>
            <a
              href="tel:119"
              className="flex flex-col items-center rounded-2xl border border-orange-200 bg-white p-5 text-center transition hover:border-orange-300 hover:shadow-sm"
            >
              <span className="font-serif text-4xl font-bold text-orange-600">119</span>
              <span className="mt-2 text-sm font-semibold text-midnight-900">Allô Enfance en Danger</span>
              <span className="mt-1 text-xs text-midnight-500">Enfants en danger · 24h/24 · Gratuit</span>
            </a>
            <a
              href="tel:3020"
              className="flex flex-col items-center rounded-2xl border border-blue-200 bg-white p-5 text-center transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="font-serif text-4xl font-bold text-blue-600">3020</span>
              <span className="mt-2 text-sm font-semibold text-midnight-900">Harcèlement Scolaire</span>
              <span className="mt-1 text-xs text-midnight-500">Ligne nationale · Lun–Ven · Gratuit</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="comment-ca-marche" className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-semibold text-midnight-900">
            Simple, clair, rassurant
          </h2>
          <p className="mt-3 text-base text-midnight-600">
            En 3 étapes, obtenez des réponses concrètes adaptées à votre situation.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Ligne de connexion (desktop) */}
          <div className="absolute left-1/3 right-1/3 top-6 hidden h-px bg-midnight-200 sm:block" />

          <Step
            number="1"
            title="Décrivez la situation"
            description="Expliquez en vos mots ce qui se passe : qui est concerné, depuis quand, quels types de faits."
          />
          <Step
            number="2"
            title="Recevez les réponses juridiques"
            description="Notre IA cite les articles du Code pénal et de l'Éducation nationale applicables à votre cas."
          />
          <Step
            number="3"
            title="Agissez avec votre plan"
            description="Lettre de signalement, checklist de preuves, contacts d'avocats spécialisés — tout est généré pour vous."
          />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-sage-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sage-800"
          >
            Commencer maintenant — c'est gratuit
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Situations couvertes ── */}
      <section id="situations" className="bg-midnight-50/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-3xl font-semibold text-midnight-900">
              Quelles situations sont couvertes ?
            </h2>
            <p className="mt-3 text-base text-midnight-600">
              Du harcèlement physique au cyber-harcèlement, nous couvrons l'ensemble des situations définies par le droit français.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Situation
              emoji="💬"
              title="Harcèlement verbal"
              examples="Insultes répétées, moqueries, rumeurs, humiliations devant les autres"
            />
            <Situation
              emoji="📱"
              title="Cyberharcèlement"
              examples="Messages haineux, deepfakes, publications vexatoires, exclusion de groupes"
            />
            <Situation
              emoji="👊"
              title="Violences physiques"
              examples="Coups, bousculades répétées, intimidations, vol ou destruction d'affaires"
            />
            <Situation
              emoji="🚫"
              title="Mise à l'écart"
              examples="Exclusion sociale délibérée et répétée, ostracisme, isolement forcé"
            />
            <Situation
              emoji="⚖️"
              title="Discrimination"
              examples="Racisme, LGBTphobie, handiphobie, antisémitisme, islamophobie"
            />
            <Situation
              emoji="📸"
              title="Sexting non consenti"
              examples="Diffusion d'images intimes, sextorsion, pression à envoyer des photos"
            />
            <Situation
              emoji="🏫"
              title="Inaction de l'école"
              examples="Signalement ignoré, pas de mesures, minimisation par la direction"
            />
            <Situation
              emoji="👨‍👩‍👧"
              title="Harcèlement d'adultes"
              examples="Enseignant·e ou CPE auteur de harcèlement envers un·e élève"
            />
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-semibold text-midnight-900">
            Un outil conçu pour vous accompagner, pas pour vous juger
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Articles de loi vérifiés"
            description="Code pénal, Code de l'éducation, Code de procédure pénale — chaque réponse cite les textes exacts en vigueur."
          />
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Plan d'action concret"
            description="Lettre de signalement à la direction, checklist des preuves à conserver, contacts d'urgence — générés en fin de dialogue."
          />
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Confidentialité totale"
            description="Aucun compte requis. Aucune donnée personnelle stockée. Vos échanges restent privés et disparaissent à la fermeture."
          />
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Ton empathique"
            description="Notre assistant comprend que derrière chaque question se cache une vraie souffrance. Il répond avec bienveillance et sérieux."
          />
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Disponible 24h/24"
            description="Pas d'attente, pas de rendez-vous à décrocher. Vous pouvez poser vos questions à n'importe quelle heure, y compris la nuit."
          />
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Mise en relation professionnelle"
            description="Si votre situation le nécessite, l'outil identifie la spécialité juridique adaptée et vous oriente vers des avocats compétents."
          />
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section className="bg-midnight-50/60 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-3xl font-semibold text-midnight-900">
              Des familles qui ont trouvé les bonnes réponses
            </h2>
            <p className="mt-3 text-sm text-midnight-500">
              Témoignages anonymisés avec accord des familles
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Testimonial
              quote="Je ne savais pas du tout quoi faire. En 10 minutes, j'avais les articles de loi, un modèle de lettre pour le directeur et le numéro de l'inspecteur académique. Ma fille a pu respirer à nouveau."
              author="Mère d'une élève de 4e, région Île-de-France"
            />
            <Testimonial
              quote="Mon fils subissait du cyberharcèlement depuis 3 mois. L'outil m'a expliqué ce que risquait légalement l'auteur et comment signaler les publications. On n'était plus seuls face à ça."
              author="Père d'un lycéen, région Auvergne-Rhône-Alpes"
            />
            <Testimonial
              quote="J'avais honte d'en parler à l'école. Ici j'ai pu écrire ce qui m'arrivait sans me sentir jugée. J'ai compris que ce que je vivais avait un nom et que la loi me protégeait."
              author="Élève de terminale, 17 ans, Paris"
            />
          </div>
        </div>
      </section>

      {/* ── Modèle économique / Gratuité ── */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 sm:p-10">
          <div className="mb-2 text-3xl">🤝</div>
          <h2 className="font-serif text-2xl font-semibold text-midnight-900">
            Gratuit pour toutes les victimes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-midnight-700">
            Avocat de Poche est entièrement gratuit. Nous croyons que l'accès à l'information
            juridique ne devrait pas dépendre des moyens financiers des familles.
            Si vous souhaitez soutenir ce projet, une contribution libre est possible.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/chat"
              className="rounded-xl bg-midnight-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-midnight-800"
            >
              Utiliser l'outil gratuitement
            </Link>
            <a
              href="https://ko-fi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-midnight-200 bg-white px-6 py-3 text-sm font-medium text-midnight-700 transition hover:border-midnight-300 hover:text-midnight-900"
            >
              Faire un don (contribution libre)
            </a>
          </div>
        </div>
      </section>

      {/* ── Partenaires ── */}
      <section className="border-t border-midnight-100 bg-white py-12">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-6 text-center text-xs uppercase tracking-widest text-midnight-400">
            Ressources partenaires recommandées
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { name: "e-Enfance / 3018", url: "https://www.e-enfance.org" },
              { name: "Non au Harcèlement", url: "https://www.nonauharcelement.education.gouv.fr" },
              { name: "Défenseur des droits", url: "https://www.defenseurdesdroits.fr" },
              { name: "Fil Santé Jeunes", url: "https://www.filsantejeunes.com" },
            ].map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-midnight-600 transition hover:text-midnight-900"
              >
                {p.name} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-semibold text-midnight-900">
            Questions fréquentes
          </h2>
        </div>

        <div className="rounded-3xl border border-midnight-100 bg-white p-6 sm:p-8">
          <FaqItem
            question="Est-ce vraiment gratuit ?"
            answer="Oui, entièrement. Aucun abonnement, aucune carte bancaire. L'outil est financé par des dons et des contributions bénévoles. Si vous souhaitez soutenir le projet, une contribution libre est bienvenue mais jamais obligatoire."
          />
          <FaqItem
            question="Mes données sont-elles conservées ?"
            answer="Non. Aucun compte n'est requis. Vos messages ne sont ni stockés, ni partagés, ni revendus. La conversation disparaît quand vous fermez la page. Votre vie privée est protégée par défaut."
          />
          <FaqItem
            question="L'outil peut-il remplacer un avocat ?"
            answer="Non, et nous le disons clairement. Avocat de Poche est un outil d'information juridique. Il vous aide à comprendre la loi et à vous préparer, mais ne constitue pas une consultation juridique. Si votre situation est grave, nous vous orientons vers des professionnels compétents."
          />
          <FaqItem
            question="Mon enfant peut-il l'utiliser seul ?"
            answer="Oui. L'interface est conçue pour être accessible aux adolescents. Le ton est rassurant, les réponses sont en français courant. Il est cependant préférable qu'un adulte accompagne l'enfant pour les démarches concrètes (signalement, dépôt de plainte)."
          />
          <FaqItem
            question="Que se passe-t-il si j'ai besoin d'aide immédiate ?"
            answer="Si vous ou votre enfant êtes en danger immédiat, appelez le 17 (Police), le 119 (Allô Enfance en Danger) ou le 3018 (Net Écoute pour le cyberharcèlement). Ces numéros sont gratuits et disponibles 24h/24."
          />
          <FaqItem
            question="L'outil couvre-t-il le harcèlement entre adultes à l'école ?"
            answer="Oui. Si un enseignant, un CPE ou un autre adulte de l'établissement est l'auteur de comportements abusifs envers un élève, l'outil vous informe des recours spécifiques (signalement au rectorat, plainte pénale, etc.)."
          />
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="bg-midnight-900 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-3xl font-semibold text-white">
            Chaque jour compte. Agissez maintenant.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-midnight-200">
            Le harcèlement scolaire n'est pas une fatalité. La loi protège les victimes.
            Posez votre question — une réponse claire vous attend en quelques secondes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/chat"
              className="rounded-2xl bg-white px-8 py-4 text-base font-semibold text-midnight-900 shadow-soft transition hover:bg-midnight-50"
            >
              Obtenir de l'aide maintenant
            </Link>
            <div className="flex items-center gap-4 text-sm text-midnight-400">
              <span>Urgence :</span>
              <a href="tel:3018" className="font-bold text-white hover:underline">3018</a>
              <a href="tel:119" className="font-bold text-white hover:underline">119</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-midnight-800 bg-midnight-900">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-midnight-700 text-white">
                  <ScaleIcon className="h-4 w-4" />
                </div>
                <p className="font-serif text-base font-semibold text-white">Avocat de Poche</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-midnight-400">
                Information juridique sur le harcèlement scolaire en France.
                Gratuit, confidentiel, disponible 24h/24.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-midnight-500">Urgences</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="tel:3018" className="text-midnight-300 hover:text-white">3018 — Net Écoute (cyberharcèlement)</a></li>
                <li><a href="tel:119" className="text-midnight-300 hover:text-white">119 — Allô Enfance en Danger</a></li>
                <li><a href="tel:3020" className="text-midnight-300 hover:text-white">3020 — Harcèlement scolaire</a></li>
                <li><a href="tel:17" className="text-midnight-300 hover:text-white">17 — Police (danger immédiat)</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-midnight-500">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-midnight-400">Contact : contact@avocatdepoche.fr</span></li>
                <li><span className="text-midnight-400">Politique de confidentialité</span></li>
                <li><span className="text-midnight-400">Mentions légales</span></li>
                <li><span className="text-midnight-400">RGPD — aucune donnée stockée</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-midnight-800 pt-6 text-center text-xs text-midnight-500">
            <p>
              Avocat de Poche · Information juridique fondée sur le droit français en vigueur ·
              Ce service ne constitue pas une consultation juridique et ne remplace pas l'avis d'un professionnel du droit.
            </p>
            <p className="mt-1">© 2024 Avocat de Poche · Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
