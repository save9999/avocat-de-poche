"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("cookie-notice-dismissed");
      if (!dismissed) setVisible(true);
    } catch {
      // localStorage non disponible (navigation privée strict) — ne pas afficher
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem("cookie-notice-dismissed", "1");
    } catch {
      // silencieux
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Avis sur les cookies"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-midnight-100 bg-white px-4 py-4 shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-midnight-700">
          Ce site n'utilise <strong>aucun cookie de traçage</strong>. Seuls des cookies techniques strictement nécessaires au fonctionnement peuvent être définis.{" "}
          <Link
            href="/confidentialite"
            className="underline hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            En savoir plus
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-lg border border-midnight-200 bg-white px-4 py-2 text-sm font-medium text-midnight-700 transition hover:bg-midnight-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="Fermer cet avis sur les cookies"
        >
          Compris
        </button>
      </div>
    </div>
  );
}
