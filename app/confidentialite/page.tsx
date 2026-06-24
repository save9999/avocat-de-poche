import type { Metadata } from "next";
import Link from "next/link";
import { ScaleIcon } from "@/components/ScaleIcon";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité d'Avocat de Poche : protection des données, RGPD, droits des mineurs, anonymat total. Aucune donnée stockée.",
  alternates: { canonical: "https://avocat-de-poche.vercel.app/confidentialite" },
};

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-midnight-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
      >
        Aller au contenu
      </a>

      <header className="border-b border-paper-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2 rounded-lg"
            aria-label="Retour à l'accueil Avocat de Poche"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-midnight-900 text-brass-200">
              <ScaleIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="font-serif text-lg font-semibold text-midnight-900">Avocat de Poche</span>
          </Link>
          <nav aria-label="Navigation secondaire">
            <Link href="/" className="text-sm text-midnight-600 hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded">
              ← Retour à l'accueil
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-4xl px-6 py-12" tabIndex={-1}>
        <h1 className="font-serif text-3xl font-semibold text-midnight-900 mb-4">
          Politique de confidentialité
        </h1>
        <p className="text-midnight-600 mb-8 text-base leading-relaxed">
          Chez Avocat de Poche, la protection de la vie privée — notamment celle des mineurs — est une priorité absolue. Ce document explique, de manière transparente, comment nous traitons (ou plutôt, n'traitons pas) vos données.
        </p>

        {/* Résumé visuel */}
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 mb-8" role="note" aria-label="Résumé de notre engagement vie privée">
          <h2 className="font-serif text-lg font-semibold text-green-900 mb-3">En résumé : notre engagement</h2>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2"><span aria-hidden="true">✓</span> Aucune donnée personnelle collectée</li>
            <li className="flex items-start gap-2"><span aria-hidden="true">✓</span> Aucun compte requis</li>
            <li className="flex items-start gap-2"><span aria-hidden="true">✓</span> Les conversations disparaissent à la fermeture de l'onglet</li>
            <li className="flex items-start gap-2"><span aria-hidden="true">✓</span> Aucun cookie de traçage ou analytique</li>
            <li className="flex items-start gap-2"><span aria-hidden="true">✓</span> Aucune publicité ciblée</li>
            <li className="flex items-start gap-2"><span aria-hidden="true">✓</span> Conforme RGPD · Articles 8 et 9 respectés pour les mineurs</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-paper-200 bg-white p-8 sm:p-10 space-y-8 text-midnight-700 leading-relaxed">

          <section aria-labelledby="responsable">
            <h2 id="responsable" className="font-serif text-xl font-semibold text-midnight-900 mb-3">1. Responsable de traitement</h2>
            <p>Le responsable de traitement est l'éditeur bénévole du site Avocat de Poche, résidant en France.</p>
            <p className="mt-2">Contact : <a href="mailto:contact@avocatdepoche.fr" className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded">contact@avocatdepoche.fr</a></p>
          </section>

          <section aria-labelledby="donnees-collectees">
            <h2 id="donnees-collectees" className="font-serif text-xl font-semibold text-midnight-900 mb-3">2. Données collectées</h2>
            <h3 className="font-semibold text-midnight-900 mb-2">2.1 Données de navigation (logs serveur)</h3>
            <p>Notre hébergeur Vercel collecte automatiquement des données techniques minimales : adresse IP anonymisée, type de navigateur, pages consultées, durée de session. Ces données sont utilisées uniquement à des fins de sécurité et de performance. Elles ne sont pas accessibles à l'éditeur d'Avocat de Poche.</p>

            <h3 className="font-semibold text-midnight-900 mb-2 mt-4">2.2 Conversations avec le chatbot</h3>
            <p>Les messages que vous échangez avec l'assistant IA sont transmis à l'API Gemini (Google) pour générer une réponse. <strong>Avocat de Poche ne stocke, n'enregistre ni n'analyse aucun message</strong>. Les conversations ne sont jamais associées à une identité.</p>
            <p className="mt-2">Les échanges sont traités uniquement en mémoire vive (RAM) pendant la durée de la session. À la fermeture de la page, tout est effacé définitivement côté Avocat de Poche.</p>

            <h3 className="font-semibold text-midnight-900 mb-2 mt-4">2.3 Aucune donnée personnelle directe</h3>
            <p>Nous ne demandons ni ne collectons : nom, prénom, adresse e-mail, numéro de téléphone, adresse postale, données bancaires, ou tout autre identifiant personnel.</p>
          </section>

          <section aria-labelledby="mineurs-rgpd">
            <h2 id="mineurs-rgpd" className="font-serif text-xl font-semibold text-midnight-900 mb-3">3. Protection spécifique des mineurs (RGPD art. 8)</h2>
            <div className="rounded-xl border border-brass-200 bg-brass-50 p-5 text-brass-900 text-sm" role="note" aria-label="Protection des mineurs">
              <p className="font-semibold mb-2">Conformité RGPD article 8 — Consentement des mineurs</p>
              <p>Le RGPD (article 8) exige le consentement parental pour le traitement des données personnelles des mineurs de moins de 15 ans en France (loi Informatique et Libertés, art. 7-1). <strong>Avocat de Poche ne collecte aucune donnée personnelle</strong>, rendant toute question de consentement parental sans objet.</p>
            </div>
            <p className="mt-3">Notre service a été conçu spécifiquement pour être utilisable de manière sécurisée par des mineurs :</p>
            <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
              <li>Aucune création de compte ni inscription</li>
              <li>Aucune collecte d'âge ou d'identité</li>
              <li>Les conversations ne sont pas liées à un profil</li>
              <li>Aucune donnée susceptible d'identifier un mineur n'est transmise ou stockée</li>
            </ul>
          </section>

          <section aria-labelledby="donnees-sensibles">
            <h2 id="donnees-sensibles" className="font-serif text-xl font-semibold text-midnight-900 mb-3">4. Données sensibles et RGPD article 9</h2>
            <p>Le RGPD (article 9) interdit en principe le traitement des données révélant l'origine raciale ou ethnique, les opinions politiques, les convictions religieuses, l'orientation sexuelle, ou l'état de santé.</p>
            <p className="mt-2">Lors d'une conversation sur le harcèlement scolaire, un utilisateur peut mentionner des données sensibles (discrimination, orientation sexuelle, handicap…). Nous attirons votre attention sur ce point :</p>
            <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
              <li>Avocat de Poche ne stocke jamais ces informations</li>
              <li>Les messages sont transmis à Google (API Gemini) uniquement pour générer une réponse immédiate</li>
              <li>Évitez de mentionner des informations d'identification (nom, école, ville précise) dans le chat</li>
            </ul>
          </section>

          <section aria-labelledby="google">
            <h2 id="google" className="font-serif text-xl font-semibold text-midnight-900 mb-3">5. Sous-traitant : Google (API Gemini)</h2>
            <p>Les messages transmis au chatbot sont envoyés à <strong>Google LLC</strong> (1600 Amphitheatre Parkway, Mountain View, CA 94043, USA) via l'API Gemini, pour la recherche dans les textes officiels et la génération de la réponse.</p>
            <p className="mt-2">Selon la politique d'utilisation des données de l'API Google Gemini :</p>
            <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
              <li>Les conversations sont transmises de façon anonyme, sans aucune donnée permettant de vous identifier</li>
              <li>Les échanges API sont soumis à la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded">politique de confidentialité de Google</a> et aux <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded">conditions de l'API Gemini</a></li>
              <li>Ne communiquez jamais d'informations permettant de vous identifier (nom, adresse, coordonnées) dans vos messages</li>
              <li>Google est certifié conforme aux normes de sécurité SOC 2, ISO 27001 et 27018</li>
            </ul>
            <p className="mt-2">Compte tenu du transfert vers les États-Unis, des clauses contractuelles types (CCT) sont applicables conformément à l'article 46 du RGPD.</p>
          </section>

          <section aria-labelledby="cookies">
            <h2 id="cookies" className="font-serif text-xl font-semibold text-midnight-900 mb-3">6. Cookies</h2>
            <p>Avocat de Poche n'utilise <strong>aucun cookie de traçage, de publicité ou d'analyse comportementale</strong>.</p>
            <p className="mt-2">Des cookies strictement nécessaires au fonctionnement technique du site peuvent être définis par le navigateur ou par Vercel (hébergeur) pour des raisons de sécurité (protection CSRF, équilibrage de charge). Ces cookies :</p>
            <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
              <li>Ne collectent aucune donnée personnelle identifiable</li>
              <li>Ne nécessitent pas de consentement préalable (directive ePrivacy, art. 5.3)</li>
              <li>Sont automatiquement supprimés à la fermeture du navigateur</li>
            </ul>
            <p className="mt-2">Aucun cookie analytique (Google Analytics, Matomo, etc.) n'est présent sur ce site.</p>
          </section>

          <section aria-labelledby="droits">
            <h2 id="droits" className="font-serif text-xl font-semibold text-midnight-900 mb-3">7. Vos droits RGPD</h2>
            <p>Conformément au RGPD (articles 15 à 22) et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
            <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
              <li><strong>Accès</strong> : droit d'obtenir confirmation que des données vous concernant sont traitées</li>
              <li><strong>Rectification</strong> : droit de corriger des données inexactes</li>
              <li><strong>Effacement</strong> : droit à l'oubli</li>
              <li><strong>Limitation</strong> : droit de limiter le traitement</li>
              <li><strong>Portabilité</strong> : droit de recevoir vos données dans un format lisible</li>
              <li><strong>Opposition</strong> : droit de s'opposer au traitement</li>
            </ul>
            <p className="mt-3">Étant donné qu'Avocat de Poche ne stocke aucune donnée personnelle, l'exercice de la plupart de ces droits est sans objet. Pour toute question, contactez-nous : <a href="mailto:contact@avocatdepoche.fr" className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded">contact@avocatdepoche.fr</a></p>
            <p className="mt-2">Vous pouvez également saisir la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded">www.cnil.fr</a> — 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.</p>
          </section>

          <section aria-labelledby="securite">
            <h2 id="securite" className="font-serif text-xl font-semibold text-midnight-900 mb-3">8. Sécurité</h2>
            <p>Le site utilise le protocole HTTPS (TLS 1.3) pour toutes les communications. Les échanges avec l'API de Google sont chiffrés en transit.</p>
            <p className="mt-2">Le code source de l'application est régulièrement audité pour détecter d'éventuelles failles de sécurité.</p>
          </section>

          <section aria-labelledby="conseils">
            <h2 id="conseils" className="font-serif text-xl font-semibold text-midnight-900 mb-3">9. Conseils aux utilisateurs — protégez-vous</h2>
            <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
              <li>N'indiquez jamais votre nom complet, adresse, école ou tout autre identifiant dans le chat</li>
              <li>Si vous partagez cet outil avec votre enfant, pensez à fermer l'onglet après la session</li>
              <li>En cas de détresse urgente, contactez le <a href="tel:3018" className="font-bold underline">3018</a> ou le <a href="tel:119" className="font-bold underline">119</a></li>
            </ul>
          </section>

          <section aria-labelledby="modifications-conf">
            <h2 id="modifications-conf" className="font-serif text-xl font-semibold text-midnight-900 mb-3">10. Modifications de cette politique</h2>
            <p>Cette politique peut être mise à jour. La date de dernière modification est indiquée ci-dessous. En cas de modification substantielle, un avertissement sera affiché sur le site pendant 30 jours.</p>
          </section>

          <p className="text-xs text-midnight-400 pt-4 border-t border-paper-200">
            Dernière mise à jour : mai 2026 · Conformité RGPD (UE) 2016/679 · Loi Informatique et Libertés (modifiée 2018)
          </p>
        </div>

        <nav aria-label="Liens légaux" className="mt-8 flex flex-wrap gap-4 text-sm text-midnight-500">
          <Link href="/mentions-legales" className="hover:text-midnight-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-midnight-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded">CGU</Link>
          <Link href="/" className="hover:text-midnight-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded">Accueil</Link>
        </nav>
      </main>
    </div>
  );
}
