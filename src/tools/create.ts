import { z } from "zod";
import type { OutlineClient } from "../outline.js";

export const createInputShape = {
  title: z.string().min(1).describe("Document title."),
  text: z.string().optional().describe("Markdown body."),
  collectionId: z
    .string()
    .uuid()
    .describe("Target collection UUID. Use list_collections to find it."),
  parentDocumentId: z
    .string()
    .uuid()
    .optional()
    .describe("Parent document UUID if nesting under an existing doc."),
  publish: z
    .boolean()
    .optional()
    .describe("Publish immediately. Defaults to true."),
};

const createInput = z.object(createInputShape);

interface CreateResponse {
  data: {
    id: string;
    title: string;
    url?: string;
  };
}

export async function createDocument(
  client: OutlineClient,
  input: z.infer<typeof createInput>,
) {
  const parsed = createInput.parse(input);
  const payload = {
    title: parsed.title,
    text: parsed.text ?? "",
    collectionId: parsed.collectionId,
    parentDocumentId: parsed.parentDocumentId,
    publish: parsed.publish ?? true,
  };

  const res = await client.call<CreateResponse>("documents.create", payload);
  const doc = res.data;

  return {
    content: [
      {
        type: "text" as const,
        text: `Created: ${doc.title}\nID: ${doc.id}${doc.url ? `\nURL: ${doc.url}` : ""}`,
      },
    ],
  };
}
