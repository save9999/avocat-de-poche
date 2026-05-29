import type { Metadata } from "next";
import Link from "next/link";
import { ScaleIcon } from "@/components/ScaleIcon";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales d'Avocat de Poche, service d'information juridique gratuit en droit français (travail, logement, famille, consommation, pénal, harcèlement scolaire).",
  alternates: { canonical: "https://avocat-de-poche.vercel.app/mentions-legales" },
};

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-midnight-50">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-midnight-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
      >
        Aller au contenu
      </a>

      <header className="border-b border-midnight-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
            aria-label="Retour à l'accueil Avocat de Poche"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-midnight-900 text-white">
              <ScaleIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="font-serif text-lg font-semibold text-midnight-900">Avocat de Poche</span>
          </Link>
          <nav aria-label="Navigation secondaire">
            <Link href="/" className="text-sm text-midnight-600 hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
              ← Retour à l'accueil
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-4xl px-6 py-12" tabIndex={-1}>
        <h1 className="font-serif text-3xl font-semibold text-midnight-900 mb-8">Mentions légales</h1>

        <div className="rounded-3xl border border-midnight-100 bg-white p-8 sm:p-10 space-y-8 text-midnight-700 leading-relaxed">

          <section aria-labelledby="editeur">
            <h2 id="editeur" className="font-serif text-xl font-semibold text-midnight-900 mb-3">1. Éditeur du site</h2>
            <p>Le site <strong>Avocat de Poche</strong> (avocat-de-poche.vercel.app) est édité à titre bénévole par un particulier résidant en France.</p>
            <p className="mt-2">Contact : <a href="mailto:contact@avocatdepoche.fr" className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">contact@avocatdepoche.fr</a></p>
          </section>

          <section aria-labelledby="hebergement">
            <h2 id="hebergement" className="font-serif text-xl font-semibold text-midnight-900 mb-3">2. Hébergement</h2>
            <p>Le site est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis.</p>
            <p className="mt-1">Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">vercel.com</a></p>
          </section>

          <section aria-labelledby="ia">
            <h2 id="ia" className="font-serif text-xl font-semibold text-midnight-900 mb-3">3. Service d'intelligence artificielle</h2>
            <p>Le chatbot juridique est alimenté par l'API Claude d'<strong>Anthropic, PBC</strong>, 548 Market St PMB 90375, San Francisco, CA 94104, États-Unis.</p>
            <p className="mt-2">Les échanges sont traités par l'API d'Anthropic et ne sont pas conservés par Avocat de Poche.</p>
          </section>

          <section aria-labelledby="propriete">
            <h2 id="propriete" className="font-serif text-xl font-semibold text-midnight-900 mb-3">4. Propriété intellectuelle</h2>
            <p>Le contenu éditorial, les textes, la structure et le design du site sont protégés par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable écrite.</p>
            <p className="mt-2">Les textes de loi reproduits (Code pénal, Code de l'éducation) sont des œuvres de l'esprit appartenant au domaine public (Légifrance/DILA).</p>
          </section>

          <section aria-labelledby="responsabilite">
            <h2 id="responsabilite" className="font-serif text-xl font-semibold text-midnight-900 mb-3">5. Limitation de responsabilité</h2>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm" role="note" aria-label="Avertissement important">
              <strong>Avertissement :</strong> Avocat de Poche est un outil d'information juridique. Il ne remplace pas la consultation d'un avocat ou d'un professionnel du droit. Les informations fournies sont indicatives et fondées sur le droit français en vigueur. Elles ne constituent pas un conseil juridique personnalisé.
            </div>
            <p className="mt-3">L'éditeur ne saurait être tenu responsable des décisions prises par les utilisateurs sur la base des informations délivrées par le service.</p>
          </section>

          <section aria-labelledby="donnees-ml">
            <h2 id="donnees-ml" className="font-serif text-xl font-semibold text-midnight-900 mb-3">6. Données personnelles</h2>
            <p>Aucune donnée personnelle n'est collectée ni stockée par Avocat de Poche. Les conversations sont anonymes et disparaissent à la fermeture de la session.</p>
            <p className="mt-2">Pour plus d'informations, consultez notre <Link href="/confidentialite" className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">politique de confidentialité</Link>.</p>
          </section>

          <section aria-labelledby="droit-applicable">
            <h2 id="droit-applicable" className="font-serif text-xl font-semibold text-midnight-900 mb-3">7. Droit applicable</h2>
            <p>Le présent site est soumis au droit français. Tout litige relatif à son utilisation sera soumis aux tribunaux compétents de France.</p>
          </section>

          <p className="text-xs text-midnight-400 pt-4 border-t border-midnight-100">
            Dernière mise à jour : mai 2026
          </p>
        </div>

        {/* Footer légal mini */}
        <nav aria-label="Liens légaux" className="mt-8 flex flex-wrap gap-4 text-sm text-midnight-500">
          <Link href="/cgu" className="hover:text-midnight-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">CGU</Link>
          <Link href="/confidentialite" className="hover:text-midnight-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Politique de confidentialité</Link>
          <Link href="/" className="hover:text-midnight-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Accueil</Link>
        </nav>
      </main>
    </div>
  );
}
