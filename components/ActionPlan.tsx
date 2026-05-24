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
import { DOMAINS, type DomainId, getDomain } from "@/data/domains";

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
  "droit-penal": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-penal/",
    cnbSpecialty: "Droit pénal",
  },
  "droit-penal-mineurs": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-penal/",
    cnbSpecialty: "Droit pénal",
  },
  "droit-travail": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-travail/",
    cnbSpecialty: "Droit du travail",
  },
  "droit-immobilier": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-immobilier/",
    cnbSpecialty: "Droit immobilier",
  },
  "droit-famille": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-famille/",
    cnbSpecialty: "Droit de la famille, des personnes et de leur patrimoine",
  },
  "droit-consommation": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-consommation/",
    cnbSpecialty: "Droit de la consommation",
  },
  "droit-administratif": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-administratif/",
    cnbSpecialty: "Droit public",
  },
  "droit-nouvelles-technologies": {
    justifit: "https://www.justifit.fr/specialite/avocat-droit-internet/",
    cnbSpecialty: "Droit des nouvelles technologies",
  },
};

// Domaine UI → spécialité par défaut si l'IA n'a pas répondu
const DOMAIN_TO_SPECIALTY: Record<DomainId, keyof typeof SPECIALTY_LINKS> = {
  "harcelement-scolaire": "droit-penal-mineurs",
  travail: "droit-travail",
  logement: "droit-immobilier",
  consommation: "droit-consommation",
  famille: "droit-famille",
  penal: "droit-penal",
};

interface ActionPlanProps {
  open: boolean;
  onClose: () => void;
  conversation: ChatMessageData[];
  initialTab?: Tab;
  domain: DomainId | null;
}

