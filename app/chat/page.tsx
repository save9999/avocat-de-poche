"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChatMessage,
  ChatMessageData,
  TypingIndicator,
} from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Disclaimer } from "@/components/Disclaimer";
import { ActionPlan } from "@/components/ActionPlan";
import { ScaleIcon } from "@/components/ScaleIcon";

const INTRO_MESSAGE: ChatMessageData = {
  id: "intro",
  role: "assistant",
  content: `Bonjour. Je suis **Avocat de Poche**, un outil d'information juridique sur le harcèlement scolaire en droit français.

Je ne suis pas un avocat, mais je peux :
- vous écouter et vous aider à mettre des mots sur ce qui se passe,
- vous citer les articles de loi applicables (Code pénal, Code de l'éducation),
- vous guider vers les démarches concrètes (signalement, dépôt de plainte, contacts utiles).

Pour commencer, pouvez-vous me décrire la situation ? Qui est concerné (vous, votre enfant, un proche), depuis quand cela se passe-t-il, et de quel type de faits s'agit-il (insultes, mise à l'écart, violences physiques, messages en ligne...) ?`,
};

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>([INTRO_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const userMessageCount = useMemo(
    () => messages.filter((m) => m.role === "user").length,
    [messages]
  );

  const canGeneratePlan = userMessageCount >= 2;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessageData = {
      id: generateId(),
      role: "user",
      content: trimmed,
    };

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
        body: JSON.stringify({ messages: apiPayload, mode: "chat" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Erreur HTTP ${res.status}`);
      }

      const assistantMsg: ChatMessageData = {
        id: generateId(),
        role: "assistant",
        content: data.reply || "(Réponse vide)",
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur réseau inconnue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-midnight-50">
      <Disclaimer />

      <header className="flex items-center justify-between border-b border-midnight-100 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-midnight-600 transition hover:bg-midnight-50 hover:text-midnight-900"
            aria-label="Retour à l'accueil"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-midnight-900 text-white">
              <ScaleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-base font-semibold leading-none text-midnight-900">
                Harcèlement scolaire
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-midnight-500">
                Consultation juridique
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setPlanOpen(true)}
          disabled={!canGeneratePlan}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
            canGeneratePlan
              ? "bg-sage-700 text-white hover:bg-sage-800"
              : "cursor-not-allowed bg-midnight-100 text-midnight-400"
          }`}
          title={
            canGeneratePlan
              ? "Générer votre plan d'action"
              : "Échangez quelques messages avant d'ouvrir le plan d'action"
          }
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path
              d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:inline">Mon plan d'action</span>
          <span className="sm:hidden">Plan</span>
        </button>
      </header>

      <main
        ref={scrollRef}
        className="scrollbar-thin flex-1 overflow-y-auto px-3 py-6 sm:px-6"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {loading && <TypingIndicator />}
          {error && (
            <div className="fade-in rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <strong>Erreur :</strong> {error}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-midnight-100 bg-white px-3 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={sendMessage}
            disabled={loading}
          />
        </div>
      </footer>

      <ActionPlan
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        conversation={messages.filter((m) => m.id !== "intro")}
      />
    </div>
  );
}
