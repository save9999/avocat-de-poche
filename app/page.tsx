import Link from "next/link";
import { ScaleIcon } from "@/components/ScaleIcon";
import { DOMAIN_LIST, type DomainConfig } from "@/data/domains";

// ─── Couleurs par accent (Tailwind safe-list) ────────────────────────────────
const ACCENT: Record<
  DomainConfig["accent"],
  { bg: string; ring: string; iconBg: string; iconText: string; chip: string }
> = {
  blue: {
    bg: "bg-blue-50/60",
    ring: "ring-blue-200",
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
    chip: "text-blue-700",
  },
  emerald: {
    bg: "bg-emerald-50/60",
    ring: "ring-emerald-200",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    chip: "text-emerald-700",
  },
  amber: {
    bg: "bg-amber-50/60",
    ring: "ring-amber-200",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    chip: "text-amber-700",
  },
  violet: {
    bg: "bg-violet-50/60",
    ring: "ring-violet-200",
    iconBg: "bg-violet-100",
    iconText: "text-violet-700",
    chip: "text-violet-700",
  },
  rose: {
    bg: "bg-rose-50/60",
    ring: "ring-rose-200",
    iconBg: "bg-rose-100",
    iconText: "text-rose-700",
    chip: "text-rose-700",
  },
  slate: {
    bg: "bg-slate-50/60",
    ring: "ring-slate-200",
    iconBg: "bg-slate-100",
    iconText: "text-slate-700",
    chip: "text-slate-700",
  },
};

// Icônes minimalistes par domaine — 24×24, stroke 1.6
const DOMAIN_ICONS: Record<DomainConfig["id"], JSX.Element> = {
  "harcelement-scolaire": (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M12 3l8 3v6c0 4.5-3.5 8.5-8 9-4.5-.5-8-4.5-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  travail: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  logement: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-3v-6h-8v6H5a2 2 0 01-2-2v-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  consommation: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M3 4h2l2 12h11l2-9H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  famille: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 21c0-3 2.5-5 5-5s5 2 5 5M13 21c0-2.5 2-4.5 4.5-4.5S22 18.5 22 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  penal: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M12 3v18M5 20h14M6 6h12M6 6l-3 7c0 1.7 1.3 3 3 3s3-1.3 3-3l-3-7zM18 6l-3 7c0 1.7 1.3 3 3 3s3-1.3 3-3l-3-7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <div className="border-b border-midnight-100 py-5 last:border-0">
      <h3 className="text-base font-semibold text-midnight-900">{question}</h3>
      <p className="mt-2 text-sm leading-relaxed text-midnight-600">{answer}</p>
    </div>
  );
}

