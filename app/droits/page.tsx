import type { Metadata } from "next";
import Link from "next/link";
import { countByDomain, FICHE_DOMAINS } from "@/lib/fiches";

export const revalidate = 86400;

const BASE_URL = "https://avocat-de-poche.vercel.app";

export const metadata: Metadata = {
  title: "Vos droits de A à Z — fiches pratiques du droit français",
  description:
    "Plus de 4 000 fiches pratiques officielles expliquées simplement : travail, logement, famille, consommation, pénal, démarches. Gratuit, à jour, avec réponse personnalisée par IA.",
  alternates: { canonical: `${BASE_URL}/droits` },
};

export default async function DroitsIndexPage() {
  const counts = await Promise.all(FICHE_DOMAINS.map((d) => countByDomain(d.id)));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-600">
        Fiches pratiques
      </p>
      <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-midnight-900 sm:text-4xl">
        Vos droits, <span className="font-serif">expliqués simplement</span>
      </h1>
      <p className="mt-4 max-w-2xl text-midnight-600">
        Toutes les fiches officielles « Vos droits et démarches » (Service-Public.fr),
        classées par thème. Une situation particulière ?{" "}
        <Link href="/chat" className="font-medium text-midnight-900 underline">
          Posez votre question
        </Link>{" "}
        et obtenez une réponse fondée sur les textes en vigueur.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FICHE_DOMAINS.map((d, i) => (
          <Link
            key={d.id}
            href={`/droits/domaine/${d.id}`}
            className="group rounded-xl border border-midnight-100 bg-white p-5 transition hover:border-brass-300 hover:shadow-sm"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold text-midnight-900 group-hover:text-midnight-950">
                {d.label}
              </h2>
              <span className="text-xs tabular-nums text-midnight-400">
                {counts[i]} fiches
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-midnight-600">{d.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