export function ActionPlan({
  open,
  onClose,
  conversation,
  initialTab = "contacts",
  domain,
}: ActionPlanProps) {
  const domainConfig = getDomain(domain);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  const [letter, setLetter] = useState<string>("");
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [specialty, setSpecialty] = useState<SpecialtyResult | null>(null);
  const [specialtyLoading, setSpecialtyLoading] = useState(false);
  const [postalCode, setPostalCode] = useState("");

  // Génération de la lettre (à la demande, quand l'onglet est ouvert)
  useEffect(() => {
    if (!open || activeTab !== "letter") return;
    if (letter || letterLoading) return;
    if (conversation.length === 0) return;
    const fetchLetter = async () => {
      setLetterLoading(true);
      setLetterError(null);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversation.map((m) => ({ role: m.role, content: m.content })),
            mode: "letter",
            domain,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors de la génération.");
        setLetter(data.letter || "");
      } catch (err) {
        setLetterError(err instanceof Error ? err.message : "Erreur inconnue.");
      } finally {
        setLetterLoading(false);
      }
    };
    fetchLetter();
  }, [open, activeTab, conversation, letter, letterLoading, domain]);

  // Identification de la spécialité avocat (à la demande)
  useEffect(() => {
    if (!open || activeTab !== "lawyer") return;
    if (specialty || specialtyLoading) return;
    if (conversation.length === 0) return;
    const fetchSpecialty = async () => {
      setSpecialtyLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversation.map((m) => ({ role: m.role, content: m.content })),
            mode: "specialty",
            domain,
          }),
        });
        const data = (await res.json()) as SpecialtyResult;
        if (res.ok && data.specialty) setSpecialty(data);
      } catch {
        /* silencieux — fallback domain par défaut */
      } finally {
        setSpecialtyLoading(false);
      }
    };
    fetchSpecialty();
  }, [open, activeTab, conversation, specialty, specialtyLoading, domain]);

  const handleCopy = async () => {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
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
              Plan d'action
            </p>
            <h2 className="font-serif text-2xl font-semibold text-midnight-900">
              {domainConfig ? domainConfig.label : "Vos prochaines étapes"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-midnight-500 transition hover:bg-midnight-50 hover:text-midnight-900"
          >
            <CloseIcon />
          </button>
        </header>

        <nav className="flex border-b border-midnight-100 bg-midnight-50/40 px-6">
          <TabButton active={activeTab === "letter"} onClick={() => setActiveTab("letter")} label="Lettre" />
          <TabButton active={activeTab === "evidence"} onClick={() => setActiveTab("evidence")} label="Preuves" />
          <TabButton active={activeTab === "contacts"} onClick={() => setActiveTab("contacts")} label="Contacts" />
          <TabButton active={activeTab === "lawyer"} onClick={() => setActiveTab("lawyer")} label="Avocat" />
        </nav>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-6">
          {activeTab === "letter" && (
            <LetterTab
              letter={letter}
              loading={letterLoading}
              error={letterError}
              copied={copied}
              onCopy={handleCopy}
              recipient={domainConfig?.letterRecipient ?? "destinataire concerné"}
            />
          )}
          {activeTab === "evidence" && <EvidenceTab domain={domain} />}
          {activeTab === "contacts" && <ContactsTab domain={domain} />}
          {activeTab === "lawyer" && (
            <LawyerTab
              specialty={specialty}
              loading={specialtyLoading}
              postalCode={postalCode}
              onPostalCodeChange={setPostalCode}
              domain={domain}
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

// ─── Onglet Lettre ────────────────────────────────────────────────────────
function LetterTab({
  letter,
  loading,
  error,
  copied,
  onCopy,
  recipient,
}: {
  letter: string;
  loading: boolean;
  error: string | null;
  copied: boolean;
  onCopy: () => void;
  recipient: string;
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
          Rédaction de votre lettre personnalisée…
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
            Lettre adressée au <strong>{recipient}</strong>. À envoyer en lettre
            recommandée avec accusé de réception. Complétez les champs entre crochets.
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

// ─── Onglet Preuves ───────────────────────────────────────────────────────
const GENERIC_EVIDENCE = [
  "Tous les documents écrits relatifs à votre situation (contrats, factures, courriers)",
  "Échanges écrits (mails, SMS, messageries) — sauvegardés et datés",
  "Témoignages écrits, datés et signés, avec copie de la pièce d'identité",
  "Photographies, vidéos, captures d'écran horodatées",
  "Certificats médicaux ou attestations professionnelles si pertinent",
  "Tableau chronologique des faits (dates précises, ordre, intervenants)",
];

function EvidenceTab({ domain }: { domain: DomainId | null }) {
  const items = domain && DOMAINS[domain]?.evidence
    ? DOMAINS[domain].evidence
    : GENERIC_EVIDENCE;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-midnight-100 bg-midnight-50 p-4 text-sm text-midnight-700">
        Conservez chacune de ces pièces dans un dossier dédié (papier + numérique).
        Elles serviront pour toute démarche : signalement, mise en demeure, plainte,
        ou saisine d'une juridiction.
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
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
      <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <strong>Conseil :</strong> Nommez vos fichiers de manière systématique
        (<code>YYYY-MM-DD_objet.pdf</code>) et faites des copies sur un support externe.
      </div>
    </div>
  );
}

// ─── Onglet Contacts ──────────────────────────────────────────────────────
const GENERIC_CONTACTS = [
  { nom: "39 39", description: "Allô Service Public — renseignements administratifs et juridiques.", horaires: "Lun-Ven 8h30-19h", href: "tel:3939" },
  { nom: "Défenseur des droits", description: "Institution indépendante (discriminations, services publics, droits des enfants).", horaires: "defenseurdesdroits.fr", href: "https://www.defenseurdesdroits.fr" },
  { nom: "Conciliateur de justice", description: "Règlement amiable gratuit des litiges du quotidien.", horaires: "conciliateurs.fr", href: "https://www.conciliateurs.fr" },
  { nom: "116 006", description: "France Victimes — réseau associatif d'aide aux victimes.", horaires: "9h-21h, 7j/7", href: "tel:116006" },
];

function ContactsTab({ domain }: { domain: DomainId | null }) {
  const contacts = domain && DOMAINS[domain]?.contacts
    ? DOMAINS[domain].contacts
    : GENERIC_CONTACTS;

  return (
    <div className="space-y-3">
      {contacts.map((c) => (
        <a
          key={c.nom}
          href={c.href ?? "#"}
          target={c.href?.startsWith("http") ? "_blank" : undefined}
          rel={c.href?.startsWith("http") ? "noopener noreferrer" : undefined}
          className="block rounded-xl border border-midnight-100 bg-white p-4 transition hover:border-sage-300 hover:shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-midnight-900 text-white">
              <PhoneIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-lg font-semibold text-midnight-900">{c.nom}</h3>
              <p className="mt-1 text-sm leading-relaxed text-midnight-700">{c.description}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-sage-700">
                {c.horaires}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── Onglet Avocat ────────────────────────────────────────────────────────
function LawyerTab({
  specialty,
  loading,
  postalCode,
  onPostalCodeChange,
  domain,
}: {
  specialty: SpecialtyResult | null;
  loading: boolean;
  postalCode: string;
  onPostalCodeChange: (v: string) => void;
  domain: DomainId | null;
}) {
  // Fallback : si l'IA n'a pas répondu mais qu'on a un domaine, on déduit
  const resolvedSpecialty =
    specialty?.specialty ||
    (domain ? DOMAIN_TO_SPECIALTY[domain] : "droit-penal");
  const links =
    SPECIALTY_LINKS[resolvedSpecialty] ?? SPECIALTY_LINKS["droit-penal"];

  const cityParam = postalCode.trim()
    ? `&cp=${encodeURIComponent(postalCode.trim())}`
    : "";
  const utm = "utm_source=avocat-de-poche&utm_medium=app&utm_campaign=plan-action";
  const justifitUrl = `${links.justifit}?${utm}${cityParam}`;
  const cnbUrl = `https://cnb.avocat.fr/fr/annuaire-avocat?specialite=${encodeURIComponent(
    links.cnbSpecialty
  )}${postalCode.trim() ? `&ville=${encodeURIComponent(postalCode.trim())}` : ""}`;
  const ajUrl = "https://www.service-public.fr/particuliers/vosdroits/F18074";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-midnight-100 bg-midnight-50 p-4 text-sm text-midnight-700">
        Trois voies sérieuses pour consulter un avocat. Aucune recommandation nominative.
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-midnight-100 bg-white p-4">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <p className="ml-2 text-sm text-midnight-600">Identification de la spécialité…</p>
        </div>
      ) : (
        <div className="rounded-xl border border-sage-200 bg-sage-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-sage-700">
            Spécialité recommandée
          </p>
          <p className="mt-1 font-serif text-lg font-semibold text-midnight-900">
            {specialty?.label ?? links.cnbSpecialty}
          </p>
          {specialty?.reason && (
            <p className="mt-2 text-sm leading-relaxed text-midnight-700">
              {specialty.reason}
            </p>
          )}
          {specialty?.keywords && specialty.keywords.length > 0 && (
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
      )}

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
        description="Plateforme française qui vous met en relation avec un avocat partenaire. Premier contact souvent gratuit."
        ctaLabel="Voir les avocats sur Justifit"
        href={justifitUrl}
      />
      <LawyerCard
        title="Aide juridictionnelle (revenus modestes)"
        badge="Service public"
        badgeTone="amber"
        description="Si vos revenus sont sous les plafonds, l'État prend en charge tout ou partie des honoraires d'avocat."
        ctaLabel="Vérifier mon éligibilité"
        href={ajUrl}
      />

      <p className="mt-1 text-xs leading-relaxed text-midnight-500">
        Avocat de Poche peut percevoir une commission lorsque vous prenez contact
        via Justifit. Cette commission n'influe pas sur les conseils donnés.
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
        <h3 className="font-serif text-lg font-semibold text-midnight-900">{title}</h3>
        <span
          className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${toneClasses[badgeTone]}`}
        >
          {badge}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-midnight-700">{description}</p>
      <div className="mt-3 inline-flex items-center text-sm font-medium text-sage-700">
        {ctaLabel}
        <svg className="ml-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </a>
  );
}
