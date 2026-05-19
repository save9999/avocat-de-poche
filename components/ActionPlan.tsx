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

type Tab = "letter" | "evidence" | "contacts" | "lawyer";

interface SpecialtyResult {
  specialty: string;
  label: string;
  keywords: string[];
  reason: string;
}

const SPECIALTY_LINKS: Record<
  string,
  { justifit: string; cnbSpecialty: string }
> = {
  "droit-penal-mineurs": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-penal/",
    cnbSpecialty: "Droit pénal",
  },
  "droit-penal-numerique": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-internet/",
    cnbSpecialty: "Droit des nouvelles technologies",
  },
  "droit-education": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-administratif/",
    cnbSpecialty: "Droit public",
  },
  "droit-penal-general": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-penal/",
    cnbSpecialty: "Droit pénal",
  },
};

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
  const [specialty, setSpecialty] = useState<SpecialtyResult | null>(null);
  const [specialtyLoading, setSpecialtyLoading] = useState(false);
  const [postalCode, setPostalCode] = useState("");

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

  useEffect(() => {
    if (!open || activeTab !== "lawyer" || specialty || specialtyLoading) return;
    if (conversation.length === 0) return;

    const fetchSpecialty = async () => {
      setSpecialtyLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversation.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            mode: "specialty",
          }),
        });
        const data = (await res.json()) as SpecialtyResult;
        if (res.ok && data.specialty) {
          setSpecialty(data);
        }
      } catch {
        // silent fallback — l'UI affichera les liens génériques
      } finally {
        setSpecialtyLoading(false);
      }
    };

    fetchSpecialty();
  }, [open, activeTab, conversation, specialty, specialtyLoading]);

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
          <TabButton
            active={activeTab === "lawyer"}
            onClick={() => setActiveTab("lawyer")}
            label="Trouver un avocat"
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
          {activeTab === "lawyer" && (
            <LawyerTab
              specialty={specialty}
              loading={specialtyLoading}
              postalCode={postalCode}
              onPostalCodeChange={setPostalCode}
            />
          )}
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

function LawyerTab({
  specialty,
  loading,
  postalCode,
  onPostalCodeChange,
}: {
  specialty: SpecialtyResult | null;
  loading: boolean;
  postalCode: string;
  onPostalCodeChange: (v: string) => void;
}) {
  const links =
    (specialty && SPECIALTY_LINKS[specialty.specialty]) ||
    SPECIALTY_LINKS["droit-penal-mineurs"];

  const cityParam = postalCode.trim()
    ? `&cp=${encodeURIComponent(postalCode.trim())}`
    : "";
  const utm = "utm_source=avocat-de-poche&utm_medium=app&utm_campaign=plan-action";

  const justifitUrl = `${links.justifit}?${utm}${cityParam}`;
  const cnbUrl = `https://cnb.avocat.fr/fr/annuaire-avocat?specialite=${encodeURIComponent(
    links.cnbSpecialty
  )}${postalCode.trim() ? `&ville=${encodeURIComponent(postalCode.trim())}` : ""}`;
  const ajUrl =
    "https://www.service-public.fr/particuliers/vosdroits/F18074";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-midnight-100 bg-midnight-50 p-4 text-sm text-midnight-700">
        Trois voies sérieuses pour consulter un avocat compétent. Aucune
        recommandation nominative : vous restez libre du choix.
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-midnight-100 bg-white p-4">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <p className="ml-2 text-sm text-midnight-600">
            Analyse de votre situation pour orienter vers la bonne spécialité...
          </p>
        </div>
      ) : specialty ? (
        <div className="rounded-xl border border-sage-200 bg-sage-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-sage-700">
            Spécialité recommandée
          </p>
          <p className="mt-1 font-serif text-lg font-semibold text-midnight-900">
            {specialty.label}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-midnight-700">
            {specialty.reason}
          </p>
          {specialty.keywords?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {specialty.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-white px-2.5 py-1 text-xs text-sage-800 ring-1 ring-sage-200"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="rounded-xl border border-midnight-100 bg-white p-4">
        <label
          htmlFor="postal-code"
          className="block text-xs font-medium uppercase tracking-wider text-midnight-500"
        >
          Code postal (optionnel)
        </label>
        <input
          id="postal-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{5}"
          maxLength={5}
          value={postalCode}
          onChange={(e) =>
            onPostalCodeChange(e.target.value.replace(/[^0-9]/g, ""))
          }
          placeholder="75001"
          className="mt-2 w-40 rounded-lg border border-midnight-200 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-100"
        />
        <p className="mt-2 text-xs text-midnight-500">
          Si renseigné, les recherches seront pré-filtrées sur votre ville.
        </p>
      </div>

      <LawyerCard
        title="Annuaire officiel des avocats (CNB)"
        badge="Source officielle"
        badgeTone="midnight"
        description="Annuaire du Conseil National des Barreaux. Gratuit, sans intermédiaire, source officielle. Recherche par spécialité et ville."
        ctaLabel="Ouvrir l'annuaire CNB"
        href={cnbUrl}
      />
      <LawyerCard
        title="Justifit — mise en relation rapide"
        badge="Réponse sous 24h"
        badgeTone="sage"
        description="Plateforme française qui vous met en relation avec un avocat partenaire selon votre spécialité et votre ville. Premier contact souvent gratuit."
        ctaLabel="Voir les avocats sur Justifit"
        href={justifitUrl}
      />
      <LawyerCard
        title="Aide juridictionnelle (revenus modestes)"
        badge="Service public"
        badgeTone="amber"
        description="Si vos revenus sont en dessous des plafonds, l'État prend en charge tout ou partie des honoraires d'avocat. Simulateur officiel et démarche en ligne."
        ctaLabel="Vérifier mon éligibilité"
        href={ajUrl}
      />

      <p className="mt-2 text-xs leading-relaxed text-midnight-500">
        Avocat de Poche peut percevoir une commission lorsque vous prenez
        contact via Justifit. Cette commission n'influe pas sur les conseils
        que vous a donnés l'application.
      </p>
    </div>
  );
}

function LawyerCard({
  title,
  description,
  badge,
  badgeTone,
  ctaLabel,
  href,
}: {
  title: string;
  description: string;
  badge: string;
  badgeTone: "midnight" | "sage" | "amber";
  ctaLabel: string;
  href: string;
}) {
  const toneClasses: Record<typeof badgeTone, string> = {
    midnight: "bg-midnight-900 text-white",
    sage: "bg-sage-700 text-white",
    amber: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-midnight-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sage-300 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold text-midnight-900">
          {title}
        </h3>
        <span
          className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${toneClasses[badgeTone]}`}
        >
          {badge}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-midnight-700">
        {description}
      </p>
      <div className="mt-3 inline-flex items-center text-sm font-medium text-sage-700">
        {ctaLabel}
        <svg className="ml-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 17L17 7M9 7h8v8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </a>
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
