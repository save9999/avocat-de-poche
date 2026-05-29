"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  ChatMessage,
  ChatMessageData,
  ChatSource,
  TypingIndicator,
} from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Disclaimer } from "@/components/Disclaimer";
import { ActionPlan } from "@/components/ActionPlan";
import { LawyerHandoff } from "@/components/LawyerHandoff";
import { ScaleIcon } from "@/components/ScaleIcon";
import { DOMAINS, DOMAIN_LIST, type DomainId, getDomain } from "@/data/domains";

type PlanTab = "letter" | "evidence" | "contacts" | "lawyer";

const GENERAL_INTRO = `Bonjour. Je suis **Avocat de Poche**, votre assistant d'information juridique en droit français.

Pour mieux vous orienter, dites-moi en quelques mots **ce qui se passe** : qui est concerné, depuis quand, et quels faits précis ? Je citerai les articles applicables et vous aiderai à construire un plan d'action.

Si vous préférez, choisissez un domaine ci-dessus.`;

function buildIntroMessage(domain: DomainId | null): ChatMessageData {
  if (domain && DOMAINS[domain]) {
    return {
      id: "intro",
      role: "assistant",
      content: DOMAINS[domain].introMessage,
    };
  }
  return { id: "intro", role: "assistant", content: GENERAL_INTRO };
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialDomain = searchParams.get("domain") as DomainId | null;
  const [domain, setDomain] = useState<DomainId | null>(
    initialDomain && getDomain(initialDomain) ? initialDomain : null
  );

  const [messages, setMessages] = useState<ChatMessageData[]>(() => [
    buildIntroMessage(domain),
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [planTab, setPlanTab] = useState<PlanTab>("contacts");
  const [specialtyLabel, setSpecialtyLabel] = useState<string | null>(null);
  const hasAutoOpenedRef = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastInputRef = useRef<string>("");
  const userMessageCount = useMemo(
    () => messages.filter((m) => m.role === "user").length,
    [messages]
  );
  const canGeneratePlan = userMessageCount >= 1;
  const showHandoff = userMessageCount >= 1 && !loading;

  const domainConfig = useMemo(() => (domain ? DOMAINS[domain] : null), [domain]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const switchDomain = (next: DomainId | null) => {
    setDomain(next);
    setMessages([buildIntroMessage(next)]);
    setError(null);
    setPlanOpen(false);
    setSpecialtyLabel(null);
    hasAutoOpenedRef.current = false;
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("domain", next);
    else params.delete("domain");
    const qs = params.toString();
    router.replace(qs ? `/chat?${qs}` : "/chat", { scroll: false });
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    lastInputRef.current = trimmed;
    const userMsg: ChatMessageData = { id: generateId(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const apiPayload = nextMessages
        .filter((m) => m.id !== "intro")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiPayload, mode: "chat", domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur HTTP ${res.status}`);

      const sources: ChatSource[] = Array.isArray(data.sources)
        ? (data.sources as ChatSource[]).filter(
            (s) => s && typeof s.reference === "string"
          )
        : [];
      const assistantMsg: ChatMessageData = {
        id: generateId(),
        role: "assistant",
        content: data.reply || "(Réponse vide)",
        sources: sources.length > 0 ? sources : undefined,
      };
      setMessages((m) => [...m, assistantMsg]);

      if (!hasAutoOpenedRef.current) {
        hasAutoOpenedRef.current = true;
        try {
          const specRes = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [...apiPayload, { role: "assistant", content: assistantMsg.content }],
              mode: "specialty",
              domain,
            }),
          });
          if (specRes.ok) {
            const specData = await specRes.json();
            if (specData?.label) setSpecialtyLabel(specData.label);
          }
        } catch { /* silencieux */ }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau inconnue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-midnight-50">
      <Disclaimer />

      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b border-midnight-100 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-midnight-600 transition hover:bg-midnight-50 hover:text-midnight-900"
            aria-label="Retour à l'accueil"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-midnight-900 text-white">
              <ScaleIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-base font-semibold leading-none text-midnight-900">
                {domainConfig ? domainConfig.label : "Avocat de Poche"}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-midnight-500">
                {domainConfig ? "Consultation juridique" : "Tous domaines"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setPlanTab("contacts");
            setPlanOpen(true);
          }}
          disabled={!canGeneratePlan}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${
            canGeneratePlan
              ? "bg-sage-700 text-white hover:bg-sage-800"
              : "cursor-not-allowed bg-midnight-100 text-midnight-400"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Mon plan d'action</span>
          <span className="sm:hidden">Plan</span>
        </button>
      </header>

      {/* ── Sélecteur de domaine ── */}
      <nav className="border-b border-midnight-100 bg-white" aria-label="Domaines juridiques">
        <div className="scrollbar-thin mx-auto flex max-w-5xl items-center gap-1.5 overflow-x-auto px-4 py-2 sm:px-6">
          <button
            onClick={() => switchDomain(null)}
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              domain === null
                ? "bg-midnight-900 text-white"
                : "bg-midnight-50 text-midnight-600 hover:bg-midnight-100"
            }`}
          >
            Tous
          </button>
          {DOMAIN_LIST.map((d) => (
            <button
              key={d.id}
              onClick={() => switchDomain(d.id)}
              className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                domain === d.id
                  ? "bg-midnight-900 text-white"
                  : "bg-midnight-50 text-midnight-600 hover:bg-midnight-100"
              }`}
            >
              {d.shortLabel}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Conversation ── */}
      <main ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-3 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {loading && <TypingIndicator />}
          {showHandoff && !planOpen && (
            <LawyerHandoff
              conversation={messages.filter((m) => m.id !== "intro")}
              domain={domain}
              specialtyLabel={specialtyLabel}
              onOpenPlan={() => {
                setPlanTab("lawyer");
                setPlanOpen(true);
              }}
            />
          )}
          {/* Exemples si conversation vide */}
          {userMessageCount === 0 && (
            <div className="mt-2 rounded-2xl border border-midnight-100 bg-white p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-midnight-500">
                Exemples de questions
              </p>
              <ul className="space-y-1.5">
                {domainConfig
                  ? domainConfig.examples.map((ex) => (
                      <li key={ex}>
                        <button
                          onClick={() => setInput(ex)}
                          className="text-left text-sm text-midnight-700 hover:text-midnight-900"
                        >
                          → {ex}
                        </button>
                      </li>
                    ))
                  : [
                      "Mon employeur ne m'a pas payé ce mois-ci, que puis-je faire ?",
                      "Mon propriétaire refuse de rendre ma caution, quels sont mes droits ?",
                      "J'ai reçu une mise en demeure, comment dois-je réagir ?",
                      "Mon voisin fait du bruit toutes les nuits, quels recours ai-je ?",
                    ].map((ex) => (
                      <li key={ex}>
                        <button
                          onClick={() => setInput(ex)}
                          className="text-left text-sm text-midnight-700 hover:text-midnight-900"
                        >
                          → {ex}
                        </button>
                      </li>
                    ))}
              </ul>
            </div>
          )}
          {error && (
            <div className="fade-in rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p><strong>Erreur :</strong> {error}</p>
              {lastInputRef.current && (
                <button
                  onClick={() => {
                    // Retire le dernier message utilisateur sans réponse, puis relance
                    setMessages((prev) => {
                      const last = [...prev];
                      if (last.length > 0 && last[last.length - 1].role === "user") {
                        last.pop();
                      }
                      return last;
                    });
                    setError(null);
                    setInput(lastInputRef.current);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                >
                  ↺ Réessayer
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Input ── */}
      <footer className="border-t border-midnight-100 bg-white px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={sendMessage}
            disabled={loading}
          />
          <p className="mt-2 text-center text-xs text-midnight-400">
            Cet outil ne remplace pas un avocat.{" "}
            <Link href="/confidentialite" className="underline hover:text-midnight-600">
              Confidentialité
            </Link>{" "}·{" "}
            <Link href="/mentions-legales" className="underline hover:text-midnight-600">
              Mentions légales
            </Link>
          </p>
        </div>
      </footer>

      <ActionPlan
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        conversation={messages.filter((m) => m.id !== "intro")}
        initialTab={planTab}
        domain={domain}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] items-center justify-center bg-midnight-50">
          <div className="flex gap-1">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  );
}
