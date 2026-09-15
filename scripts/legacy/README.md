# Scripts hérités — ne pas utiliser tels quels

Anciens pipelines d'ingestion, conservés pour référence uniquement :

- `download-legi.sh` + `ingest-legifrance.ts` — dump LEGI complet, embeddings **OpenAI 1536 dim** (`OPENAI_API_KEY`).
- `embed-seeds.ts` — embeddings OpenAI 1536 dim.
- `ingest-hf.ts` — dataset HuggingFace, embeddings **Voyage 1024 dim** (`VOYAGE_API_KEY`, dépendait de `hyparquet`, retiré du package.json).

Ils sont **incompatibles** avec le schéma courant (`embedding vector(768)`,
Gemini `gemini-embedding-001`) et leurs dépendances/clés ne sont plus
configurées. Le pipeline vivant est `download-sp.sh` + `ingest-service-public.ts`
+ `reembed.ts` — voir `RAG.md` à la racine.
