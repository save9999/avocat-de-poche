import type { MetadataRoute } from "next";
import { DOMAIN_LIST } from "@/data/domains";

const BASE_URL = "https://avocat-de-poche.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/chat`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cgu`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  const domainPages: MetadataRoute.Sitemap = DOMAIN_LIST.map((d) => ({
    url: `${BASE_URL}/chat?domain=${d.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...domainPages];
}
