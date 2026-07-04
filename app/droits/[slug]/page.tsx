import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  cidFromSlug,
  FICHE_DOMAINS,
  ficheSlug,
  getFiche,
  getRelated,
} from "@/lib/fiches";

export const revalidate = 86400;

const BASE_URL = "https://avocat-de-poche.vercel.app";

interface Props {
  params: { slug: string };
}

type Block =
  | { type: "h2"; text: string }
  | { type: "note"; label: string; text: string }
  | { type: "ul"; items: string[] }
  | { type: "p"; text: string };

// Encadrés DILA aplatis en "## À noterTexte…" par l'ingestion XML.
const CALLOUT_LABELS = ["À noter", "À savoir", "Attention", "Rappel", "Exemple"];

/**
 * Contenu stocké en pseudo-markdown (## titres, - puces) → blocs typés.
 * Le flatten XML de l'ingestion colle parfois "## Titre" en fin de phrase et
 * le texte suivant au titre ("… ?La suite") : on répare ces coutures ici.
 */
function parseContent(content: string): Block[] {
  const blocks: Block[] = [];
  let list: string[] | null = null;

  const pushHeading = (head: string) => {
    const callout = CALLOUT_LABELS.find((c) => head.startsWith(c));
    if (callout) {
      blocks.push({ type: "note", label: callout, text: head.slice(callout.length).trim() });
      return;
    }
    // "Qu'est-ce que… ?La médaille…" → titre jusqu'au "?", le reste en paragraphe.
    const glued = head.match(/^(.{3,140}?\?)\s*(\p{Lu}.*)$/u);
    if (glued) {
      blocks.push({ type: "h2", text: glued[1] });
      blocks.push({ type: "p", text: glued[2] });
    } else {
      blocks.push({ type: "h2", text: head });
    }
  };

  const normalized = content.replace(/\s*##\s+/g, "\n\n## ");
  for (const raw of normalized.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("- ")) {
      (list ??= []).push(line.slice(2));
      continue;
    }
    if (list) {
      blocks.push({ type: "ul", items: list });
      list = null;
    }
    if (line.startsWith("## ")) pushHeading(line.slice(3).trim());
    else blocks.push({ type: "p", text: line });
  }
  if (list) blocks.push({ type: "ul", items: list });

  // L'ingestion préfixe le corps par la description : première entrée dupliquée.
  if (
    blocks.length >= 2 &&
    blocks[0].type === "p" &&
    blocks[1].type === "p" &&
    blocks[1].text.startsWith(blocks[0].text.slice(0, 60))
  ) {
    blocks.shift();
  }
  return blocks;
}

function metaDescription(fiche: { title: string | null; content: string }): string {
  const base = fiche.title ?? fiche.content.replace(/\s+/g, " ");
  const cut = base.slice(0, 155);
  return cut.length < base.length ? `${cut.replace(/\s+\S*$/, "")}…` : cut;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cid = cidFromSlug(params.slug);
  if (!cid) return {};
  const fiche = await getFiche(cid);
  if (!fiche) return {};
  return {
    title: fiche.reference,
    description: metaDescription(fiche),
    alternates: { canonical: `${BASE_URL}/droits/${ficheSlug(fiche)}` },
    openGraph: {
      type: "article",
      locale: "fr_FR",
      url: `${BASE_URL}/droits/${ficheSlug(fiche)}`,
      title: fiche.reference,
      description: metaDescription(fiche),
    },
  };
}

export default async function FichePage({ params }: Props) {
  const cid = cidFromSlug(params.slug);
  if (!cid) notFound();
  const fiche = await getFiche(cid);
  if (!fiche) notFound();

  // Une seule URL canonique par fiche : tout autre libellé redirige en 301.
  const canonicalSlug = ficheSlug(fiche);
  if (params.slug !== canonicalSlug) permanentRedirect(`/droits/${canonicalSlug}`);

  const [related, blocks] = [
    await getRelated(fiche.domains, fiche.cid),
    parseContent(fiche.content),
  ];
  const domainLinks = FICHE_DOMAINS.filter((d) => fiche.domains.includes(d.id));
  const primaryDomain = domainLinks[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: fiche.reference,
        description: metaDescription(fiche),
        inLanguage: "fr-FR",
        url: `${BASE_URL}/droits/${canonicalSlug}`,
        isBasedOn: fiche.source_url ?? undefined,
        author: { "@id": `${BASE_URL}/#organization` },
        publisher: { "@id": `${BASE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Vos droits", item: `${BASE_URL}/droits` },
          ...(primaryDomain
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: primaryDomain.label,
                  item: `${BASE_URL}/droits/domaine/${primaryDomain.id}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: primaryDomain ? 3 : 2,
            name: fiche.reference,
            item: `${BASE_URL}/droits/${canonicalSlug}`,
          },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Fil d'Ariane" className="text-xs text-midnight-500">
        <Link href="/droits" className="hover:text-midnight-800">
          Vos droits
        </Link>
        {primaryDomain && (
          <>
            {" / "}
            <Link
              href={`/droits/domaine/${primaryDomain.id}`}
              className="hover:text-midnight-800"
            >
              {primaryDomain.label}
            </Link>
          </>
        )}
      </nav>

      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-midnight-900">
        {fiche.reference}
      </h1>

      <div className="prose-avocat mt-8 space-y-4 text-[15px] leading-relaxed text-midnight-800">
        {blocks.map((b, i) =>
          b.type === "h2" ? (
            <h2 key={i} className="pt-4 text-xl font-semibold text-midnight-900">
              {b.text}
            </h2>
          ) : b.type === "note" ? (
            <div key={i} className="rounded-lg border-l-2 border-brass-400 bg-brass-50/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brass-700">
                {b.label}
              </p>
              {b.text && <p className="mt-1 text-sm text-midnight-800">{b.text}</p>}
            </div>
          ) : b.type === "ul" ? (
            <ul key={i} className="list-disc space-y-1.5 pl-5">
              {b.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          ) : (
            <p key={i}>{b.text}</p>
          )
        )}
      </div>

      <div className="mt-10 rounded-xl border border-brass-200 bg-brass-50 p-5">
        <p className="font-semibold text-midnight-900">
          Votre situation est particulière ?
        </p>
        <p className="mt-1 text-sm text-midnight-700">
          Décrivez-la et obtenez une réponse gratuite fondée sur les textes en vigueur,
          avec les références citées.
        </p>
        <Link
          href="/chat"
          className="mt-4 inline-block rounded-lg bg-midnight-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-midnight-800"
        >
          Poser ma question gratuitement
        </Link>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-midnight-500">
        Source officielle :{" "}
        {fiche.source_url ? (
          <a
            href={fiche.source_url}
            rel="noopener noreferrer"
            target="_blank"
            className="underline hover:text-midnight-700"
          >
            Service-Public.fr (DILA)
          </a>
        ) : (
          "Service-Public.fr (DILA)"
        )}
        , licence ouverte 2.0 — contenu mis à jour quotidiennement par la Direction de
        l&apos;information légale et administrative.
      </p>

      {related.length > 0 && (
        <aside className="mt-12 border-t border-midnight-100 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-midnight-500">
            Fiches liées
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.cid}>
                <Link
                  href={`/droits/${ficheSlug(r)}`}
                  className="block rounded-md px-2 py-1.5 text-sm leading-snug text-midnight-700 transition hover:bg-white hover:text-midnight-950"
                >
                  {r.reference}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
