# @clarus/event-contracts

Shared source of truth for everything that crosses a RabbitMQ boundary between services: exchange/routing key/queue names, and the shape of each event's payload.

## What's here

**`topology.ts`** — the names, not the behavior. `EXCHANGES`, `ROUTING_KEYS`, `QUEUES`, `RPC_ROUTING_KEYS`, and `RPC_QUEUES` as typed constants, so no service hardcodes a string that could drift out of sync with another.

**`events/*.ts`** — Zod schemas and inferred TypeScript types for each event, one file per domain (`document.events.ts`, `analysis.events.ts`). A service validates a payload with the matching schema before publishing, and (for the events it consumes) before acting on it.

**`schemas/*.json`** — JSON Schema equivalents of the Zod schemas above, one per event that crosses into `rag-service` (Python). These aren't consumed directly at runtime; `datamodel-codegen` reads them to generate the matching Pydantic models on the Python side. Two events (`document.embedding_failed`, `analysis.failed`) have no JSON Schema counterpart — their payload (`{ id, reason }`) is simple enough that the Python side builds the dict by hand instead.

**`index.ts`** — re-exports everything above, so a consuming service imports from `@clarus/event-contracts` rather than reaching into individual files.

## Keeping the two sides in sync

A Zod schema and its JSON Schema counterpart describe the same payload; nothing enforces that they stay identical. If you add or change a field, update both, and regenerate the Pydantic model on the Python side:

```bash
uv run datamodel-codegen \
  --input packages/event-contracts/schemas/<event>.schema.json \
  --input-file-type jsonschema \
  --output apps/rag-service/app/schemas/<event>.py \
  --snake-case-field \
  --allow-population-by-field-name
```

`--allow-population-by-field-name` matters: without it, a Pydantic model built from Python-side field names (`analysis_id=...`) instead of the JSON alias (`analysisId`) fails validation.

## Building

Other packages consume the compiled output, not the TypeScript source directly:

```bash
pnpm --filter @clarus/event-contracts build
```

Run this after any change here, then restart whichever service depends on it — a stale `dist/` is a common source of confusing "works in one service, not the other" bugs. `dist/` isn't committed; each environment builds it from source.