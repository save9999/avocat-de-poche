import Link from "next/link";
import { ScaleIcon } from "@/components/ScaleIcon";
import { FaqAccordion } from "@/components/FaqAccordion";
import { DOMAIN_LIST, type DomainConfig } from "@/data/domains";

// Icônes minimalistes par domaine — 24×24, stroke 1.6, traitement unifié (laiton)
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

const FAQ_ITEMS = [
  {
    question: "C'est vraiment gratuit ?",
    answer:
      "Oui, entièrement. Aucun compte, aucune carte bancaire. Le projet vit grâce aux dons. Si vous souhaitez soutenir, une contribution libre est bienvenue, jamais obligatoire.",
  },
  {
    question: "L'outil peut-il remplacer un avocat ?",
    answer:
      "Non. Avocat de Poche vous donne une information juridique fondée sur la loi en vigueur. Pour une stratégie personnalisée (procédure, plaidoirie, négociation), un avocat reste indispensable. L'outil vous oriente vers les bonnes spécialités.",
  },
  {
    question: "Sur quelle base les articles sont-ils cités ?",
    answer:
      "L'outil utilise la base officielle Légifrance / DILA (dumps LEGI). À chaque question, une recherche sémantique récupère les articles les plus pertinents, qui sont ensuite cités avec leur référence exacte et vulgarisés.",
  },
  {
    question: "Mes données sont-elles conservées ?",
    answer:
      "Non. Aucun compte n'est requis, les conversations ne sont ni stockées, ni revendues. Elles disparaissent à la fermeture de l'onglet.",
  },
  {
    question: "Quels domaines sont couverts ?",
    answer:
      "Six grands domaines de la vie quotidienne : droit du travail, du logement, de la consommation, de la famille, droit pénal / victimes, et harcèlement scolaire. D'autres viendront.",
  },
  {
    question: "L'outil donne-t-il un avis ?",
    answer:
      "Non. Il présente les options légales avec leurs conséquences, mais ne décide pas à votre place et ne fait pas de pronostic judiciaire. Chaque cas est apprécié individuellement par les juges compétents.",
  },
];

