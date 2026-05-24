import { getSupabaseServer } from "./supabase";
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
  const supabase = getSupabaseServer();

  const { data, error } = await supabase.rpc("match_articles", {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    domain_filter: domain,
    code_filter: codeSlug,
    min_similarity: minSimilarity,
  });

  if (error) {
    throw new Error(`Supabase match_articles : ${error.message}`);
  }

  return (data as RetrievedArticle[]) || [];
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
