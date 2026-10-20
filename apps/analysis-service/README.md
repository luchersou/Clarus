# analysis-service

Owns analysis requests, their results and the daily analysis quota. It starts the analysis saga and closes it: it reserves a quota credit, and on the way back consumes it (completed) or refunds it (rejected, failed or timed out).

## Responsibilities

- Create an analysis request for one of the four types (Summary, Extract values, Deadlines, Compare), unless the user hit the daily quota or the same analysis is already running
- Publish `analysis.requested` so `rag-service` can run it, through a transactional outbox
- React to `analysis.completed` / `analysis.failed` / `analysis.rejected` to store the result and settle the credit
- React to `document.deleted` by deleting the document's analyses
- Fail analyses that never got a reply (saga timeout)
- Serve analysis data to the gateway over RPC, scoped to the requesting user

## Endpoints

| Type | Routing key | Use case |
|---|---|---|
| RPC | `analyses.request` | `RequestAnalysisUseCase` |
| RPC | `analyses.list-by-document` | `ListAnalysesUseCase` |
| RPC | `analyses.get-by-id` | `GetAnalysisUseCase` |
| RPC | `analyses.delete` | `DeleteAnalysisUseCase` |
| RPC | `analyses.quota` | `GetAnalysisQuotaUseCase` |

All of them are RPC over RabbitMQ, called by the `api-gateway`. There's no HTTP route: unlike `documents-service`, no request here carries a file.

## Events