function DomainCard({ domain }: { domain: DomainConfig }) {
  const a = ACCENT[domain.accent];
  return (
    <Link
      href={`/chat?domain=${domain.id}`}
      className={`group relative flex flex-col rounded-2xl border border-midnight-100 ${a.bg} p-5 transition hover:-translate-y-0.5 hover:shadow-soft hover:ring-2 hover:${a.ring}`}
    >
      <div
        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${a.iconBg} ${a.iconText}`}
      >
        {DOMAIN_ICONS[domain.id]}
      </div>
      <h3 className="text-base font-semibold text-midnight-900">{domain.label}</h3>
      <p className="mt-1 text-sm leading-relaxed text-midnight-600">{domain.tagline}</p>
      <p className="mt-3 text-xs leading-relaxed text-midnight-500">{domain.description}</p>
      <div className={`mt-4 inline-flex items-center text-xs font-medium ${a.chip}`}>
        Poser ma question
        <svg viewBox="0 0 24 24" className="ml-1 h-3.5 w-3.5" fill="none">
          <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-gradient-to-b from-midnight-50 via-white to-midnight-50"
      tabIndex={-1}
    >
      {/* ── Bandeau urgence ── */}
      <div
        className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-center text-xs text-red-800 sm:text-sm"
        role="alert"
      >
        <strong>En danger ?</strong>{" "}
        <a href="tel:17" className="font-bold underline">17 / 112</a>{" "}
        — Violences conjugales : <a href="tel:3919" className="font-bold underline">3919</a>{" "}
        — Enfance en danger : <a href="tel:119" className="font-bold underline">119</a>{" "}
        — Cyberharcèlement : <a href="tel:3018" className="font-bold underline">3018</a>
      </div>

      {/* ── Header ── */}
      <header className="border-b border-midnight-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-midnight-900 text-white" aria-hidden="true">
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
          </Link>
          <nav className="hidden items-center gap-6 sm:flex" aria-label="Navigation principale">
            <a href="#domaines" className="text-sm text-midnight-600 hover:text-midnight-900">Domaines</a>
            <a href="#comment-ca-marche" className="text-sm text-midnight-600 hover:text-midnight-900">Comment ça marche</a>
            <a href="#faq" className="text-sm text-midnight-600 hover:text-midnight-900">FAQ</a>
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
      <section aria-labelledby="hero-title" className="mx-auto max-w-4xl px-6 pb-12 pt-16 text-center sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Gratuit · Disponible 24h/24 · Droit français
        </span>

        <h1 id="hero-title" className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-midnight-900 sm:text-4xl">
          Vos droits, expliqués simplement.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-midnight-600">
          Pour chaque situation de la vie — travail, logement, famille, achats, sécurité —
          notre assistant cite les articles de loi français applicables et vous guide
          jusqu'aux démarches concrètes.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#domaines"
            className="inline-flex items-center gap-2 rounded-xl bg-midnight-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-midnight-800"
          >
            Choisir mon domaine
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M19 12H5m6-6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 12 12)" />
            </svg>
          </a>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl border border-midnight-200 bg-white px-6 py-3 text-sm font-medium text-midnight-700 transition hover:border-midnight-300 hover:text-midnight-900"
          >
            Poser une question directement
          </Link>
        </div>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-900">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="none">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          <span>Information juridique — ne remplace pas la consultation d'un avocat.</span>
        </div>
      </section>

      {/* ── Domaines ── */}
      <section id="domaines" aria-labelledby="domaines-title" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <h2 id="domaines-title" className="text-2xl font-semibold tracking-tight text-midnight-900 sm:text-3xl">
            Pour quelle situation ?
          </h2>
          <p className="mt-2 text-sm text-midnight-600">
            6 domaines couverts — chaque réponse cite les articles de loi français en vigueur.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAIN_LIST.map((d) => (
            <DomainCard key={d.id} domain={d} />
          ))}
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="comment-ca-marche" className="border-t border-midnight-100 bg-white/50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-midnight-900 sm:text-3xl">
              Comment ça marche
            </h2>
            <p className="mt-2 text-sm text-midnight-600">
              En trois étapes, vous obtenez les bases juridiques + un plan d'action.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                n: "1",
                title: "Vous décrivez la situation",
                description: "Quelques phrases suffisent. Vous restez anonyme, aucune création de compte.",
              },
              {
                n: "2",
                title: "L'IA cherche les articles de loi",
                description: "Recherche vectorielle sur la base Légifrance ; les textes en vigueur sont cités avec leur référence exacte.",
              },
              {
                n: "3",
                title: "Vous repartez avec un plan",
                description: "Lettre type, checklist des preuves, contacts utiles, orientation vers un avocat spécialisé.",
              },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-midnight-900 text-base font-semibold text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 text-base font-semibold text-midnight-900">{s.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-midnight-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Urgences ── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-midnight-900 sm:text-2xl">
              En cas d'urgence
            </h2>
            <p className="mt-1.5 text-sm text-midnight-600">
              Si vous êtes en danger immédiat, ces lignes répondent maintenant.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { num: "17", label: "Police", note: "Danger immédiat", tone: "red" },
              { num: "3919", label: "Violences", note: "Conjugales — 24h/24", tone: "rose" },
              { num: "119", label: "Enfance", note: "En danger — 24h/24", tone: "orange" },
              { num: "3018", label: "Cyberhar.", note: "Numérique — 7j/7", tone: "blue" },
            ].map((u) => (
              <a
                key={u.num}
                href={`tel:${u.num.replace(/\s/g, "")}`}
                className="flex flex-col items-center rounded-xl border border-white bg-white p-4 text-center transition hover:shadow-soft"
              >
                <span className="text-2xl font-bold text-red-700 sm:text-3xl">{u.num}</span>
                <span className="mt-1 text-xs font-semibold text-midnight-900">{u.label}</span>
                <span className="mt-0.5 text-[11px] text-midnight-500">{u.note}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section className="border-t border-midnight-100 bg-midnight-50/40 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-midnight-900">
              Ils ont trouvé une réponse claire
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                quote: "Le propriétaire refusait de me rendre mon dépôt. En 5 minutes, j'avais l'article 22 de la loi de 1989 et la lettre de mise en demeure prête.",
                author: "Camille, locataire — Nantes",
              },
              {
                quote: "Mon licenciement n'était clairement pas motivé. L'outil m'a expliqué la cause réelle et sérieuse et orienté vers les Prud'hommes.",
                author: "Karim, salarié — Lyon",
              },
              {
                quote: "Ma fille subissait du cyberharcèlement. J'ai eu en quelques minutes les bons articles + la lettre à envoyer au principal.",
                author: "Mère d'une collégienne — Île-de-France",
              },
            ].map((t, i) => (
              <div key={i} className="rounded-2xl border border-midnight-100 bg-white p-6">
                <svg className="mb-3 h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-sm italic leading-relaxed text-midnight-700">{t.quote}</p>
                <p className="mt-4 text-xs font-medium text-midnight-500">{t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gratuit ── */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-7 sm:p-10">
          <h2 className="text-xl font-semibold text-midnight-900 sm:text-2xl">
            100 % gratuit — accès au droit pour tous
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-midnight-700 sm:text-base">
            Le droit ne devrait pas dépendre des moyens. Avocat de Poche est financé par
            les dons. Si vous souhaitez soutenir le projet, une contribution libre est
            possible.
          </p>
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/chat"
              className="rounded-xl bg-midnight-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-midnight-800"
            >
              Utiliser l'outil
            </Link>
            <a
              href="https://ko-fi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-midnight-200 bg-white px-5 py-2.5 text-sm font-medium text-midnight-700 transition hover:border-midnight-300 hover:text-midnight-900"
            >
              Faire un don
            </a>
          </div>
        </div>
      </section>

      {/* ── Partenaires ── */}
      <section className="border-t border-midnight-100 bg-white py-10">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-5 text-center text-xs uppercase tracking-widest text-midnight-400">
            Sources officielles
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {[
              { name: "Légifrance", url: "https://www.legifrance.gouv.fr" },
              { name: "Service-Public.fr", url: "https://www.service-public.fr" },
              { name: "Défenseur des droits", url: "https://www.defenseurdesdroits.fr" },
              { name: "DGCCRF / SignalConso", url: "https://signal.conso.gouv.fr" },
              { name: "Conseil National des Barreaux", url: "https://cnb.avocat.fr" },
            ].map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-midnight-600 transition hover:text-midnight-900"
              >
                {p.name} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-midnight-900">
            Questions fréquentes
          </h2>
        </div>
        <div className="rounded-2xl border border-midnight-100 bg-white p-6 sm:p-8">
          <FaqItem
            question="C'est vraiment gratuit ?"
            answer="Oui, entièrement. Aucun compte, aucune carte bancaire. Le projet vit grâce aux dons. Si vous souhaitez soutenir, une contribution libre est bienvenue, jamais obligatoire."
          />
          <FaqItem
            question="L'outil peut-il remplacer un avocat ?"
            answer="Non. Avocat de Poche vous donne une information juridique fondée sur la loi en vigueur. Pour une stratégie personnalisée (procédure, plaidoirie, négociation), un avocat reste indispensable. L'outil vous oriente vers les bonnes spécialités."
          />
          <FaqItem
            question="Sur quelle base les articles sont-ils cités ?"
            answer="L'outil utilise la base officielle Légifrance / DILA (dumps LEGI). À chaque question, une recherche sémantique récupère les articles les plus pertinents, qui sont ensuite cités avec leur référence exacte et vulgarisés."
          />
          <FaqItem
            question="Mes données sont-elles conservées ?"
            answer="Non. Aucun compte n'est requis, les conversations ne sont ni stockées, ni revendues. Elles disparaissent à la fermeture de l'onglet."
          />
          <FaqItem
            question="Quels domaines sont couverts ?"
            answer="Six grands domaines de la vie quotidienne : droit du travail, du logement, de la consommation, de la famille, droit pénal / victimes, et harcèlement scolaire. D'autres viendront."
          />
          <FaqItem
            question="L'outil donne-t-il un avis ?"
            answer="Non. Il présente les options légales avec leurs conséquences, mais ne décide pas à votre place et ne fait pas de pronostic judiciaire. Chaque cas est apprécié individuellement par les juges compétents."
          />
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="bg-midnight-900 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ne restez pas seul·e face à la loi.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-midnight-200 sm:text-base">
            Posez votre question — la réponse arrive en quelques secondes,
            avec les articles applicables et les démarches à suivre.
          </p>
          <div className="mt-7">
            <Link
              href="/chat"
              className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-midnight-900 shadow-soft transition hover:bg-midnight-50"
            >
              Commencer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-midnight-800 bg-midnight-900">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-midnight-700 text-white">
                  <ScaleIcon className="h-4 w-4" />
                </div>
                <p className="font-serif text-base font-semibold text-white">Avocat de Poche</p>
              </div>
              <p className="mt-3 max-w-md text-xs leading-relaxed text-midnight-400">
                Information juridique généraliste sur le droit français.
                Gratuit, confidentiel, disponible 24h/24. Cet outil ne remplace pas un avocat.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-midnight-500">Domaines</h4>
              <ul className="space-y-1.5 text-sm">
                {DOMAIN_LIST.map((d) => (
                  <li key={d.id}>
                    <Link href={`/chat?domain=${d.id}`} className="text-midnight-300 hover:text-white">
                      {d.shortLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-midnight-500">Légal</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/confidentialite" className="text-midnight-300 hover:text-white">Confidentialité</Link></li>
                <li><Link href="/mentions-legales" className="text-midnight-300 hover:text-white">Mentions légales</Link></li>
                <li><Link href="/cgu" className="text-midnight-300 hover:text-white">CGU</Link></li>
                <li><a href="mailto:contact@avocatdepoche.fr" className="text-midnight-300 hover:text-white">contact@avocatdepoche.fr</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-midnight-800 pt-6 text-center text-[11px] text-midnight-500">
            <p>
              Source juridique : Légifrance (DILA) — Droit français en vigueur.
              Cet outil ne constitue pas une consultation juridique.
            </p>
            <p className="mt-1">© {new Date().getFullYear()} Avocat de Poche — Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
