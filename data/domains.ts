/**
 * Configuration des 6 domaines juridiques couverts par l'app.
 *
 * Pour ajouter un domaine : ajouter une entrée ici + insérer/ingérer des
 * articles dans `legal_articles` avec le `domain` correspondant.
 */

export type DomainId =
  | "harcelement-scolaire"
  | "travail"
  | "logement"
  | "consommation"
  | "famille"
  | "penal";

export interface ContactItem {
  nom: string;
  description: string;
  horaires: string;
  href?: string;
}

export interface DomainConfig {
  id: DomainId;
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  accent: "blue" | "violet" | "emerald" | "amber" | "rose" | "slate";
  introMessage: string;
  examples: string[];
  contacts: ContactItem[];
  evidence: string[];
  letterRecipient: string;
}

export const DOMAINS: Record<DomainId, DomainConfig> = {
  "harcelement-scolaire": {
    id: "harcelement-scolaire",
    label: "Harcèlement scolaire",
    shortLabel: "Harcèlement scolaire",
    tagline: "Protéger votre enfant à l'école et en ligne",
    description:
      "Insultes répétées, mise à l'écart, cyberharcèlement, violences à l'école : comprenez la loi et obtenez un plan d'action.",
    accent: "rose",
    introMessage: `Je peux vous aider sur le **harcèlement scolaire**. Pour bien comprendre :
- qui est concerné (votre enfant, vous, un proche) ?
- depuis combien de temps cela dure-t-il ?
- de quels faits s'agit-il (insultes, mise à l'écart, violences, messages en ligne…) ?
- l'établissement a-t-il déjà été informé ?`,
    examples: [
      "Mon fils est insulté tous les jours dans la cour, l'école dit qu'il exagère.",
      "Des photos truquées de ma fille circulent sur Snapchat.",
      "Le directeur a refusé de prendre mon signalement par écrit.",
    ],
    contacts: [
      { nom: "3018", description: "Net Écoute — violences numériques, cyberharcèlement, comptes piratés.", horaires: "9h-23h, 7j/7", href: "tel:3018" },
      { nom: "3020", description: "Non au harcèlement — ligne nationale du Ministère de l'Éducation.", horaires: "Lun-Ven 10h-21h, Sam 9h-18h", href: "tel:3020" },
      { nom: "119", description: "Allô Enfance en Danger — enfants en danger ou en risque.", horaires: "24h/24, 7j/7", href: "tel:119" },
      { nom: "Pharos", description: "Signalement des contenus illicites en ligne (Ministère de l'Intérieur).", horaires: "internet-signalement.gouv.fr", href: "https://www.internet-signalement.gouv.fr" },
    ],
    evidence: [
      "Captures d'écran datées des messages, posts ou publications en ligne",
      "Captures d'écran des profils des auteurs (les pseudos changent)",
      "Journal des faits : carnet daté (heure, lieu, auteurs, témoins, ce qui a été dit)",
      "Témoignages écrits, datés et signés de camarades ou personnel",
      "Certificats médicaux (médecin traitant, psychologue, psychiatre)",
      "Bulletins scolaires montrant une baisse des résultats",
      "Justificatifs d'absences liées au harcèlement",
      "Copies des signalements écrits déjà faits à l'établissement",
    ],
    letterRecipient: "chef d'établissement scolaire",
  },

  travail: {
    id: "travail",
    label: "Droit du travail",
    shortLabel: "Travail",
    tagline: "Licenciement, harcèlement, congés, contrat",
    description:
      "Litige avec votre employeur, licenciement contesté, harcèlement, rupture conventionnelle, congés impayés : faites valoir vos droits.",
    accent: "blue",
    introMessage: `Je peux vous aider sur le **droit du travail**. Pour bien comprendre :
- êtes-vous salarié·e en CDI, CDD, intérim, alternance ?
- depuis combien de temps êtes-vous dans l'entreprise ?
- quel est le litige (licenciement, harcèlement, salaire, congés, rupture conventionnelle…) ?
- avez-vous déjà saisi le CSE, la médecine du travail ou l'inspection du travail ?`,
    examples: [
      "Mon employeur m'a licencié sans entretien préalable.",
      "Je subis du harcèlement moral de mon manager, comment le prouver ?",
      "On me refuse la rupture conventionnelle alors que j'ai 6 ans d'ancienneté.",
    ],
    contacts: [
      { nom: "3995", description: "Allo Discrim — Défenseur des droits (discriminations au travail).", horaires: "Lun-Ven 9h-18h", href: "tel:3995" },
      { nom: "Inspection du travail", description: "Saisine en ligne via le site officiel (signalement de manquements).", horaires: "travail-emploi.gouv.fr", href: "https://www.travail-emploi.gouv.fr" },
      { nom: "39 39 (Allô Service Public)", description: "Renseignements administratifs : droit du travail, démarches.", horaires: "Lun-Ven 8h30-19h", href: "tel:3939" },
      { nom: "Conseil de Prud'hommes", description: "Saisine pour litige individuel salarié/employeur. Gratuit, sans avocat obligatoire.", horaires: "service-public.fr/particuliers/vosdroits/F2360", href: "https://www.service-public.fr/particuliers/vosdroits/F2360" },
    ],
    evidence: [
      "Contrat de travail signé + avenants",
      "Tous les bulletins de salaire (12 derniers mois minimum)",
      "Lettre de licenciement, convocation à l'entretien préalable",
      "Échanges écrits (mails, SMS) avec l'employeur ou les RH",
      "Témoignages écrits, datés et signés de collègues",
      "Comptes-rendus d'entretien individuel ou d'évaluation",
      "Certificats médicaux liés au travail (arrêts, médecine du travail)",
      "Convention collective applicable + règlement intérieur",
    ],
    letterRecipient: "employeur ou direction des ressources humaines",
  },

  logement: {
    id: "logement",
    label: "Droit du logement",
    shortLabel: "Logement",
    tagline: "Bail, dépôt de garantie, expulsion, voisinage",
    description:
      "Bail contesté, dépôt de garantie non restitué, troubles de voisinage, expulsion : connaissez vos droits de locataire ou propriétaire.",
    accent: "emerald",
    introMessage: `Je peux vous aider sur le **droit du logement**. Pour bien comprendre :
- êtes-vous locataire, bailleur, ou copropriétaire ?
- s'agit-il d'un bail vide ou meublé, loi 1989 ou autre ?
- quel est le litige (dépôt de garantie, congé, loyer impayé, travaux, voisinage…) ?
- depuis quand le problème dure-t-il ?`,
    examples: [
      "Mon propriétaire refuse de me rendre mon dépôt de garantie depuis 3 mois.",
      "Mon voisin fait du bruit toutes les nuits, que faire ?",
      "On veut m'expulser, mais je n'ai reçu aucun courrier officiel.",
    ],
    contacts: [
      { nom: "ADIL (départementale)", description: "Agence d'information sur le logement : conseil juridique gratuit pour locataires et propriétaires.", horaires: "anil.org/votre-adil", href: "https://www.anil.org/votre-adil" },
      { nom: "0 805 16 00 75", description: "SOS Loyers Impayés — ANIL.", horaires: "Lun-Ven 9h-18h, gratuit", href: "tel:0805160075" },
      { nom: "DALO (Droit Au Logement Opposable)", description: "Recours si vous êtes mal logé ou sans logement : commission de médiation.", horaires: "service-public.fr/particuliers/vosdroits/F18005", href: "https://www.service-public.fr/particuliers/vosdroits/F18005" },
      { nom: "Conciliateur de justice", description: "Règlement amiable gratuit (voisinage, bail, copropriété).", horaires: "conciliateurs.fr", href: "https://www.conciliateurs.fr" },
    ],
    evidence: [
      "Bail signé (et avenants éventuels)",
      "État des lieux d'entrée et de sortie",
      "Quittances de loyer ou justificatifs de virement",
      "Photos datées du logement (avant/après, dégâts, vétusté)",
      "Courriers échangés avec le bailleur (LRAR de préférence)",
      "Diagnostics techniques (DPE, plomb, amiante, électricité)",
      "Témoignages de voisins (pour les troubles)",
      "Mains courantes ou procès-verbaux de la police (pour le bruit)",
    ],
    letterRecipient: "bailleur ou syndic de copropriété",
  },

  consommation: {
    id: "consommation",
    label: "Droit de la consommation",
    shortLabel: "Consommation",
    tagline: "Litige avec un vendeur, garantie, démarchage",
    description:
      "Achat défectueux, refus de remboursement, démarchage abusif, garantie non respectée : la loi protège fortement le consommateur.",
    accent: "amber",
    introMessage: `Je peux vous aider sur le **droit de la consommation**. Pour bien comprendre :
- de quel type de litige s'agit-il (achat, abonnement, démarchage, garantie, crédit…) ?
- quand et comment l'achat a-t-il été fait (magasin, internet, à votre domicile, téléphone) ?
- avez-vous déjà contacté le vendeur ? Si oui, quelle a été sa réponse ?`,
    examples: [
      "J'ai acheté un téléphone en ligne il y a 2 jours, je veux annuler.",
      "Mon lave-linge tombe en panne après 18 mois, le SAV refuse la garantie.",
      "Un démarcheur m'a fait signer un contrat photovoltaïque, je veux me rétracter.",
    ],
    contacts: [
      { nom: "SignalConso", description: "Plateforme officielle DGCCRF : signaler un litige avec un professionnel.", horaires: "signal.conso.gouv.fr", href: "https://signal.conso.gouv.fr" },
      { nom: "DGCCRF", description: "Direction générale de la concurrence, de la consommation et de la répression des fraudes.", horaires: "0809 540 550 (gratuit)", href: "tel:0809540550" },
      { nom: "60 Millions de Consommateurs", description: "Association indépendante d'aide aux consommateurs (INC).", horaires: "60millions-mag.com", href: "https://www.60millions-mag.com" },
      { nom: "UFC-Que Choisir", description: "Association nationale : conseils juridiques, médiation, action de groupe.", horaires: "quechoisir.org", href: "https://www.quechoisir.org" },
    ],
    evidence: [
      "Facture, ticket de caisse, ou confirmation de commande",
      "Conditions générales de vente (CGV) au moment de l'achat",
      "Photos du produit défectueux ou du dommage",
      "Échanges écrits avec le vendeur (mails, chat, courriers)",
      "Bon de garantie ou attestation de SAV",
      "Pour démarchage : enregistrement du contrat, formulaire de rétractation",
      "Relevés bancaires montrant les prélèvements contestés",
      "Devis ou bon de commande signé",
    ],
    letterRecipient: "professionnel ou commerçant concerné",
  },

  famille: {
    id: "famille",
    label: "Droit de la famille",
    shortLabel: "Famille",
    tagline: "Divorce, pension, garde, succession, PACS",
    description:
      "Divorce, séparation, autorité parentale, pension alimentaire, succession, violences conjugales : nous vous orientons sur les recours.",
    accent: "violet",
    introMessage: `Je peux vous aider sur le **droit de la famille**. Pour bien comprendre :
- de quoi s'agit-il (divorce, séparation, pension, garde, succession, PACS…) ?
- êtes-vous marié·e, pacsé·e, en concubinage ?
- y a-t-il des enfants mineurs concernés ?
- une procédure est-elle déjà engagée (JAF, notaire) ?

Si vous êtes en danger immédiat (violences conjugales), composez le **3919** ou le **17**.`,
    examples: [
      "Mon ex ne paie plus la pension alimentaire depuis 3 mois.",
      "Je veux divorcer par consentement mutuel, par où commencer ?",
      "Mon père est décédé, mes frères refusent de partager la succession.",
    ],
    contacts: [
      { nom: "3919", description: "Violences Femmes Info — écoute, orientation, anonyme et gratuit.", horaires: "24h/24, 7j/7", href: "tel:3919" },
      { nom: "ARIPA", description: "Agence de recouvrement des impayés de pensions alimentaires (CAF/MSA).", horaires: "pension-alimentaire.caf.fr", href: "https://www.pension-alimentaire.caf.fr" },
      { nom: "CIDFF", description: "Centres d'Information sur les Droits des Femmes et des Familles : juridique gratuit.", horaires: "cidff.info", href: "https://www.cidff.info" },
      { nom: "Notaires de France", description: "Annuaire officiel pour succession, donation, contrat de mariage.", horaires: "notaires.fr", href: "https://www.notaires.fr" },
    ],
    evidence: [
      "Livret de famille, actes de naissance, acte de mariage / PACS",
      "Jugements antérieurs (divorce, JAF, autorité parentale)",
      "Justificatifs de revenus (3 derniers bulletins, avis d'imposition)",
      "Justificatifs de charges (loyer, crédits, frais de garde)",
      "Conventions signées (médiation familiale, accord parental)",
      "Pour succession : acte de décès, testament éventuel, inventaire des biens",
      "Pour violences : certificat médical, mains courantes, dépôts de plainte",
      "Échanges écrits avec l'ex-conjoint ou la famille",
    ],
    letterRecipient: "avocat, JAF, ou notaire selon la procédure",
  },

  penal: {
    id: "penal",
    label: "Droit pénal & victimes",
    shortLabel: "Pénal / victimes",
    tagline: "Plainte, agression, vol, escroquerie",
    description:
      "Vous êtes victime d'une infraction (vol, agression, escroquerie, menaces) : comprenez la procédure pénale et vos droits à indemnisation.",
    accent: "slate",
    introMessage: `Je peux vous aider sur le **droit pénal et les droits des victimes**. Pour bien comprendre :
- de quels faits avez-vous été victime (vol, agression, escroquerie, menaces, violences…) ?
- quand et où cela s'est-il passé ?
- avez-vous déjà déposé plainte ou main courante ?
- y a-t-il un dommage corporel (blessures, ITT) ?

Si vous êtes en danger immédiat, composez le **17** ou le **112**.`,
    examples: [
      "On m'a volé mon téléphone sous la menace dans le métro.",
      "J'ai été victime d'une escroquerie en ligne pour 3 000 €.",
      "Mon ex me menace par SMS, comment porter plainte ?",
    ],
    contacts: [
      { nom: "17 / 112", description: "Police-secours — danger immédiat, violences en cours.", horaires: "24h/24", href: "tel:17" },
      { nom: "116 006", description: "France Victimes — aide juridique, psychologique et sociale.", horaires: "9h-21h, 7j/7", href: "tel:116006" },
      { nom: "Pré-plainte en ligne", description: "Plainte simple pour atteinte aux biens (auteur inconnu).", horaires: "pre-plainte-en-ligne.gouv.fr", href: "https://www.pre-plainte-en-ligne.gouv.fr" },
      { nom: "CIVI", description: "Commission d'indemnisation des victimes d'infractions (au tribunal judiciaire).", horaires: "service-public.fr/particuliers/vosdroits/F32492", href: "https://www.service-public.fr/particuliers/vosdroits/F32492" },
    ],
    evidence: [
      "Récépissé de dépôt de plainte ou de main courante",
      "Certificat médical initial (CMI) — déterminant pour l'ITT",
      "Photographies des blessures, dégâts, ou du lieu de l'infraction",
      "Témoignages écrits, datés et signés",
      "Échanges écrits avec l'auteur (SMS, mails, messages)",
      "Factures, devis de réparation, justificatifs de pertes financières",
      "Bandes vidéo (caméras de surveillance — demander à la mairie)",
      "Arrêts de travail liés à l'agression",
    ],
    letterRecipient: "procureur de la République (tribunal judiciaire)",
  },
};

export const DOMAIN_LIST: DomainConfig[] = Object.values(DOMAINS);

export function isDomainId(value: string | null | undefined): value is DomainId {
  return typeof value === "string" && value in DOMAINS;
}

export function getDomain(id: string | null | undefined): DomainConfig | null {
  if (!isDomainId(id)) return null;
  return DOMAINS[id];
}
