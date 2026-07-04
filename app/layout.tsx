import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
});

const BASE_URL = "https://avocat-de-poche.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Avocat de Poche — Vos droits expliqués simplement (droit français, gratuit)",
    template: "%s | Avocat de Poche",
  },
  description:
    "Information juridique gratuite tous domaines (travail, logement, famille, consommation, pénal, harcèlement scolaire). Articles de loi français cités, plan d'action concret, contacts d'urgence. Gratuit, anonyme, 24h/24.",
  keywords: [
    "information juridique gratuite",
    "droit français",
    "droit du travail",
    "droit du logement",
    "droit de la famille",
    "droit de la consommation",
    "droit pénal",
    "harcèlement scolaire",
    "licenciement abusif",
    "dépôt de garantie",
    "rétractation 14 jours",
    "pension alimentaire",
    "divorce",
    "porter plainte",
    "aide juridique",
    "avocat de poche",
  ],
  authors: [{ name: "Avocat de Poche" }],
  creator: "Avocat de Poche",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: "JF55jJJhp4OAflrlV-fGMfX3-WJiR1GgMfcpZUQdCYA",
  },
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: BASE_URL,
    siteName: "Avocat de Poche",
    title: "Avocat de Poche — Vos droits expliqués simplement",
    description:
      "Information juridique gratuite tous domaines (travail, logement, famille, conso, pénal, harcèlement scolaire). Articles de loi cités, plan d'action concret. 24h/24.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Avocat de Poche — Information juridique gratuite en droit français",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Avocat de Poche — Vos droits expliqués simplement",
    description:
      "Information juridique gratuite tous domaines. Articles de loi cités, plan d'action concret. 24h/24.",
    images: ["/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Avocat de Poche",
      description:
        "Service d'information juridique gratuit sur le droit français — tous domaines",
      inLanguage: "fr-FR",
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/chat?domain={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Avocat de Poche",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon.svg`,
        alt: "Logo Avocat de Poche",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "contact@avocatdepoche.fr",
        contactType: "customer support",
        availableLanguage: "French",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/#webpage`,
      url: BASE_URL,
      name: "Avocat de Poche — Vos droits expliqués simplement",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      about: { "@id": `${BASE_URL}/#organization` },
      description:
        "Information juridique généraliste sur le droit français : travail, logement, famille, consommation, pénal, harcèlement scolaire.",
      inLanguage: "fr-FR",
    },
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faqpage`,
      url: `${BASE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "C'est vraiment gratuit ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui, entièrement. Aucun compte, aucune carte bancaire. Le projet vit grâce aux dons.",
          },
        },
        {
          "@type": "Question",
          name: "L'outil peut-il remplacer un avocat ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Non. Avocat de Poche fournit une information juridique fondée sur la loi en vigueur. Pour une stratégie personnalisée, un avocat reste indispensable.",
          },
        },
        {
          "@type": "Question",
          name: "Sur quelle base les articles sont-ils cités ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "L'outil utilise la base officielle Légifrance / DILA. Une recherche sémantique (RAG) récupère les articles pertinents qui sont ensuite cités avec leur référence exacte.",
          },
        },
        {
          "@type": "Question",
          name: "Mes données sont-elles conservées ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Non. Aucun compte n'est requis. Les conversations ne sont ni stockées, ni revendues.",
          },
        },
        {
          "@type": "Question",
          name: "Quels domaines sont couverts ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Six domaines : droit du travail, du logement, de la consommation, de la famille, droit pénal et victimes, harcèlement scolaire.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-paper text-midnight-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-midnight-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-brass-500 focus:ring-offset-2"
        >
          Aller au contenu principal
        </a>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