| Direction | Event | When |
|---|---|---|
| Publishes | `analysis.requested` | Stored in the outbox with the analysis record, then published by `OutboxRelay` |
| Consumes | `analysis.completed` | `rag-service` finished the analysis, with a result |
| Consumes | `analysis.failed` | `rag-service` failed to run the analysis |
| Consumes | `analysis.rejected` | `documents-service` refused it (document missing, not processed, or another user's) |
| Consumes | `document.deleted` | A document was deleted; its analyses are deleted too |

Listeners tolerate an analysis that no longer exists and return without error, since there's no caller waiting on an async event.

## Quota

Each analysis holds one credit (`creditStatus`): `RESERVED` when it's created, `CONSUMED` when it completes, `REFUNDED` when it fails for any reason (rejection, `analysis.failed`, timeout) or is deleted before finishing. A request is refused with `QUOTA_EXCEEDED` (HTTP 429 at the gateway) when the user's `RESERVED` + `CONSUMED` credits since midnight UTC reach `ANALYSIS_DAILY_LIMIT`. Deleting a completed analysis doesn't give its credit back. The check isn't locked, so two requests racing for the very last credit can both pass; that's an accepted trade-off.

A second `PENDING` analysis of the same type for the same document is refused with `CONFLICT` (HTTP 409).

## Reliability

**Transactional outbox.** `Analysis.create` records an `AnalysisRequested` domain event, and the repository saves the analysis and the event (in the `OutboxEvent` table) in the same transaction. `OutboxRelay` polls the table, publishes pending events in creation order, and marks each one as published only after the broker confirms it. If RabbitMQ is down, the analysis is still created and the event goes out when the broker is back. Delivery is at-least-once, so consumers must tolerate duplicates. The relay locks rows with `FOR UPDATE SKIP LOCKED`, so several instances can run it safely.

**Saga timeout.** `AnalysisTimeoutScheduler` periodically runs `ExpireStaleAnalysesUseCase`, which fails analyses still `PENDING` after `ANALYSIS_TIMEOUT_MS`. Without it, a lost message or a crashed worker would leave an analysis pending forever.

**Optimistic status check.** Saving an existing analysis only succeeds if its status in the database is still the one that was loaded; otherwise the repository throws `AnalysisConcurrencyError`. This stops a timeout from overwriting a result that arrived at the same moment (and vice versa). Listeners and the timeout treat that error as "someone else already handled it".

## Architecture

Clean Architecture, with dependencies pointing inward:

- **`domain`** — the `Analysis` entity carries the business rules (valid status transitions). `analysis.repository.ts` is the interface the infrastructure implements.
- **`application`** — one use case per operation. Each depends only on the domain and on the repository port, never on Prisma or RabbitMQ directly.
- **`infrastructure`** — the adapters: Prisma repository (which also writes the outbox), outbox relay, RabbitMQ listeners and the timeout scheduler.
- **`presentation`** — the RPC handler, plus response mapping and exception filters.

`GetAnalysisUseCase`, `ListAnalysesUseCase`, and `DeleteAnalysisUseCase` check that the analysis (or the document it belongs to) belongs to the requesting user and return "not found" rather than "forbidden" on a mismatch, so the existence of another user's data isn't revealed.

## Project structure

```
apps/analysis-service/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── domain/
│   │   ├── errors/
│   │   │   ├── analysis-concurrency.error.ts           # Status changed since the analysis was loaded
│   │   │   ├── analysis-quota-exceeded.error.ts        # Daily limit reached
│   │   │   ├── duplicate-analysis.error.ts             # Same analysis already PENDING
│   │   │   └── invalid-analysis-transition.error.ts   # Thrown on an invalid status transition
│   │   ├── analysis-events.ts                          # Domain events recorded by the entity
│   │   ├── analysis-status.ts                          # AnalysisStatus type
│   │   ├── credit-status.ts                            # CreditStatus type (quota credit lifecycle)
│   │   ├── analysis-type.ts                            # AnalysisType type
│   │   ├── analysis.entity.ts                          # Aggregate: status transitions
│   │   └── analysis.repository.ts                      # Repository interface (port)
│   │
│   ├── application/
│   │   ├── dto/
│   │   │   └── analyses-rpc.dto.ts                     # Zod schemas for RPC payloads
│   │   ├── analysis-quota.ts                           # Quota policy and daily window
│   │   ├── delete-analysis.use-case.ts                 # Delete, checks ownership
│   │   ├── delete-document-analyses.use-case.ts        # Reacts to document.deleted
│   │   ├── get-analysis-quota.use-case.ts              # Used / remaining credits today
│   │   ├── expire-stale-analyses.use-case.ts           # Saga timeout: fails stale PENDING analyses
│   │   ├── request-analysis.use-case.ts                # Persist analysis + analysis.requested (outbox)
│   │   ├── list-analyses.use-case.ts                   # List analyses for a document
│   │   ├── get-analysis.use-case.ts                    # Fetch one analysis, checks ownership
│   │   ├── mark-analysis-completed.use-case.ts         # Reacts to analysis.completed
│   │   └── mark-analysis-failed.use-case.ts            # Reacts to analysis.failed
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── prisma.service.ts
│   │   │   ├── prisma.module.ts
│   │   │   ├── analysis.prisma-repository.ts           # Implements analysis.repository.ts, writes the outbox
│   │   │   └── generated/                              # Prisma client output
│   │   ├── scheduling/
│   │   │   └── analysis-timeout.scheduler.ts           # Runs the saga timeout periodically
│   │   └── messaging/
│   │       ├── messaging.module.ts                     # Declares exchanges
│   │       ├── outbox-relay.ts                         # Publishes pending outbox events
│   │       └── listeners/
│   │           ├── analysis-completed.listener.ts      # Consumes analysis.completed
│   │           ├── analysis-failed.listener.ts         # Consumes analysis.failed
│   │           ├── analysis-rejected.listener.ts       # Consumes analysis.rejected
│   │           └── document-deleted.listener.ts        # Consumes document.deleted
│   │
│   ├── presentation/
│   │   ├── rpc/
│   │   │   └── analyses.rpc-handler.ts                 # RPC handlers: request, list, get-by-id, delete
│   │   ├── filters/
│   │   │   └── rpc-exception.filter.ts
│   │   ├── health/
│   │   │   └── health.controller.ts                    # GET /health — used by Render's health check
│   │   └── analysis-response.mapper.ts                 # Maps the entity to the RPC response shape
│   │
│   ├── analyses.module.ts
│   └── app.module.ts
│
├── .env
└── package.json
```

## Configuration

Create an `.env` file in this folder:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clarus"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/clarus"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
PORT=3003
```

Optional:

```dotenv
ANALYSIS_DAILY_LIMIT=20
OUTBOX_POLL_INTERVAL_MS=1000
ANALYSIS_TIMEOUT_MS=600000
ANALYSIS_TIMEOUT_CHECK_INTERVAL_MS=60000
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string used by the application at runtime |
| `DIRECT_URL` | Direct Postgres connection string used by Prisma for migrations |
| `RABBITMQ_URL` | RabbitMQ connection string |
| `PORT` | Service port |
| `ANALYSIS_DAILY_LIMIT` | Analyses a user can run per day, counted from midnight UTC (default 20) |
| `OUTBOX_POLL_INTERVAL_MS` | How often the outbox relay looks for pending events (default 1 s) |
| `ANALYSIS_TIMEOUT_MS` | How long an analysis may stay `PENDING` before it's failed (default 10 min) |
| `ANALYSIS_TIMEOUT_CHECK_INTERVAL_MS` | How often stale analyses are checked (default 1 min) |

> **Note:** `DIRECT_URL` is only required when using a hosted PostgreSQL provider such as Supabase. For a local PostgreSQL instance, `DATABASE_URL` can be used directly for Prisma migrations.

## Running

RabbitMQ and Postgres must be running (`docker compose up -d` from the repository root), and migrations must have been applied (`pnpm run setup` from the repository root, or `pnpm db:migrate:analysis` for just this service).

```bash
# From the repository root
pnpm dev:analysis
```

The service listens on `http://localhost:3003`. This script runs `start`, not `start:dev`, so it doesn't reload on file changes.