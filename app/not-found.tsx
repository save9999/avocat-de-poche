import type { Metadata } from "next";
import Link from "next/link";
import { ScaleIcon } from "@/components/ScaleIcon";

export const metadata: Metadata = {
  title: "Page introuvable — 404",
  description: "Cette page n'existe pas. Retournez à l'accueil ou accédez directement au chat juridique sur le harcèlement scolaire.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-midnight-50 flex flex-col">
      <header className="border-b border-midnight-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center px-6 py-4">
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
        </div>
      </header>

      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
        aria-labelledby="not-found-title"
      >
        <p className="font-serif text-8xl font-semibold text-midnight-200" aria-hidden="true">404</p>

        <h1 id="not-found-title" className="mt-4 font-serif text-2xl font-semibold text-midnight-900">
          Page introuvable
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-midnight-600">
          La page que vous cherchez n'existe pas ou a été déplacée. Pas d'inquiétude — vous pouvez retourner à l'accueil ou poser directement votre question juridique.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-midnight-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-midnight-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/chat"
            className="rounded-xl border border-midnight-200 bg-white px-6 py-3 text-sm font-medium text-midnight-700 transition hover:border-midnight-300 hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Poser une question juridique
          </Link>
        </div>

        {/* Urgences toujours visibles */}
        <div
          className="mt-12 rounded-2xl border border-red-100 bg-red-50 p-6 max-w-sm w-full"
          role="complementary"
          aria-label="Numéros d'urgence"
        >
          <h2 className="font-serif text-base font-semibold text-midnight-900 mb-4">
            Besoin d'aide immédiate ?
          </h2>
          <ul className="space-y-2 text-sm" role="list">
            <li>
              <a
                href="tel:3018"
                className="flex items-center gap-3 rounded-lg border border-red-200 bg-white p-3 text-red-700 transition hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
                aria-label="Appeler le 3018, Net Écoute cyberharcèlement, gratuit 24h sur 24"
              >
                <span className="font-serif text-2xl font-bold" aria-hidden="true">3018</span>
                <div>
                  <p className="font-semibold">Net Écoute</p>
                  <p className="text-xs text-midnight-500">Cyberharcèlement · Gratuit · 24h/24</p>
                </div>
              </a>
            </li>
            <li>
              <a
                href="tel:119"
                className="flex items-center gap-3 rounded-lg border border-orange-200 bg-white p-3 text-orange-700 transition hover:border-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1"
                aria-label="Appeler le 119, Allô Enfance en Danger, gratuit 24h sur 24"
              >
                <span className="font-serif text-2xl font-bold" aria-hidden="true">119</span>
                <div>
                  <p className="font-semibold">Allô Enfance en Danger</p>
                  <p className="text-xs text-midnight-500">Enfants en danger · Gratuit · 24h/24</p>
                </div>
              </a>
            </li>
            <li>
              <a
                href="tel:3020"
                className="flex items-center gap-3 rounded-lg border border-blue-200 bg-white p-3 text-blue-700 transition hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                aria-label="Appeler le 3020, ligne nationale harcèlement scolaire, gratuit"
              >
                <span className="font-serif text-2xl font-bold" aria-hidden="true">3020</span>
                <div>
                  <p className="font-semibold">Harcèlement scolaire</p>
                  <p className="text-xs text-midnight-500">Ligne nationale · Gratuit</p>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
