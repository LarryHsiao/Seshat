import { z } from "zod";
import type { OutlineClient } from "../outline.js";

export const searchInputShape = {
  query: z.string().min(1).describe("Full-text query."),
  collectionId: z
    .string()
    .uuid()
    .optional()
    .describe("Restrict the search to a single collection."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Max results (default 10, max 100)."),
};

const searchInput = z.object(searchInputShape);

interface SearchResult {
  ranking: number;
  context: string;
  document: {
    id: string;
    title: string;
    url?: string;
    updatedAt?: string;
  };
}

interface SearchResponse {
  data: SearchResult[];
}

export async function searchDocuments(
  client: OutlineClient,
  input: z.infer<typeof searchInput>,
) {
  const { query, collectionId, limit } = searchInput.parse(input);
  const payload: Record<string, unknown> = { query };
  if (collectionId) payload.collectionId = collectionId;
  if (limit) payload.limit = limit;

  const res = await client.call<SearchResponse>("documents.search", payload);
  const hits = (res.data ?? []).map((hit) => ({
    id: hit.document.id,
    title: hit.document.title,
    url: hit.document.url,
    context: hit.context,
    updatedAt: hit.document.updatedAt,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text:
          hits.length === 0
            ? `No documents matched "${query}".`
            : JSON.stringify(hits, null, 2),
      },
    ],
  };
}
