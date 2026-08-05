import { interroger } from "./db";
import { embedQuery } from "./embeddings";

export interface RetrievedArticle {
  id: number;
  cid: string | null;
  code: string;
  reference: string;
  title: string | null;
  content: string;
  source_url: string | null;
  similarity: number;
}

export interface RetrieveOptions {
  matchCount?: number;
  domain?: string | null;
  codeSlug?: string | null;
  minSimilarity?: number;
}

export async function retrieveArticles(
  query: string,
  opts: RetrieveOptions = {}
): Promise<RetrievedArticle[]> {
  const {
    matchCount = 8,
    domain = null,
    codeSlug = null,
    minSimilarity = 0.2,
  } = opts;

  const queryEmbedding = await embedQuery(query);

  // Le vecteur voyage en texte : c'est la représentation que pgvector attend
  // en entrée, et le pilote HTTP n'a pas de type dédié à lui donner.
  return interroger<RetrievedArticle>(
    // `id` est un bigint, que le pilote rendrait en texte sans ce cast.
    `select id::int as id, cid, code, reference, title, content, source_url, similarity
       from public.match_articles($1::vector, $2, $3, $4, $5)`,
    [
      `[${queryEmbedding.join(",")}]`,
      matchCount,
      domain,
      codeSlug,
      minSimilarity,
    ]
  );
}

export function formatArticlesForPrompt(articles: RetrievedArticle[]): string {
  if (articles.length === 0) {
    return "Aucun article pertinent n'a été trouvé dans la base juridique. Indique-le honnêtement et invite l'utilisateur à consulter un avocat.";
  }
  return articles
    .map((a, i) => {
      const header = `[${i + 1}] ${a.reference} — ${a.code}${
        a.title ? ` — ${a.title}` : ""
      }`;
      const url = a.source_url ? `\nSource : ${a.source_url}` : "";
      return `${header}\n${a.content.trim()}${url}`;
    })
    .join("\n\n---\n\n");
}
