# Seshat

MCP server for [Outline](https://www.getoutline.com/) — the scribe goddess at your terminal.

Gives MCP clients (Claude Code, Cursor, etc.) the ability to search, read,
list, create, and update Outline documents.

## Install

From npm — no clone required:

```bash
npx -y @larryhsiao/seshat
```

Or clone and build from source:

```bash
git clone https://github.com/LarryHsiao/Seshat.git
cd Seshat
npm install
npm run build
```

## Configure

Seshat needs your Outline instance URL and an API token.

**Environment variables** (recommended):

```bash
export OUTLINE_BASE_URL=https://outline.example.com
export OUTLINE_API_TOKEN=your-outline-api-token
```

**Or a config file** at `./config.json`, `~/.config/seshat/config.json`,
or the path set in `SESHAT_CONFIG`:

```json
{ "baseUrl": "https://outline.example.com" }
```

The API token must still come from `OUTLINE_API_TOKEN`.

Generate a token under `Settings → API Tokens` in Outline.

## Register with Claude Code

Via npm (recommended):

```bash
claude mcp add -s user seshat \
  -e OUTLINE_API_TOKEN=<token> \
  -e OUTLINE_BASE_URL=https://outline.example.com \
  -- npx -y @larryhsiao/seshat
```

Or pointing at a local build:

```bash
claude mcp add -s user seshat \
  -e OUTLINE_API_TOKEN=<token> \
  -e OUTLINE_BASE_URL=https://outline.example.com \
  -- node /absolute/path/to/Seshat/dist/index.js
```

Drop `-s user` to scope it to the current project instead.

## Tools

| Name | Purpose |
|---|---|
| `search_documents` | Full-text search; optional `collectionId`, `limit`. |
| `get_document` | Fetch a single doc's markdown by UUID or URL slug. |
| `list_collections` | List collections with their IDs. |
| `list_documents` | List docs inside a collection (`collectionId`, `limit`, `offset`). |
| `get_collection_tree` | Fetch the nested doc hierarchy of a collection; optional `depth` cap. |
| `create_document` | Create a doc in a collection; optional `parentDocumentId`, `publish`. |
| `update_document` | Update a doc's `title`, `text`, or `publish` state; `append: true` appends instead of replacing. |

## Develop

```bash
npm run dev      # tsc --watch
npm run build    # one-shot build
npm start        # run dist/index.js over stdio
```

## License

MIT
