import { z } from "zod";
import type { OutlineClient } from "../outline.js";

export const updateInputShape = {
  id: z.string().min(1).describe("Document UUID or URL slug to update."),
  title: z.string().min(1).optional().describe("New document title."),
  text: z.string().optional().describe("New markdown body."),
  append: z
    .boolean()
    .optional()
    .describe("Append `text` to the existing body instead of replacing it."),
  publish: z
    .boolean()
    .optional()
    .describe("Publish the document if it is currently a draft."),
};

const updateInput = z.object(updateInputShape);

interface UpdateResponse {
  data: {
    id: string;
    title: string;
    url?: string;
  };
}

export async function updateDocument(
  client: OutlineClient,
  input: z.infer<typeof updateInput>,
) {
  const parsed = updateInput.parse(input);
  const payload: Record<string, unknown> = { id: parsed.id };
  if (parsed.title !== undefined) payload.title = parsed.title;
  if (parsed.text !== undefined) payload.text = parsed.text;
  if (parsed.append !== undefined) payload.append = parsed.append;
  if (parsed.publish !== undefined) payload.publish = parsed.publish;

  const res = await client.call<UpdateResponse>("documents.update", payload);
  const doc = res.data;

  return {
    content: [
      {
        type: "text" as const,
        text: `Updated: ${doc.title}\nID: ${doc.id}${doc.url ? `\nURL: ${doc.url}` : ""}`,
      },
    ],
  };
}
