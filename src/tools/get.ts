import { z } from "zod";
import type { OutlineClient } from "../outline.js";

export const getInputShape = {
  id: z.string().min(1).describe("Document UUID or URL slug."),
};

const getInput = z.object(getInputShape);

interface Document {
  id: string;
  title: string;
  text: string;
  url?: string;
  collectionId?: string;
  updatedAt?: string;
}

interface GetResponse {
  data: Document;
}

export async function getDocument(
  client: OutlineClient,
  input: z.infer<typeof getInput>,
) {
  const { id } = getInput.parse(input);
  const res = await client.call<GetResponse>("documents.info", { id });
  const doc = res.data;

  return {
    content: [
      {
        type: "text" as const,
        text: [
          `# ${doc.title}`,
          doc.url ? `URL: ${doc.url}` : undefined,
          doc.updatedAt ? `Updated: ${doc.updatedAt}` : undefined,
          "",
          doc.text,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
  };
}
