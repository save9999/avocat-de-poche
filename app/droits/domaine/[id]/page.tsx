import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FICHE_DOMAINS, ficheSlug, listByDomain } from "@/lib/fiches";

export const revalidate = 86400;

const BASE_URL = "https://avocat-de-poche.vercel.app";

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return FICHE_DOMAINS.map((d) => ({ id: d.id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const domain = FICHE_DOMAINS.find((d) => d.id === params.id);
  if (!domain) return {};
  return {
    title: `${domain.label} — vos droits et démarches`,
    description: `${domain.description} Toutes les fiches pratiques officielles sur le thème « ${domain.label} », expliquées simplement et gratuites.`,
    alternates: { canonical: `${BASE_URL}/droits/domaine/${domain.id}` },
  };
}

export default async function DomainePage({ params }: Props) {
  const domain = FICHE_DOMAINS.find((d) => d.id === params.id);
  if (!domain) notFound();

  const fiches = await listByDomain(domain.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="text-xs text-midnight-500">
        <Link href="/droits" className="hover:text-midnight-800">
          Vos droits
        </Link>{" "}
        / <span className="text-midnight-800">{domain.label}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-midnight-900">
        {domain.label}
      </h1>
      <p className="mt-3 max-w-2xl text-midnight-600">{domain.description}</p>
      <p className="mt-2 text-sm text-midnight-500">
        {fiches.length} fiches pratiques —{" "}
        <Link href="/chat" className="underline hover:text-midnight-800">
          poser une question précise
        </Link>
      </p>

      <ul className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {fiches.map((f) => (
          <li key={f.cid}>
            <Link
              href={`/droits/${ficheSlug(f)}`}
              className="block rounded-md px-2 py-1.5 text-sm leading-snug text-midnight-700 transition hover:bg-white hover:text-midnight-950"
            >
              {f.reference}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
