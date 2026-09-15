# RAG juridique — base, ingestion, vectorisation

L'app utilise un **RAG** (Retrieval Augmented Generation) basé sur :

- **Neon Postgres + pgvector** : stockage des articles/fiches + embeddings.
- **Gemini `gemini-embedding-001`** (768 dim, free tier) : embeddings.
- **Gemini `gemini-2.5-flash`** (+ chaîne de repli `flash-lite` / `2.0`) : génération.

À chaque message utilisateur, `/api/chat` :
1. Calcule l'embedding de la question (768 dim).
2. Interroge la fonction SQL `match_articles` (top 8, filtrable par `domain` ou `code_slug`).
3. Injecte les articles trouvés dans le system prompt avant l'appel Gemini.

Le tout tient dans les **free tiers** : le throttling d'ingestion (budget de tokens
par sous-lot + pauses) est intégré à `lib/embeddings.ts`.

---

## 1. Variables d'environnement

Copier `.env.example` → `.env.local` et renseigner :

```
GEMINI_API_KEY=…       # https://aistudio.google.com/apikey (gratuit)
DATABASE_URL=…         # chaîne de connexion Neon (sslmode=require)
```

## 2. Provisionner le schéma

Sur une base Neon vierge :

```bash
psql "$DATABASE_URL" -f migrations/0001_schema.sql
```

Le fichier est idempotent (ré-exécutable). Il crée `legal_articles`
(embedding `vector(768)`), les fonctions `match_articles` et
`articles_missing_embedding`, la vue `legal_articles_stats` et la table
`chat_cache`.

## 3. Ingestion des fiches Service-Public.fr (pipeline vivant)

Source officielle DILA (licence ouverte v2.0, mise à jour quotidienne) — de
l'information juridique déjà vulgarisée, complémentaire de la loi brute.

```bash
npm run download:sp    # télécharge + dézippe ~5500 fiches XML dans ~/sp-data/fiches/
npm run ingest:sp      # parse + embed + upsert (resume-safe)
```

Options : `-- --dry-run` (parse seulement), `-- --limit 50`, `-- --prefix F`.

Le script est **resume-safe** : si le quota free tier Gemini coupe
l'exécution, une relance reprend là où elle s'est arrêtée. Par défaut il
force un rythme compatible free tier (budget 25 000 tokens + pause 55 s
entre sous-lots) ; `-- --fast` désactive ce bridage (nécessite la
facturation Gemini).

`scripts/auto-ingest.sh` + `scripts/com.avocatpoche.ingest.plist` montrent
comment planifier l'ingestion quotidienne (macOS LaunchAgent) après le reset
du quota gratuit (minuit heure Pacifique ≈ 9 h heure française). Adapter les
chemins à votre machine.

## 4. (Re)vectorisation

```bash
npm run reembed
```

Ré-embedde toutes les lignes dont `embedding` est `NULL` (batch de 50,
resume-safe). À utiliser après un changement de modèle d'embedding ou une
ingestion interrompue.

## 5. Vérifier l'état de la base

```sql
select * from public.legal_articles_stats;
```

## 6. Index ivfflat — tuning

L'index `legal_articles_embedding_idx` est créé avec `lists = 200`, optimal
pour ~50k–500k lignes. Au-delà, augmenter `lists` (règle : `sqrt(rows)`).

Après une grosse ingestion :

```sql
reindex index public.legal_articles_embedding_idx;
analyze public.legal_articles;
```

---

## Scripts hérités (`scripts/legacy/`)

Les anciens pipelines (dump LEGI complet embeddé via OpenAI 1536 dim,
dataset HuggingFace embeddé via Voyage 1024 dim) sont conservés pour
référence dans `scripts/legacy/` mais sont **incompatibles** avec le schéma
courant (768 dim) — voir `scripts/legacy/README.md`.
