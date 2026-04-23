import { z } from "zod";
import type { OutlineClient } from "../outline.js";

export const listCollectionsInputShape = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Max collections to return (default 25)."),
};

const listCollectionsInput = z.object(listCollectionsInputShape);

interface Collection {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

interface ListCollectionsResponse {
  data: Collection[];
}

export async function listCollections(
  client: OutlineClient,
  input: z.infer<typeof listCollectionsInput>,
) {
  const { limit } = listCollectionsInput.parse(input);
  const payload: Record<string, unknown> = {};
  if (limit) payload.limit = limit;

  const res = await client.call<ListCollectionsResponse>(
    "collections.list",
    payload,
  );
  const collections = (res.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    url: c.url,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text:
          collections.length === 0
            ? "No collections found."
            : JSON.stringify(collections, null, 2),
      },
    ],
  };
}
