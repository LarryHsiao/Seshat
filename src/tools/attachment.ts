import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { z } from "zod";
import type { OutlineClient } from "../outline.js";

export const uploadAttachmentInputShape = {
  filePath: z.string().min(1).describe("Absolute path to the file to upload."),
  name: z
    .string()
    .min(1)
    .optional()
    .describe("Override the displayed filename. Defaults to the basename."),
  documentId: z
    .string()
    .uuid()
    .optional()
    .describe("Associate the attachment with a document UUID."),
  contentType: z
    .string()
    .min(1)
    .optional()
    .describe("Override the auto-detected MIME type."),
};

const uploadAttachmentInput = z.object(uploadAttachmentInputShape);

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".csv": "text/csv",
  ".json": "application/json",
  ".zip": "application/zip",
};

function guessMime(path: string): string {
  return MIME_BY_EXT[extname(path).toLowerCase()] ?? "application/octet-stream";
}

interface AttachmentRecord {
  id: string;
  name: string;
  contentType: string;
  size: number;
  url?: string;
  documentId?: string | null;
}

interface AttachmentCreateResponse {
  data: {
    uploadUrl: string;
    form?: Record<string, string>;
    attachment: AttachmentRecord;
    maxUploadSize?: number;
  };
}

export async function uploadAttachment(
  client: OutlineClient,
  input: z.infer<typeof uploadAttachmentInput>,
  baseUrl: string,
) {
  const parsed = uploadAttachmentInput.parse(input);
  const bytes = await readFile(parsed.filePath);
  const name = parsed.name ?? basename(parsed.filePath);
  const contentType = parsed.contentType ?? guessMime(parsed.filePath);

  const presign = await client.call<AttachmentCreateResponse>(
    "attachments.create",
    {
      name,
      contentType,
      size: bytes.length,
      ...(parsed.documentId ? { documentId: parsed.documentId } : {}),
    },
  );

  const { uploadUrl, form, attachment } = presign.data;

  const body = new FormData();
  for (const [k, v] of Object.entries(form ?? {})) body.append(k, v);
  body.append(
    "file",
    new Blob([new Uint8Array(bytes)], { type: contentType }),
    name,
  );

  const isRelative = uploadUrl.startsWith("/");
  const resolvedUploadUrl = isRelative ? `${baseUrl}${uploadUrl}` : uploadUrl;
  const uploadHeaders: Record<string, string> = isRelative
    ? { Authorization: `Bearer ${client.token}` }
    : {};

  const uploadRes = await fetch(resolvedUploadUrl, {
    method: "POST",
    headers: uploadHeaders,
    body,
  });
  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new Error(
      `Attachment upload failed: ${uploadRes.status} ${uploadRes.statusText}\n${text}`,
    );
  }

  const relative =
    attachment.url ?? `/api/attachments.redirect?id=${attachment.id}`;
  const absoluteUrl = relative.startsWith("http")
    ? relative
    : `${baseUrl}${relative}`;
  const isImage = contentType.startsWith("image/");
  const markdown = `${isImage ? "!" : ""}[${name}](${absoluteUrl})`;

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            id: attachment.id,
            name: attachment.name,
            url: absoluteUrl,
            contentType: attachment.contentType,
            size: attachment.size,
            markdown,
          },
          null,
          2,
        ),
      },
    ],
  };
}
