-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ Retag additif : contrôle d'identité / garde à vue / interpellation      │
-- │                                                                         │
-- │ La classification par mots-clés utilisée à l'ingestion (voir            │
-- │ scripts/ingest-service-public.ts) ne reconnaissait pas ce vocabulaire   │
-- │ et pouvait laisser ces fiches hors du domaine « penal ». Ce script      │
-- │ rattrape les lignes déjà en base, sans ré-embedding (le tag `domains`   │
-- │ ne sert qu'au filtre RAG, pas à la recherche sémantique elle-même).     │
-- │                                                                         │
-- │ Idempotent (ADD si absent uniquement) — exécutable plusieurs fois sans │
-- │ risque :                                                                │
-- │   psql "$DATABASE_URL" -f migrations/0002_retag_controle_police.sql     │
-- └─────────────────────────────────────────────────────────────────────────┘

update public.legal_articles
   set domains = array_append(domains, 'penal')
 where not ('penal' = any(domains))
   and (
     content ~* 'contr[ôo]le d.identit[ée]|garde [àa] vue|interpellation|palpation de s[ée]curit[ée]|droits du gard[ée] [àa] vue'
     or title   ~* 'contr[ôo]le d.identit[ée]|garde [àa] vue|interpellation'
     or reference ~* 'contr[ôo]le d.identit[ée]|garde [àa] vue|interpellation'
   );
