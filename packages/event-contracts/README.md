# @clarus/event-contracts

Shared source of truth for everything that crosses a RabbitMQ boundary between services: exchange/routing key/queue names, and the shape of each event's payload.

## What's here

**`topology.ts`** — the names, not the behavior. `EXCHANGES`, `ROUTING_KEYS`, `QUEUES`, `RPC_ROUTING_KEYS`, and `RPC_QUEUES` as typed constants, so no TypeScript service hardcodes a string that could drift out of sync with another. `rag-service` (Python) can't import them and declares its own copies in `app/infrastructure/messaging/`, so a rename here must be mirrored there.

**`events/*.ts`** — Zod schemas and inferred TypeScript types for each event, one file per domain (`document.events.ts`, `analysis.events.ts`). A service validates a payload with the matching schema before publishing, and (for the events it consumes) before acting on it.

**`schemas/*.json`** — JSON Schema equivalents of the Zod schemas for the structured events that cross into `rag-service` (Python): `document-uploaded`, `analysis-document-validated` (consumed there), `document-embedded`, and `analysis-completed` (published there). These aren't consumed directly at runtime; `datamodel-codegen` reads them to generate the matching Pydantic models on the Python side. The two `*_failed` events (`document.embedding_failed` with `{ documentId, reason }`, `analysis.failed` with `{ analysisId, reason }`) are simple enough that the Python side builds the dict by hand, and events that never reach Python (`analysis.requested`, `analysis.rejected`, `document.deleted`) have no JSON Schema.

**`index.ts`** — re-exports everything above, so a consuming service imports from `@clarus/event-contracts` rather than reaching into individual files.

## Keeping the two sides in sync

A Zod schema and its JSON Schema counterpart describe the same payload; nothing enforces that they stay identical. If you add or change a field, update both, and regenerate the Pydantic model on the Python side:

```bash
# From apps/rag-service, where datamodel-code-generator is installed as a dev dependency
uv run datamodel-codegen \
  --input ../../packages/event-contracts/schemas/<event>.schema.json \
  --input-file-type jsonschema \
  --output app/schemas/<event>.py \
  --snake-case-field \
  --allow-population-by-field-name
```

`--allow-population-by-field-name` matters: without it, a Pydantic model built from Python-side field names (`analysis_id=...`) instead of the JSON alias (`analysisId`) fails validation.

## Building

Other packages consume the compiled output, not the TypeScript source directly:

```bash
pnpm --filter @clarus/event-contracts build   # or `pnpm build:contracts` from the root
```

During development, `pnpm --filter @clarus/event-contracts dev` rebuilds on every change.

Run this after any change here, then restart whichever service depends on it — a stale `dist/` is a common source of confusing "works in one service, not the other" bugs. `dist/` isn't committed; each environment builds it from source. The root `pnpm run setup` and `pnpm dev` don't build it — only the `build:*` scripts do — so run it once after cloning.