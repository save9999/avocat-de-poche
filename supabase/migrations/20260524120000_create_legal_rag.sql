-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ RAG juridique : table legal_articles + embeddings + recherche vectorielle│
-- │ Source : dumps DILA LEGI (Légifrance)                                   │
-- └─────────────────────────────────────────────────────────────────────────┘

create extension if not exists vector;

-- ── Table principale ─────────────────────────────────────────────────────
create table if not exists public.legal_articles (
  id           bigserial primary key,
  cid          text unique,                       -- identifiant chronologique Légifrance (LEGIARTI…)
  code         text not null,                     -- libellé du code ("Code civil")
  code_slug    text not null,                     -- slug ("code-civil")
  reference    text not null,                     -- "Article 1240"
  title        text,                              -- titre court / résumé
  content      text not null,                     -- texte intégral de l'article
  date_debut   date,
  date_fin     date,
  etat         text not null default 'VIGUEUR',   -- VIGUEUR | ABROGE | MODIFIE_MORT_NE …
  domains      text[] not null default '{}',     -- ['travail','famille',…]
  hierarchy    jsonb,                             -- {livre,titre,chapitre,section,sous_section}
  source_url   text,                              -- lien vers Légifrance
  embedding    vector(1536),                      -- OpenAI text-embedding-3-small
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

-- ── RPC de recherche vectorielle ────────────────────────────────────────
create or replace function public.match_articles(
  query_embedding vector(1536),
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

-- ── Stats utilitaires (lecture publique) ────────────────────────────────
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

-- ── RLS ────────────────────────────────────────────────────────────────
alter table public.legal_articles enable row level security;

drop policy if exists "legal_articles lisibles publiquement" on public.legal_articles;
create policy "legal_articles lisibles publiquement"
  on public.legal_articles
  for select
  to anon, authenticated
  using (true);

-- Aucune politique d'INSERT/UPDATE/DELETE → seuls les jobs avec la
-- service_role_key (ingestion) peuvent écrire.

-- ── Permissions explicites sur la RPC ───────────────────────────────────
grant execute on function public.match_articles(vector(1536), int, text, text, float)
  to anon, authenticated, service_role;

grant select on public.legal_articles_stats to anon, authenticated, service_role;