function DomainCard({ domain }: { domain: DomainConfig }) {
  return (
    <Link
      href={`/chat?domain=${domain.id}`}
      className="group relative flex flex-col rounded-2xl border border-paper-200 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-brass-300"
    >
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-paper-100 text-midnight-800 transition-colors duration-200 group-hover:bg-brass-50 group-hover:text-brass-700">
        {DOMAIN_ICONS[domain.id]}
      </div>
      <h3 className="font-serif text-xl font-semibold leading-snug text-midnight-900">
        {domain.label}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-midnight-600">{domain.tagline}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-midnight-500">{domain.description}</p>
      <span className="mt-5 inline-flex items-center text-[13px] font-semibold text-brass-700">
        Poser ma question
        <svg
          viewBox="0 0 24 24"
          className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-paper" tabIndex={-1}>
      {/* ── Bandeau urgence — sobre, ton autorité (pas d'alarme rouge) ── */}
      <div className="bg-midnight-950 px-4 py-2 text-center text-[12px] leading-relaxed text-midnight-200">
        <span className="font-semibold text-brass-300">En danger immédiat&nbsp;?</span>{" "}
        <a href="tel:17" className="font-medium text-white underline decoration-midnight-600 underline-offset-2 hover:decoration-brass-400">17 / 112</a>
        <span className="px-1.5 text-midnight-600">·</span>
        Violences conjugales <a href="tel:3919" className="font-medium text-white underline decoration-midnight-600 underline-offset-2 hover:decoration-brass-400">3919</a>
        <span className="px-1.5 text-midnight-600">·</span>
        Enfance en danger <a href="tel:119" className="font-medium text-white underline decoration-midnight-600 underline-offset-2 hover:decoration-brass-400">119</a>
        <span className="px-1.5 text-midnight-600">·</span>
        Cyberharcèlement <a href="tel:3018" className="font-medium text-white underline decoration-midnight-600 underline-offset-2 hover:decoration-brass-400">3018</a>
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-paper-200 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-midnight-900 text-brass-200" aria-hidden="true">
              <ScaleIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-serif text-lg font-semibold leading-none text-midnight-900">
                Avocat de Poche
              </p>
              <p className="mt-0.5 truncate text-[10px] uppercase tracking-eyebrow text-midnight-500">
                Information juridique
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 sm:flex" aria-label="Navigation principale">
            <a href="#domaines" className="text-sm text-midnight-600 transition hover:text-midnight-900">Domaines</a>
            <Link href="/droits" className="text-sm text-midnight-600 transition hover:text-midnight-900">Vos droits</Link>
            <a href="#comment-ca-marche" className="text-sm text-midnight-600 transition hover:text-midnight-900">Comment ça marche</a>
            <a href="#faq" className="text-sm text-midnight-600 transition hover:text-midnight-900">FAQ</a>
          </nav>
          <Link
            href="/chat"
            className="hidden flex-shrink-0 rounded-xl border border-midnight-900 px-4 py-2 text-sm font-medium text-midnight-900 transition hover:bg-midnight-900 hover:text-white sm:inline-flex"
          >
            Poser une question
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-eyebrow text-midnight-500">
            <span className="h-1.5 w-1.5 rounded-full bg-sage-500" />
            Gratuit · Droit français · 24h/24
          </span>

          <h1
            id="hero-title"
            className="mt-6 font-serif text-[2rem] font-semibold leading-[1.08] tracking-tight text-midnight-900 sm:text-6xl sm:leading-[1.05]"
          >
            Vos droits,
            <br className="hidden sm:block" /> expliqués simplement.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-midnight-600 sm:text-base">
            Travail, logement, famille, consommation, sécurité. Décrivez votre situation :
            notre assistant cite les articles de loi applicables et vous guide jusqu'aux
            démarches concrètes.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/chat"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brass-600 px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brass-700 sm:w-auto"
            >
              Poser ma question
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#domaines"
              className="inline-flex w-full items-center justify-center rounded-xl border border-midnight-200 bg-white px-7 py-3.5 text-sm font-medium text-midnight-700 transition hover:border-midnight-300 hover:text-midnight-900 sm:w-auto"
            >
              Parcourir les domaines
            </a>
          </div>

          <p className="mx-auto mt-7 inline-flex items-center gap-2 text-xs text-midnight-500">
            <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-sage-600" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Réponses sourcées sur le droit français en vigueur — base officielle Légifrance.
          </p>
        </div>
      </section>

      {/* ── Domaines ── */}
      <section id="domaines" aria-labelledby="domaines-title" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-20">
        <div className="mb-12 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-brass-700">Domaines couverts</p>
          <h2 id="domaines-title" className="mt-3 font-serif text-3xl font-semibold tracking-tight text-midnight-900 sm:text-4xl">
            Pour quelle situation ?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-midnight-600">
            Six domaines de la vie quotidienne — chaque réponse cite les articles de loi
            français en vigueur, avec leur référence exacte.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAIN_LIST.map((d) => (
            <DomainCard key={d.id} domain={d} />
          ))}
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="comment-ca-marche" className="scroll-mt-20 border-y border-paper-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-brass-700">La démarche</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-midnight-900 sm:text-4xl">
              Comment ça marche
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-midnight-600">
              En trois étapes, vous repartez avec les bases juridiques et un plan d'action concret.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Vous décrivez la situation",
                description: "Quelques phrases suffisent. Vous restez anonyme, aucune création de compte.",
              },
              {
                n: "02",
                title: "L'assistant cherche la loi",
                description: "Recherche sémantique sur la base Légifrance ; les textes en vigueur sont cités avec leur référence exacte.",
              },
              {
                n: "03",
                title: "Vous repartez avec un plan",
                description: "Lettre type, checklist des preuves, contacts utiles, orientation vers un avocat spécialisé.",
              },
            ].map((s) => (
              <div key={s.n} className="border-t border-brass-200 pt-5">
                <span className="font-serif text-3xl font-semibold text-brass-600">{s.n}</span>
                <h3 className="mt-3 text-base font-semibold text-midnight-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-midnight-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Urgences ── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="rounded-3xl border border-paper-200 bg-paper-50 p-7 sm:p-10">
          <div className="mb-7 max-w-xl">
            <h2 className="font-serif text-2xl font-semibold text-midnight-900 sm:text-3xl">
              En cas d'urgence
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-midnight-600">
              Si vous êtes en danger immédiat, ces lignes nationales répondent maintenant,
              gratuitement et anonymement.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { num: "17", label: "Police-secours", note: "Danger immédiat", urgent: true },
              { num: "3919", label: "Violences", note: "Conjugales · 24h/24", urgent: false },
              { num: "119", label: "Enfance", note: "En danger · 24h/24", urgent: false },
              { num: "3018", label: "Cyberharcèl.", note: "Numérique · 7j/7", urgent: false },
            ].map((u) => (
              <a
                key={u.num}
                href={`tel:${u.num.replace(/\s/g, "")}`}
                className="group flex flex-col rounded-2xl border border-paper-200 bg-white p-4 transition hover:border-brass-300 hover:shadow-card"
              >
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${u.urgent ? "bg-red-600" : "bg-brass-500"}`} aria-hidden="true" />
                  <span className="font-serif text-2xl font-semibold text-midnight-900 sm:text-3xl">{u.num}</span>
                </span>
                <span className="mt-1.5 text-[13px] font-semibold text-midnight-800">{u.label}</span>
                <span className="mt-0.5 text-[11px] text-midnight-500">{u.note}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section className="border-y border-paper-200 bg-paper-100 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-brass-700">Témoignages</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-midnight-900 sm:text-4xl">
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
                quote: "Ma fille subissait du cyberharcèlement. J'ai eu en quelques minutes les bons articles et la lettre à envoyer au principal.",
                author: "Mère d'une collégienne — Île-de-France",
              },
            ].map((t, i) => (
              <figure key={i} className="flex flex-col rounded-2xl border border-paper-200 bg-white p-6 shadow-card">
                <span className="font-serif text-4xl leading-none text-brass-400" aria-hidden="true">&ldquo;</span>
                <blockquote className="mt-2 font-serif text-lg italic leading-relaxed text-midnight-800">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-4 text-xs font-medium text-midnight-500">{t.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accès gratuit ── */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
        <div className="rounded-3xl border border-sage-200 bg-sage-50 p-8 sm:p-12">
          <h2 className="font-serif text-2xl font-semibold text-midnight-900 sm:text-3xl">
            L'accès au droit, pour tous
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-midnight-700">
            Le droit ne devrait pas dépendre des moyens. Avocat de Poche est financé par les
            dons. Si vous souhaitez soutenir le projet, une contribution libre est possible.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/chat"
              className="rounded-xl bg-midnight-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-midnight-800"
            >
              Utiliser l'outil
            </Link>
            <a
              href="https://ko-fi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-sage-300 bg-white px-6 py-3 text-sm font-medium text-sage-800 transition hover:border-sage-400"
            >
              Faire un don
            </a>
          </div>
        </div>
      </section>

      {/* ── Sources officielles ── */}
      <section className="border-t border-paper-200 bg-white py-12">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-eyebrow text-midnight-400">
            Sources officielles
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
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
                className="font-medium text-midnight-600 transition hover:text-brass-700"
              >
                {p.name} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-16 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-brass-700">FAQ</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-midnight-900 sm:text-4xl">
            Questions fréquentes
          </h2>
        </div>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>

      {/* ── CTA final ── */}
      <section className="bg-midnight-950 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ne restez pas seul·e face à la loi.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-midnight-300 sm:text-base">
            Posez votre question — la réponse arrive en quelques secondes, avec les articles
            applicables et les démarches à suivre.
          </p>
          <div className="mt-8">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-brass-500 px-7 py-3.5 text-sm font-semibold text-midnight-950 shadow-soft transition hover:bg-brass-400"
            >
              Commencer maintenant
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-midnight-800 bg-midnight-900">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-midnight-800 text-brass-200">
                  <ScaleIcon className="h-4 w-4" />
                </div>
                <p className="font-serif text-base font-semibold text-white">Avocat de Poche</p>
              </div>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-midnight-400">
                Information juridique généraliste sur le droit français. Gratuit, confidentiel,
                disponible 24h/24. Cet outil ne remplace pas un avocat.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-midnight-500">Domaines</h4>
              <ul className="space-y-2 text-sm">
                {DOMAIN_LIST.map((d) => (
                  <li key={d.id}>
                    <Link href={`/chat?domain=${d.id}`} className="text-midnight-300 transition hover:text-white">
                      {d.shortLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-midnight-500">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/droits" className="text-midnight-300 transition hover:text-white">Vos droits de A à Z</Link></li>
                <li><Link href="/confidentialite" className="text-midnight-300 transition hover:text-white">Confidentialité</Link></li>
                <li><Link href="/mentions-legales" className="text-midnight-300 transition hover:text-white">Mentions légales</Link></li>
                <li><Link href="/cgu" className="text-midnight-300 transition hover:text-white">CGU</Link></li>
                <li><a href="mailto:contact@avocatdepoche.fr" className="text-midnight-300 transition hover:text-white">contact@avocatdepoche.fr</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-midnight-800 pt-6 text-center text-[11px] leading-relaxed text-midnight-500">
            <p>
              Source juridique : Légifrance (DILA) — Droit français en vigueur. Cet outil ne
              constitue pas une consultation juridique.
            </p>
            <p className="mt-1">© {new Date().getFullYear()} Avocat de Poche — Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
