import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avocat de Poche — Vulgarisation juridique du harcèlement scolaire",
  description:
    "Outil d'information juridique français. Comprendre la loi face au harcèlement scolaire, identifier les démarches et conserver les bonnes preuves.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-midnight-50 text-midnight-900 antialiased">
        {children}
      </body>
    </html>
  );
}
