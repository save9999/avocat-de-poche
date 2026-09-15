-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ Schéma canonique Avocat de Poche — Neon Postgres + pgvector             │
-- │                                                                         │
-- │ Embeddings : Gemini gemini-embedding-001, 768 dimensions                │
-- │ (cf. lib/embeddings.ts). Idempotent : ré-exécutable sans risque.        │
-- │                                                                         │
-- │ Provisioning d'une base vierge :                                        │
-- │   psql "$DATABASE_URL" -f migrations/0001_schema.sql                    │
-- └─────────────────────────────────────────────────────────────────────────┘

create extension if not exists vector;

-- ── Table principale ─────────────────────────────────────────────────────
create table if not exists public.legal_articles (
  id           bigserial primary key,
  cid          text unique,                       -- identifiant chronologique (LEGIARTI… / fiche F…)
  code         text not null,                     -- libellé du code ("Code civil", "Service-Public.fr")
  code_slug    text not null,                     -- slug ("code-civil", "service-public")
  reference    text not null,                     -- "Article 1240" / titre de fiche
  title        text,                              -- titre court / résumé
  content      text not null,                     -- texte intégral
  date_debut   date,
  date_fin     date,
  etat         text not null default 'VIGUEUR',   -- VIGUEUR | ABROGE | MODIFIE_MORT_NE …
  domains      text[] not null default '{}',     -- ['travail','famille',…]
  hierarchy    jsonb,                             -- {livre,titre,chapitre,section,sous_section}
  source_url   text,                              -- lien vers la source officielle
  embedding    vector(768),                       -- Gemini gemini-embedding-001 (768 dim)
  token_count  int,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists legal_articles_code_idx       on public.legal_articles (code_slug);
create index if not exists legal_articles_reference_idx  on public.legal_articles (reference);
create index if not exists legal_articles_etat_idx       on public.legal_articles (etat);
create index if not exists legal_articles_domains_idx    on public.legal_articles using gin (domains);
create index if not exists legal_articles_embedding_idx
  on public.legal_articles using ivfflat (embedding vector_cosine_ops) with (lists = 200);

-- ── Trigger updated_at ──────────────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_legal_articles_updated_at on public.legal_articles;
create trigger set_legal_articles_updated_at
  before update on public.legal_articles
  for each row execute function public.set_updated_at();

-- ── Recherche vectorielle (appelée par lib/rag.ts) ──────────────────────
create or replace function public.match_articles(
  query_embedding vector(768),
  match_count     int     default 8,
  domain_filter   text    default null,
  code_filter     text    default null,
  min_similarity  float   default 0.20
)
returns table (
  id          bigint,
  cid         text,
  code        text,
  reference   text,
  title       text,
  content     text,
  source_url  text,
  similarity  float
)
language sql stable as $$
  select
    la.id,
    la.cid,
    la.code,
    la.reference,
    la.title,
    la.content,
    la.source_url,
    1 - (la.embedding <=> query_embedding) as similarity
  from public.legal_articles la
  where la.etat = 'VIGUEUR'
    and la.embedding is not null
    and (domain_filter is null or domain_filter = any(la.domains))
    and (code_filter is null or la.code_slug = code_filter)
    and 1 - (la.embedding <=> query_embedding) >= min_similarity
  order by la.embedding <=> query_embedding
  limit match_count;
$$;

-- ── Lignes à (ré)embedder (appelée par scripts/reembed.ts) ──────────────
create or replace function public.articles_missing_embedding(batch int default 50)
returns table (
  id         bigint,
  reference  text,
  code       text,
  content    text
)
language sql stable as $$
  select la.id, la.reference, la.code, la.content
  from public.legal_articles la
  where la.embedding is null
  order by la.id
  limit batch;
$$;

-- ── Stats utilitaires ───────────────────────────────────────────────────
create or replace view public.legal_articles_stats as
  select
    code_slug,
    code,
    count(*)::int                                          as total_articles,
    count(*) filter (where embedding is not null)::int     as embedded_articles,
    count(*) filter (where etat = 'VIGUEUR')::int          as articles_en_vigueur,
    min(created_at)                                        as first_import,
    max(updated_at)                                        as last_update
  from public.legal_articles
  group by code_slug, code
  order by total_articles desc;

-- ── Cache des réponses « premier tour » (appelé par lib/chatCache.ts) ────
-- Économise un appel Gemini + un embedding sur les questions fréquentes
-- (exemples cliquables, arrivées SEO). Purge par TTL côté lecture.
create table if not exists public.chat_cache (
  cache_key   text primary key,                   -- sha256(domaine|question normalisée)
  domain      text,
  reply       text not null,
  sources     jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

create index if not exists chat_cache_created_idx on public.chat_cache (created_at);
