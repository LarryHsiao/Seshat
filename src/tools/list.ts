import { z } from "zod";
import type { OutlineClient } from "../outline.js";

export const listDocumentsInputShape = {
  collectionId: z
    .string()
    .uuid()
    .describe("Collection UUID to list documents from."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Max documents to return (default 25)."),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Number of documents to skip for pagination."),
};

const listDocumentsInput = z.object(listDocumentsInputShape);

interface Document {
  id: string;
  title: string;
  url?: string;
  collectionId?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface ListDocumentsResponse {
  data: Document[];
}

export async function listDocuments(
  client: OutlineClient,
  input: z.infer<typeof listDocumentsInput>,
) {
  const { collectionId, limit, offset } = listDocumentsInput.parse(input);
  const payload: Record<string, unknown> = { collectionId };
  if (limit) payload.limit = limit;
  if (offset) payload.offset = offset;

  const res = await client.call<ListDocumentsResponse>(
    "documents.list",
    payload,
  );
  const documents = (res.data ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    url: d.url,
    updatedAt: d.updatedAt,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text:
          documents.length === 0
            ? "No documents found."
            : JSON.stringify(documents, null, 2),
      },
    ],
  };
}
