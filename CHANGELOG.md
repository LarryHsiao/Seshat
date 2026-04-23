# Changelog

All notable changes to Seshat are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-04-23

### Added
- Initial MCP server scaffold over stdio transport.
- `search_documents` — full-text search across Outline.
- `get_document` — fetch a doc's markdown by UUID or slug.
- `create_document` — create a doc in a collection with optional parent.
- `list_collections` — enumerate collections.
- `list_documents` — list documents inside a collection with `limit`/`offset` pagination.
- Config loading from `OUTLINE_BASE_URL` / `OUTLINE_API_TOKEN` env vars or a
  JSON config file (`SESHAT_CONFIG`, `./config.json`, or `~/.config/seshat/config.json`).

[Unreleased]: https://github.com/LarryHsiao/Seshat/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/LarryHsiao/Seshat/releases/tag/v0.1.0
