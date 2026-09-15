# Avocat de Poche

Assistant d'**information juridique** en droit français — gratuit, anonyme, sans compte. L'application traduit un problème du quotidien (travail, logement, consommation, famille, pénal, harcèlement scolaire…) en langage juridique : elle cite les textes officiels applicables (RAG sur une base Légifrance / Service-Public.fr), génère un plan d'action (lettre recommandée, checklist des preuves, contacts), et prépare un **dossier pré-analysé** à transmettre à un avocat.

> Cet outil délivre une information juridique générale. Il ne constitue pas une consultation juridique et ne remplace pas un avocat.

## Stack

- **Next.js 14** (App Router) + **TypeScript** strict + **TailwindCSS**
- **Google Gemini** (free tier) — génération (`gemini-2.5-flash` → repli `flash-lite` / `2.0`) et embeddings (`gemini-embedding-001`, 768 dimensions)
- **Neon Postgres + pgvector** (free tier) — base juridique + recherche vectorielle (`match_articles`) + cache de réponses
- **Vercel** (free tier) — hébergement ; ~4300 pages SEO `/droits/*` en ISR 24 h
- **Upstash Redis** (free tier, optionnel) — rate limiting partagé entre réplicas

## Modèle de coûts : ce qui est illimité, ce qui est plafonné

L'application est conçue pour fonctionner à **0 €**, côté opérateur comme côté utilisateur. Concrètement :

**Illimité (aucun quota consommé)**
- Les ~4300 **fiches pratiques** `/droits/*` : servies depuis la base avec cache ISR, zéro appel LLM.
- Le **mode dégradé « sources officielles »** du chat : quand le quota Gemini est épuisé, le chat renvoie les textes officiels trouvés par le RAG au lieu d'une erreur.
- Les réponses **en cache** (questions fréquentes posées en premier message).

**Plafonné (free tier Gemini)**
- La génération de réponses rédigées, lettres, dossiers : limitée par les quotas journaliers (RPD) des modèles Gemini gratuits. La chaîne de repli (`flash` → `flash-lite` → `2.0-flash` → `2.0-flash-lite`) repousse le plafond, ne le supprime pas.
- Chaque IP est limitée (défaut : 20 requêtes/heure, configurable) pour qu'un seul utilisateur ne puisse pas épuiser le quota commun.

**Volontairement exclu**
- La rotation de plusieurs clés API gratuites pour contourner les quotas Google (violation des conditions d'utilisation Gemini).
- La suppression du rate limiting (un abuseur viderait le quota quotidien de tous).

## Installation

```bash
npm install
cp .env.example .env.local   # puis renseigner GEMINI_API_KEY et DATABASE_URL
```

- Clé Gemini gratuite : [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- Base Neon gratuite : [neon.tech](https://neon.tech), puis provisionner le schéma :

```bash
psql "$DATABASE_URL" -f migrations/0001_schema.sql
```

- Alimenter la base (fiches Service-Public.fr) puis vectoriser : voir [RAG.md](RAG.md).

```bash
npm run dev   # http://localhost:3000
```

## Structure du projet

```
avocat-de-poche/
├── app/
│   ├── page.tsx                 # Accueil (6 domaines, urgences, FAQ)
│   ├── chat/page.tsx            # Chat (RAG + plan d'action + handoff avocat)
│   ├── droits/                  # ~4300 fiches SEO (index, domaine, fiche)
│   └── api/chat/route.ts        # API unique — modes chat / letter / specialty / handoff
├── components/                  # ChatMessage, ActionPlan, LawyerHandoff, …
├── lib/
│   ├── llm.ts                   # Gemini + chaîne de repli multi-modèles
│   ├── embeddings.ts            # gemini-embedding-001 (768 dim), throttling free tier
│   ├── rag.ts                   # Recherche vectorielle (match_articles)
│   ├── chatCache.ts             # Cache Neon des réponses « premier tour »
│   ├── rateLimit.ts             # Limite par IP (Upstash ou in-memory, fail-soft)
│   ├── fiches.ts                # Lecture des fiches /droits
│   └── prompts.ts               # Prompts système (chat, lettre, spécialité, dossier)
├── migrations/0001_schema.sql   # Schéma canonique Neon (pgvector 768)
├── scripts/                     # Ingestion Service-Public.fr + re-vectorisation
└── data/domains.ts              # Configuration des 6 domaines
```

## Scripts disponibles

```bash
npm run dev            # Développement (port 3000)
npm run build          # Build de production
npm run start          # Serveur de production
npm run lint           # Lint Next.js
npm run download:sp    # Télécharge l'archive Service-Public.fr (data.gouv.fr)
npm run ingest:sp      # Ingère les fiches (resume-safe, respecte le free tier)
npm run reembed        # (Re)vectorise les articles sans embedding
```

## Résilience

- **Quota Gemini épuisé** → le chat bascule en « mode sources officielles » (bannière + textes officiels du RAG), jamais de 500.
- **Base indisponible** → le chat répond sans sources ; le sitemap dégrade vers les pages statiques.
- **Upstash indisponible** → le rate limiting retombe sur un compteur local par réplique (fail-soft).

## Avertissement

Cet outil délivre une **information juridique générale fondée sur le droit positif français**. Il ne constitue pas une consultation juridique et ne remplace en aucun cas l'avis d'un avocat. Pour toute action en justice ou stratégie procédurale personnalisée, consultez un avocat.

En cas d'urgence ou de danger immédiat : **15 / 17 / 18 / 112**. Enfants en danger : **119**. Harcèlement scolaire : **3020**. Cyberharcèlement : **3018**.
