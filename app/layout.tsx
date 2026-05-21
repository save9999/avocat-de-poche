import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";

const BASE_URL = "https://avocat-de-poche.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Avocat de Poche — Information juridique gratuite sur le harcèlement scolaire",
    template: "%s | Avocat de Poche",
  },
  description:
    "Service d'information juridique gratuit sur le harcèlement scolaire. Parents et adolescents : comprenez vos droits, les lois applicables et les démarches à suivre. Numéros d'urgence : 3018, 119, 3020. Disponible 24h/24.",
  keywords: [
    "harcèlement scolaire",
    "droits harcèlement scolaire",
    "loi harcèlement scolaire",
    "aide juridique gratuite",
    "3018",
    "119",
    "3020",
    "cyberharcèlement",
    "signalement harcèlement",
    "recours harcèlement scolaire",
    "code pénal harcèlement",
    "protection mineurs",
    "aide parents harcèlement",
    "info juridique ados",
  ],
  authors: [{ name: "Avocat de Poche" }],
  creator: "Avocat de Poche",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: BASE_URL,
    siteName: "Avocat de Poche",
    title: "Avocat de Poche — Information juridique gratuite sur le harcèlement scolaire",
    description:
      "Comprenez vos droits face au harcèlement scolaire. Articles de loi, plan d'action concret, numéros d'urgence (3018, 119). Gratuit, anonyme, 24h/24.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Avocat de Poche — Information juridique gratuite sur le harcèlement scolaire, numéros 3018 et 119",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Avocat de Poche — Information juridique gratuite sur le harcèlement scolaire",
    description:
      "Comprenez vos droits face au harcèlement scolaire. Articles de loi, plan d'action, numéros d'urgence (3018, 119). Gratuit, anonyme, 24h/24.",
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
        "Service d'information juridique gratuit sur le harcèlement scolaire en France",
      inLanguage: "fr-FR",
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/chat`,
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
      sameAs: [],
    },
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/#webpage`,
      url: BASE_URL,
      name: "Avocat de Poche — Information juridique gratuite sur le harcèlement scolaire",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      about: { "@id": `${BASE_URL}/#organization` },
      description:
        "Service d'information juridique gratuit sur le harcèlement scolaire pour parents et adolescents.",
      inLanguage: "fr-FR",
      audience: {
        "@type": "Audience",
        audienceType: "Parents et adolescents victimes de harcèlement scolaire",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faqpage`,
      url: `${BASE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Est-ce vraiment gratuit ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui, entièrement. Aucun abonnement, aucune carte bancaire. L'outil est financé par des dons et des contributions bénévoles. Si vous souhaitez soutenir le projet, une contribution libre est bienvenue mais jamais obligatoire.",
          },
        },
        {
          "@type": "Question",
          name: "Mes données sont-elles conservées ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Non. Aucun compte n'est requis. Vos messages ne sont ni stockés, ni partagés, ni revendus. La conversation disparaît quand vous fermez la page. Votre vie privée est protégée par défaut.",
          },
        },
        {
          "@type": "Question",
          name: "L'outil peut-il remplacer un avocat ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Non, et nous le disons clairement. Avocat de Poche est un outil d'information juridique. Il vous aide à comprendre la loi et à vous préparer, mais ne constitue pas une consultation juridique. Si votre situation est grave, nous vous orientons vers des professionnels compétents.",
          },
        },
        {
          "@type": "Question",
          name: "Mon enfant peut-il l'utiliser seul ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui. L'interface est conçue pour être accessible aux adolescents. Le ton est rassurant, les réponses sont en français courant. Il est cependant préférable qu'un adulte accompagne l'enfant pour les démarches concrètes (signalement, dépôt de plainte).",
          },
        },
        {
          "@type": "Question",
          name: "Que se passe-t-il si j'ai besoin d'aide immédiate ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Si vous ou votre enfant êtes en danger immédiat, appelez le 17 (Police), le 119 (Allô Enfance en Danger) ou le 3018 (Net Écoute pour le cyberharcèlement). Ces numéros sont gratuits et disponibles 24h/24.",
          },
        },
        {
          "@type": "Question",
          name: "L'outil couvre-t-il le harcèlement entre adultes à l'école ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui. Si un enseignant, un CPE ou un autre adulte de l'établissement est l'auteur de comportements abusifs envers un élève, l'outil vous informe des recours spécifiques (signalement au rectorat, plainte pénale, etc.).",
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
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-midnight-50 text-midnight-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-midnight-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Aller au contenu principal
        </a>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
