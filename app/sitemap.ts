import type { MetadataRoute } from "next";
import { FICHE_DOMAINS, ficheSlug, listAllFiches } from "@/lib/fiches";

const BASE_URL = "https://avocat-de-poche.vercel.app";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/droits`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cgu`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  const domainPages: MetadataRoute.Sitemap = FICHE_DOMAINS.map((d) => ({
    url: `${BASE_URL}/droits/domaine/${d.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  let fichePages: MetadataRoute.Sitemap = [];
  try {
    const fiches = await listAllFiches();
    fichePages = fiches.map((f) => ({
      url: `${BASE_URL}/droits/${ficheSlug(f)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Base indisponible : on sert au moins les pages statiques.
  }

  return [...staticPages, ...domainPages, ...fichePages];
}
