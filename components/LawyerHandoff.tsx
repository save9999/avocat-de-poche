"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessageData } from "./ChatMessage";
import { CheckIcon, CloseIcon, CopyIcon } from "./ScaleIcon";
import { type DomainId } from "@/data/domains";

interface LawyerHandoffProps {
  conversation: ChatMessageData[];
  domain: DomainId | null;
  specialtyLabel?: string | null;
  onOpenPlan: () => void;
}

export function LawyerHandoff({
  conversation,
  domain,
  specialtyLabel,
  onOpenPlan,
}: LawyerHandoffProps) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || summary || loading) return;
    if (conversation.length === 0) return;
    let cancelled = false;
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversation.map((m) => ({ role: m.role, content: m.content })),
            mode: "handoff",
            domain,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors de la génération.");
        if (!cancelled) setSummary(data.summary || "");
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Erreur inconnue.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [open, summary, loading, conversation, domain]);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `dossier-pre-analyse-${stamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="fade-in rounded-2xl border-2 border-sage-300 bg-gradient-to-br from-sage-50 via-white to-sage-50 p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sage-700 text-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
              <path
                d="M9 12h6m-6 4h6m-9 5h12a2 2 0 002-2V7l-5-5H6a2 2 0 00-2 2v15a2 2 0 002 2z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-sage-700">
              Étape suivante
            </p>
            <h3 className="mt-1 font-serif text-xl font-semibold text-midnight-900">
              Faites relire votre dossier par un vrai avocat
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-midnight-700">
              {specialtyLabel ? (
                <>
                  Nous préparons un <strong>dossier pré-analysé</strong> reprenant
                  les faits, leur qualification juridique et les pièces à
                  rassembler — prêt à être transmis à un avocat en{" "}
                  <span className="font-semibold">{specialtyLabel}</span>.
                </>
              ) : (
                <>
                  Nous préparons un <strong>dossier pré-analysé</strong> reprenant
                  les faits, leur qualification juridique et les pièces à
                  rassembler — prêt à être transmis à un avocat partenaire.
                </>
              )}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-sage-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sage-800"
              >
                Transmettre mon dossier pré-analysé à un avocat en direct
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14m-6-6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={onOpenPlan}
                className="text-xs font-medium text-midnight-600 underline-offset-2 hover:underline"
              >
                Voir aussi : lettre, preuves, contacts utiles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal dossier pré-analysé ── */}
      <div
        className={`fixed inset-0 z-50 bg-midnight-950/50 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Dossier pré-analysé"
        className={`fixed inset-x-0 top-0 z-50 mx-auto flex h-full max-w-3xl flex-col bg-white shadow-2xl transition-transform duration-300 sm:inset-x-4 sm:top-8 sm:h-[calc(100%-4rem)] sm:rounded-2xl ${
          open ? "translate-y-0" : "translate-y-full sm:translate-y-4"
        } ${open ? "" : "pointer-events-none"}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-midnight-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-sage-700">
              Dossier pré-analysé
            </p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-midnight-900">
              Prêt à être transmis à un avocat
            </h2>
            <p className="mt-1 text-xs text-midnight-500">
              Relisez la synthèse, puis copiez-la ou téléchargez-la. Aucune donnée
              n'est conservée.
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-midnight-500 transition hover:bg-midnight-50 hover:text-midnight-900"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex gap-1">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
              <p className="mt-4 text-sm text-midnight-600">
                Analyse de votre conversation et structuration du dossier…
              </p>
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <strong>Erreur :</strong> {error}
            </div>
          )}
          {!loading && !error && summary && (
            <article className="prose-legal text-sm leading-relaxed text-midnight-900">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </article>
          )}
        </div>

        <footer className="flex flex-col gap-2 border-t border-midnight-100 bg-midnight-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!summary}
              className="inline-flex items-center gap-1.5 rounded-lg border border-midnight-200 bg-white px-3 py-2 text-xs font-medium text-midnight-700 transition hover:border-midnight-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4 text-sage-700" /> Copié
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4" /> Copier le dossier
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={!summary}
              className="inline-flex items-center gap-1.5 rounded-lg border border-midnight-200 bg-white px-3 py-2 text-xs font-medium text-midnight-700 transition hover:border-midnight-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Télécharger (.md)
            </button>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onOpenPlan();
            }}
            disabled={!summary}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sage-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trouver un avocat partenaire
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17L17 7M9 7h8v8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </footer>
      </div>
    </>
  );
}
