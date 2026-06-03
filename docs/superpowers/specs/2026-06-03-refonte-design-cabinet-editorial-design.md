# Refonte design — « Avocat de Poche », direction cabinet éditorial

Date : 2026-06-03
Périmètre validé : tout le parcours (home + domaines + flux Q/R + FAQ + légales)
Direction validée : cabinet éditorial (autorité, confiance, sobriété premium)

## Objectif

Faire passer l'interface d'un look « template IA pastel » à une identité
« cabinet juridique moderne » : sérieuse, rassurante, lisible, distinctive.
La stack est déjà bien orientée (Inter + Cormorant Garamond, palette
`midnight` + `sage`) — on durcit et on raffine, on ne réinvente pas.

## Contraintes

- Stack : Next.js 14.2 (App Router), React 18, TailwindCSS 3.4, TypeScript strict.
- Pas de shadcn/ui, composants custom Tailwind conservés.
- Pas de quadrillage / grid pattern (hero, header, sections).
- Typographie modeste : pas de display géant. Cormorant pour titres, Inter pour corps.
- Accessibilité AA : contrastes, focus visibles, `prefers-reduced-motion`.
- Vérification navigateur (Chrome headless) à chaque écran avant de livrer.
- Icônes : SVG fines inline (style Lucide), pas de visuels générés (sobriété + coût).

## Système de design (tokens)

Fichiers : `tailwind.config.ts`, `app/globals.css`.

- **Couleur** : `midnight` = base d'autorité. **Un seul accent** chaud laiton/ocre
  (≈ `#b08d4f`) pour CTA primaire et détails. Abandon des 6 accents pastel par
  domaine ; chaque domaine garde une icône + un filet de couleur discret, pas de
  card colorée pleine.
- **Fonds** : crème `midnight-50` et blanc, séparations par filets 1px et
  `shadow-soft`, pas de blocs saturés.
- **Type** : échelle typographique resserrée, `max-w` de lecture stricts,
  rythme vertical cohérent.
- **Motion** : micro-interactions légères (hover cards, transitions), respect
  `prefers-reduced-motion`.

## Écrans

### Home (`app/page.tsx`)
- Supprimer le bandeau rouge anxiogène de stats défilantes.
- Hero éditorial : titre serif (taille modeste), sous-titre clair, **un seul CTA
  primaire** (« Poser ma question ») + lien secondaire discret. Micro-preuve de
  fiabilité (« réponses sourcées sur le droit français en vigueur »).
- Grille 6 domaines : `ThemeCard` redessiné, sobre, homogène, hover discret.
- « Comment ça marche » : 3 étapes narratives, iconographie unifiée.
- Bloc urgence : encart sobre avec numéros utiles (3018, 17, 119, 115…),
  informatif, sans compteur clignotant.
- Témoignages : citations en serif, traitement éditorial.

### Flux Q/R (`app/chat/`)
- Reskin `ChatMessage`, `ChatInput`, `ActionPlan`, `LawyerHandoff` sur les
  nouveaux tokens : bulles sobres, sources légales via `prose-legal` raffiné,
  plan d'action lisible, handoff avocat rassurant.

### Domaines + FAQ
- Pages domaine cohérentes : en-tête éditorial + entrée directe dans le flux.
- FAQ en accordéon sobre.

### Pages légales
- Mise en page lecture (`prose-legal`), cohérence typographique.

### Mobile
- Corriger le débordement du hero (texte tronqué).
- Espacements et densité revus.
- `CookieBanner` non intrusif : compact, bas d'écran.

## Composants impactés

`app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `tailwind.config.ts`,
`data/domains.ts`, `components/ThemeCard.tsx`, `components/ChatMessage.tsx`,
`components/ChatInput.tsx`, `components/ActionPlan.tsx`,
`components/LawyerHandoff.tsx`, `components/CookieBanner.tsx`,
`components/Disclaimer.tsx`, `components/ScaleIcon.tsx`,
`app/chat/page.tsx`, pages domaines/FAQ/légales.

Aucune modification de logique métier ni de l'API (`app/api/chat/route.ts`,
`lib/`) — refonte purement présentation.

## Skills utilisés

- `ui-ux-pro-max` : direction premium, tokens, anti-« AI slop ».
- `frontend-design` : implémentation React/Next distinctive.
- `impeccable` : audit UX / hiérarchie / accessibilité + polish.
- Chrome headless : vérification visuelle desktop + mobile à chaque écran.

## Critères de succès

- Plus aucun bandeau anxiogène ni card pastel multicolore.
- Identité « cabinet éditorial » cohérente sur tout le parcours.
- Mobile sans débordement, cookie banner discret.
- Contrastes AA, focus visibles, motion réduite respectée.
- Build OK (`npm run build`), rendu validé au navigateur.
