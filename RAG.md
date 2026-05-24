# RAG juridique — ingestion Légifrance

L'app utilise un **RAG** (Retrieval Augmented Generation) basé sur :

- **Supabase Postgres + pgvector** : stockage des articles + embeddings.
- **OpenAI `text-embedding-3-small`** (1536 dim) : embeddings.
- **Claude Sonnet 4.6** : génération.

À chaque message utilisateur, `/api/chat` :
1. Calcule l'embedding de la question.
2. Interroge la RPC `match_articles` (top 8, filtrable par `domain` ou `code_slug`).
3. Injecte les articles trouvés dans le system prompt avant l'appel Claude.

---

## 1. Variables d'environnement

Copier `.env.example` → `.env.local` et renseigner :

```
ANTHROPIC_API_KEY=…
OPENAI_API_KEY=…
NEXT_PUBLIC_SUPABASE_URL=https://lolbwvqmyutlactgevue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi…   # ⚠️ uniquement pour l'ingestion locale
```

La `service_role` se récupère sur https://supabase.com/dashboard/project/lolbwvqmyutlactgevue/settings/api → **service_role** (secret).

---

## 2. Télécharger le dump Légifrance

Le **DILA** publie un dump complet quotidien du droit français consolidé (LEGI) :

```
https://echanges.dila.gouv.fr/OPENDATA/LEGI/
```

1. Télécharger le dernier `LEGI_YYYYMMDD-HHMMSS.tar.gz` (~5 Go compressé).
2. Décompresser dans `~/legi/` :

```bash
mkdir -p ~/legi
tar -xzf LEGI_*.tar.gz -C ~/legi/
```

L'arborescence ressemble à :

```
~/legi/global/code_et_TNC_en_vigueur/code_en_vigueur/LEGI/TEXT_LEGITEXT…/article/…/article_LEGIARTI….xml
```

---

## 3. Lancer l'ingestion

```bash
npm install
npm run ingest -- --dir ~/legi
```

Options :

| Flag | Description |
|---|---|
| `--dir <path>` | Racine du dump décompressé (obligatoire). |
| `--codes code-civil,code-penal` | Limiter à certains codes (slug `lower-kebab`). |
| `--limit 5000` | Limiter le nombre d'articles ingérés (utile pour tests). |
| `--dry-run` | Parse + embed mais n'insère pas dans Supabase. |

Le script :

- est **idempotent** : ré-exécution → upsert sur `cid`.
- batch les embeddings (96 articles à la fois).
- batch les upserts (200 lignes à la fois).
- coûte **~5 USD** pour un dump LEGI complet (~250 000 articles).
- prend **~3 à 5 heures** sur ADSL.

### Test rapide (100 articles seulement)

```bash
npm run ingest -- --dir ~/legi --codes code-civil --limit 100
```

---

## 4. Vérifier l'ingestion

Côté Supabase :

```sql
select * from public.legal_articles_stats;
```

Ou via le client :

```bash
npx tsx scripts/check-rag.ts "que faire en cas de licenciement abusif ?"
```
*(script optionnel à créer si besoin)*

---

## 5. Ré-ingestion incrémentale

La DILA publie un dump complet par jour. Pour une mise à jour mensuelle :

```bash
npm run ingest -- --dir ~/legi-2026-06-01
```

Les `cid` inchangés sont mis à jour en place ; les nouveaux articles sont insérés ; les abrogés gardent `etat <> 'VIGUEUR'` et sont filtrés par la RPC.

---

## 6. Index ivfflat — tuning

L'index `legal_articles_embedding_idx` est créé avec `lists = 200`, optimal pour ~50k–500k lignes. Pour beaucoup plus, augmenter `lists` (règle : `sqrt(rows)`).

Pour reconstruire l'index après une grosse ingestion :

```sql
reindex index public.legal_articles_embedding_idx;
analyze public.legal_articles;
```
