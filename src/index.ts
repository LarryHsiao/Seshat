#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadConfig } from "./config.js";
import { OutlineClient, OutlineError } from "./outline.js";
import { searchDocuments, searchInputShape } from "./tools/search.js";
import { getDocument, getInputShape } from "./tools/get.js";
import { createDocument, createInputShape } from "./tools/create.js";
import {
  listCollections,
  listCollectionsInputShape,
} from "./tools/collections.js";

function errorResult(err: unknown) {
  const message =
    err instanceof OutlineError
      ? `${err.message}\n${JSON.stringify(err.body, null, 2)}`
      : err instanceof Error
        ? err.message
        : String(err);
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

async function main() {
  const config = loadConfig();
  const client = new OutlineClient(config);

  const server = new McpServer({
    name: "seshat",
    version: "0.1.0",
  });

  server.tool(
    "search_documents",
    "Full-text search across Outline documents.",
    searchInputShape,
    async (input) => {
      try {
        return await searchDocuments(client, input);
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.tool(
    "get_document",
    "Fetch a single Outline document's markdown content.",
    getInputShape,
    async (input) => {
      try {
        return await getDocument(client, input);
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.tool(
    "create_document",
    "Create a new Outline document in a given collection.",
    createInputShape,
    async (input) => {
      try {
        return await createDocument(client, input);
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.tool(
    "list_collections",
    "List Outline collections with their IDs.",
    listCollectionsInputShape,
    async (input) => {
      try {
        return await listCollections(client, input);
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
