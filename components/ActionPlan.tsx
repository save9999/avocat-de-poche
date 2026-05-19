"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessageData } from "./ChatMessage";
import {
  CheckIcon,
  ClipboardIcon,
  CloseIcon,
  CopyIcon,
  PhoneIcon,
} from "./ScaleIcon";
import lawsData from "@/data/laws.json";

type Tab = "letter" | "evidence" | "contacts";

interface ActionPlanProps {
  open: boolean;
  onClose: () => void;
  conversation: ChatMessageData[];
}

export function ActionPlan({ open, onClose, conversation }: ActionPlanProps) {
  const [activeTab, setActiveTab] = useState<Tab>("letter");
  const [letter, setLetter] = useState<string>("");
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || letter || letterLoading) return;
    if (conversation.length === 0) return;

    const fetchLetter = async () => {
      setLetterLoading(true);
      setLetterError(null);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversation.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            mode: "letter",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erreur lors de la génération.");
        }
        setLetter(data.letter || "");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erreur inconnue.";
        setLetterError(message);
      } finally {
        setLetterLoading(false);
      }
    };

    fetchLetter();
  }, [open, conversation, letter, letterLoading]);

  const handleCopy = async () => {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-midnight-950/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-midnight-200 bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Plan d'action"
      >
        <header className="flex items-center justify-between border-b border-midnight-100 px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-sage-700">
              Plan d'action personnalisé
            </p>
            <h2 className="font-serif text-2xl font-semibold text-midnight-900">
              Vos prochaines étapes
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le plan d'action"
            className="flex h-9 w-9 items-center justify-center rounded-full text-midnight-500 transition hover:bg-midnight-50 hover:text-midnight-900"
          >
            <CloseIcon />
          </button>
        </header>

        <nav className="flex border-b border-midnight-100 bg-midnight-50/40 px-6">
          <TabButton
            active={activeTab === "letter"}
            onClick={() => setActiveTab("letter")}
            label="Modèle de lettre"
          />
          <TabButton
            active={activeTab === "evidence"}
            onClick={() => setActiveTab("evidence")}
            label="Checklist des preuves"
          />
          <TabButton
            active={activeTab === "contacts"}
            onClick={() => setActiveTab("contacts")}
            label="Contacts d'urgence"
          />
        </nav>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-6">
          {activeTab === "letter" && (
            <LetterTab
              letter={letter}
              loading={letterLoading}
              error={letterError}
              copied={copied}
              onCopy={handleCopy}
            />
          )}
          {activeTab === "evidence" && <EvidenceTab />}
          {activeTab === "contacts" && <ContactsTab />}
        </div>
      </aside>
    </>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative -mb-px border-b-2 px-4 py-3 text-sm font-medium transition ${
        active
          ? "border-sage-600 text-midnight-900"
          : "border-transparent text-midnight-500 hover:text-midnight-800"
      }`}
    >
      {label}
    </button>
  );
}

function LetterTab({
  letter,
  loading,
  error,
  copied,
  onCopy,
}: {
  letter: string;
  loading: boolean;
  error: string | null;
  copied: boolean;
  onCopy: () => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex gap-1">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
        <p className="mt-4 text-sm text-midnight-600">
          Rédaction de votre lettre de signalement personnalisée...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 rounded-xl border border-sage-200 bg-sage-50 p-4">
        <div className="flex items-start gap-3">
          <ClipboardIcon className="mt-0.5 h-5 w-5 text-sage-700" />
          <p className="text-sm text-sage-900">
            Lettre de signalement formelle à adresser au chef d'établissement
            (en LRAR). Complétez les champs entre crochets avant envoi.
          </p>
        </div>
        <button
          onClick={onCopy}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-sage-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sage-800"
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4" /> Copié
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4" /> Copier
            </>
          )}
        </button>
      </div>
      <article className="prose-legal rounded-xl border border-midnight-100 bg-white p-6 text-sm leading-relaxed text-midnight-900">
        <ReactMarkdown>{letter || "Aucun contenu généré."}</ReactMarkdown>
      </article>
    </div>
  );
}

function EvidenceTab() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-midnight-100 bg-midnight-50 p-4 text-sm text-midnight-700">
        Conservez chacune de ces pièces dans un dossier dédié (papier et
        numérique). Elles serviront pour le signalement à l'établissement, le
        dépôt de plainte, et toute procédure ultérieure.
      </div>
      <ul className="space-y-2">
        {lawsData.preuvesRecommandees.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-midnight-100 bg-white p-4 text-sm text-midnight-800"
          >
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-semibold text-sage-700">
              {i + 1}
            </span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <strong>Conseil :</strong> Datez et nommez vos fichiers de manière
        systématique (ex : <code>2025-10-12_capture_message_eleveX.png</code>).
        Faites des copies sur un support externe.
      </div>
    </div>
  );
}

function ContactsTab() {
  return (
    <div className="space-y-3">
      {lawsData.contacts.map((contact) => (
        <div
          key={contact.nom}
          className="rounded-xl border border-midnight-100 bg-white p-4 transition hover:border-sage-300"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-midnight-900 text-white">
              <PhoneIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-serif text-lg font-semibold text-midnight-900">
                  {contact.nom}
                </h3>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-midnight-700">
                {contact.description}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-sage-700">
                {contact.horaires}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
