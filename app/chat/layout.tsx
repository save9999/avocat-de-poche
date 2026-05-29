import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat — Avocat de Poche",
  description: "Posez votre question juridique à l'assistant Avocat de Poche.",
  robots: { index: false, follow: false },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
