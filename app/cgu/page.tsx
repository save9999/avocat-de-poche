import type { Metadata } from "next";
import Link from "next/link";
import { ScaleIcon } from "@/components/ScaleIcon";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation du service Avocat de Poche, outil d'information juridique gratuit sur le harcèlement scolaire.",
  alternates: { canonical: "https://avocat-de-poche.vercel.app/cgu" },
};

export default function CGU() {
  return (
    <div className="min-h-screen bg-midnight-50">
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
        <h1 className="font-serif text-3xl font-semibold text-midnight-900 mb-8">
          Conditions générales d'utilisation
        </h1>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 text-sm mb-8" role="note" aria-label="Avertissement important">
          <strong>Rappel :</strong> Avocat de Poche est un outil d'information juridique. Il ne remplace pas la consultation d'un avocat. Pour toute situation grave, contactez un professionnel du droit ou les numéros d'urgence : <a href="tel:3018" className="font-bold underline">3018</a>, <a href="tel:119" className="font-bold underline">119</a>.
        </div>

        <div className="rounded-3xl border border-midnight-100 bg-white p-8 sm:p-10 space-y-8 text-midnight-700 leading-relaxed">

          <section aria-labelledby="objet">
            <h2 id="objet" className="font-serif text-xl font-semibold text-midnight-900 mb-3">1. Objet</h2>
            <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du service <strong>Avocat de Poche</strong> (ci-après « le Service »), accessible à l'adresse <a href="https://avocat-de-poche.vercel.app" className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">avocat-de-poche.vercel.app</a>.</p>
            <p className="mt-2">Le Service est un outil d'information juridique gratuit, destiné à aider les familles et les adolescents confrontés au harcèlement scolaire à comprendre leurs droits et les démarches possibles en droit français.</p>
          </section>

          <section aria-labelledby="acces">
            <h2 id="acces" className="font-serif text-xl font-semibold text-midnight-900 mb-3">2. Accès au service</h2>
            <p>Le Service est accessible à toute personne, sans inscription préalable, sans création de compte, et sans fourniture d'informations personnelles identifiables.</p>
            <p className="mt-2">Il est accessible 24h/24 et 7j/7, sous réserve des interruptions techniques nécessaires à la maintenance ou aux mises à jour.</p>
          </section>

          <section aria-labelledby="utilisation">
            <h2 id="utilisation" className="font-serif text-xl font-semibold text-midnight-900 mb-3">3. Utilisation du service</h2>
            <p>L'utilisateur s'engage à utiliser le Service dans le respect de la loi française, notamment :</p>
            <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
              <li>Ne pas utiliser le Service à des fins illégales ou malveillantes.</li>
              <li>Ne pas tenter d'accéder à des données ou systèmes non autorisés.</li>
              <li>Ne pas diffuser de contenu contraire à la loi, à l'ordre public ou aux bonnes mœurs.</li>
              <li>Ne pas utiliser le Service pour nuire à autrui.</li>
            </ul>
            <p className="mt-3">Le Service est conçu pour un public en détresse (mineurs et parents). Tout usage malveillant ou de nature à compromettre la confiance des utilisateurs vulnérables est formellement interdit.</p>
          </section>

          <section aria-labelledby="mineurs">
            <h2 id="mineurs" className="font-serif text-xl font-semibold text-midnight-900 mb-3">4. Utilisateurs mineurs</h2>
            <p>Le Service est expressément conçu pour être accessible aux mineurs victimes ou témoins de harcèlement scolaire. Il ne collecte aucune donnée personnelle (article 8 du RGPD et loi Informatique et Libertés).</p>
            <p className="mt-2">Les parents et représentants légaux sont encouragés à accompagner les mineurs dans les démarches concrètes découlant de l'utilisation du Service.</p>
          </section>

          <section aria-labelledby="limite">
            <h2 id="limite" className="font-serif text-xl font-semibold text-midnight-900 mb-3">5. Limites du service — pas de conseil juridique</h2>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 text-sm" role="note">
              <p><strong>Important :</strong> Les informations délivrées par le Service sont à titre informatif uniquement. Elles ne constituent pas des consultations juridiques au sens de la loi n° 71-1130 du 31 décembre 1971 portant réforme de certaines professions judiciaires et juridiques.</p>
            </div>
            <p className="mt-3">Le Service ne saurait se substituer à l'avis d'un avocat, d'un juriste ou de tout autre professionnel du droit qualifié. Pour toute décision importante, consultez un professionnel.</p>
          </section>

          <section aria-labelledby="gratuite">
            <h2 id="gratuite" className="font-serif text-xl font-semibold text-midnight-900 mb-3">6. Gratuité</h2>
            <p>Le Service est entièrement gratuit. Aucun abonnement, aucune inscription payante. Des contributions libres (dons) sont possibles mais en aucun cas obligatoires pour accéder à l'ensemble des fonctionnalités.</p>
          </section>

          <section aria-labelledby="ia-cgu">
            <h2 id="ia-cgu" className="font-serif text-xl font-semibold text-midnight-900 mb-3">7. Service d'IA — limites et responsabilité</h2>
            <p>Le chatbot est alimenté par un modèle d'intelligence artificielle (Claude, Anthropic). Les réponses générées sont probabilistes et peuvent contenir des inexactitudes. L'éditeur ne garantit pas l'exhaustivité, l'exactitude ou l'actualité des informations produites.</p>
            <p className="mt-2">En cas de doute, l'utilisateur est invité à vérifier les informations sur <a href="https://www.legifrance.gouv.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Légifrance</a>.</p>
          </section>

          <section aria-labelledby="modifications">
            <h2 id="modifications" className="font-serif text-xl font-semibold text-midnight-900 mb-3">8. Modifications</h2>
            <p>L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. La date de dernière mise à jour est indiquée en bas de page. La poursuite de l'utilisation du Service après modification vaut acceptation des nouvelles CGU.</p>
          </section>

          <section aria-labelledby="droit-cgu">
            <h2 id="droit-cgu" className="font-serif text-xl font-semibold text-midnight-900 mb-3">9. Droit applicable — médiation</h2>
            <p>Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant tout recours judiciaire. Le Médiateur de la consommation compétent peut être saisi conformément aux articles L. 611-1 et suivants du Code de la consommation.</p>
          </section>

          <p className="text-xs text-midnight-400 pt-4 border-t border-midnight-100">
            Dernière mise à jour : mai 2026
          </p>
        </div>

        <nav aria-label="Liens légaux" className="mt-8 flex flex-wrap gap-4 text-sm text-midnight-500">
          <Link href="/mentions-legales" className="hover:text-midnight-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-midnight-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Politique de confidentialité</Link>
          <Link href="/" className="hover:text-midnight-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Accueil</Link>
        </nav>
      </main>
    </div>
  );
}
