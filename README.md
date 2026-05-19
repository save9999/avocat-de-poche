# Avocat de Poche

Application Next.js d'information juridique sur le **harcèlement scolaire** en droit français. Construite avec Claude (Anthropic) pour vulgariser les articles du Code pénal et du Code de l'éducation, citer la loi, et générer un plan d'action concret (lettre de signalement, checklist des preuves, contacts utiles).

## Stack

- **Next.js 14** (App Router) + **TypeScript** strict
- **TailwindCSS** pour le design (bleu nuit / sage / accents amber)
- **Anthropic SDK** — modèle `claude-3-5-sonnet-20241022`
- Base de connaissances locale : `data/laws.json`

## Installation

```bash
cd avocat-de-poche
npm install
```

## Configuration de la clé API

1. Dupliquez le fichier `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

2. Ouvrez `.env.local` et collez votre clé API Anthropic à la place de la valeur `sk-ant-api03-XXXX...` :

```env
ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_VRAIE_CLE_ICI
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

> Vous pouvez générer votre clé sur [console.anthropic.com](https://console.anthropic.com/) > "API Keys".

## Lancement en local

```bash
npm run dev
```

L'application est ensuite accessible sur **http://localhost:3000**.

## Structure du projet

```
avocat-de-poche/
├── app/
│   ├── layout.tsx              # Layout racine, polices, métadonnées
│   ├── page.tsx                # Page d'accueil (dashboard thématiques)
│   ├── globals.css             # Styles Tailwind + custom
│   ├── chat/page.tsx           # Écran de chat
│   └── api/chat/route.ts       # API Route — Anthropic SDK
├── components/
│   ├── ScaleIcon.tsx           # Icônes SVG inline
│   ├── ThemeCard.tsx           # Cartes thématiques (accueil)
│   ├── Disclaimer.tsx          # Bandeau disclaimer obligatoire
│   ├── ChatMessage.tsx         # Bulles user / IA + typing
│   ├── ChatInput.tsx           # Zone de saisie auto-resize
│   └── ActionPlan.tsx          # Panneau latéral 3 onglets
├── lib/
│   └── prompts.ts              # System prompt + prompt lettre
├── data/
│   └── laws.json               # Articles, contacts, checklist preuves
├── .env.example                # Modèle de variables d'environnement
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

## Fonctionnalités

### Écran 1 — Accueil
Dashboard des thématiques avec hero, manifeste, grille de 3 cartes (1 active : harcèlement scolaire ; 2 grisées : droit du travail, logement).

### Écran 2 — Chat
- Bandeau disclaimer fixe en haut (obligation déontologique).
- Bulles utilisateur (droite) / IA (gauche) avec avatar balance.
- Saisie auto-resize, support `Maj+Entrée` pour saut de ligne.
- L'IA cite systématiquement les articles de la base `laws.json`.

### Écran 3 — Plan d'action
Panneau latéral à 3 onglets, ouvert via le bouton "Mon plan d'action" (actif après 2 messages utilisateur) :
1. **Modèle de lettre** — lettre de signalement personnalisée générée à partir de la conversation, prête à copier.
2. **Checklist des preuves** — 10 catégories de pièces à conserver.
3. **Contacts d'urgence** — 3018, 3020, 119, 17/112, Pharos, Défenseur des droits, France Victimes.

## Base juridique embarquée (`data/laws.json`)

- **Code pénal** : art. 222-33-2-2, 222-33-2-3 (harcèlement scolaire), 222-13, 222-14-3, 226-1, 226-2-1, R621-2, R624-2, 322-1.
- **Code de l'éducation** : art. L121-1, L131-1, L401-2-1, L511-3-1, D111-12.
- **Code de procédure pénale** : art. 40.

Chaque article comporte le texte officiel, des mots-clefs et une note de vulgarisation utilisée par l'IA pour adapter ses réponses.

## Scripts disponibles

```bash
npm run dev      # Démarrage en mode développement (port 3000)
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Lint Next.js
```

## Avertissement

Cet outil délivre une **information juridique générale fondée sur le droit positif français**. Il ne constitue pas une consultation juridique et ne remplace en aucun cas l'avis d'un avocat ou d'un professionnel du droit. Pour toute action en justice ou stratégie procédurale personnalisée, consultez un avocat.

En cas d'urgence ou de danger immédiat : **15 / 17 / 18 / 112**. Pour les enfants en danger : **119**. Pour le harcèlement scolaire : **3020**. Pour le cyberharcèlement : **3018**.
