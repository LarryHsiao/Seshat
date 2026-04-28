import { z } from "zod";
import type { OutlineClient } from "../outline.js";

export const getCollectionTreeInputShape = {
  collectionId: z
    .string()
    .uuid()
    .describe("Collection UUID. Use list_collections to find it."),
  depth: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Cap the tree to N levels (omit for full depth)."),
};

const getCollectionTreeInput = z.object(getCollectionTreeInputShape);

interface RawNode {
  id: string;
  title: string;
  url?: string;
  children?: RawNode[];
}

interface CollectionDocumentsResponse {
  data: RawNode[];
}

interface PrunedNode {
  id: string;
  title: string;
  url?: string;
  children?: PrunedNode[];
}

function prune(nodes: RawNode[], remaining: number): PrunedNode[] {
  return nodes.map((n) => {
    const out: PrunedNode = { id: n.id, title: n.title };
    if (n.url) out.url = n.url;
    if (remaining > 1 && n.children?.length) {
      out.children = prune(n.children, remaining - 1);
    }
    return out;
  });
}

export async function getCollectionTree(
  client: OutlineClient,
  input: z.infer<typeof getCollectionTreeInput>,
) {
  const { collectionId, depth } = getCollectionTreeInput.parse(input);
  const res = await client.call<CollectionDocumentsResponse>(
    "collections.documents",
    { id: collectionId },
  );
  const tree = prune(res.data ?? [], depth ?? Number.POSITIVE_INFINITY);

  return {
    content: [
      {
        type: "text" as const,
        text:
          tree.length === 0
            ? "Collection is empty."
            : JSON.stringify(tree, null, 2),
      },
    ],
  };
}
