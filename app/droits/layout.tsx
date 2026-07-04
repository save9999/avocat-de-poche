import Link from "next/link";
import { ScaleIcon } from "@/components/ScaleIcon";

export default function DroitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-50">
      <header className="border-b border-midnight-100 bg-paper-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-midnight-900">
            <ScaleIcon className="h-6 w-6 text-brass-500" />
            <span className="text-sm font-semibold tracking-tight">Avocat de Poche</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/droits"
              className="text-sm font-medium text-midnight-700 hover:text-midnight-900"
            >
              Vos droits
            </Link>
            <Link
              href="/chat"
              className="rounded-lg bg-midnight-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-midnight-800"
            >
              Poser ma question
            </Link>
          </nav>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="border-t border-midnight-100 py-8">
        <div className="mx-auto max-w-5xl px-4 text-xs leading-relaxed text-midnight-500 sm:px-6">
          <p>
            Contenus issus de{" "}
            <a
              href="https://www.service-public.fr"
              rel="noopener noreferrer"
              target="_blank"
              className="underline hover:text-midnight-700"
            >
              Service-Public.fr
            </a>{" "}
            (DILA) — licence ouverte 2.0. Information juridique générale, pas un conseil
            juridique personnalisé.
          </p>
        </div>
      </footer>
    </div>
  );
}
