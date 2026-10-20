# analysis-service

Owns analysis requests and results for a document. It's the second participant in the document processing saga, and the first step of the analysis flow.

## Responsibilities

- Create an analysis request for one of the four types (Summary, Extract values, Deadlines, Compare)
- Publish `analysis.requested` so `rag-service` can run it, through a transactional outbox
- React to `analysis.completed` / `analysis.failed` to store the result
- Fail analyses that never got a reply (saga timeout)
- Serve analysis data to the gateway over RPC, scoped to the requesting user

## Endpoints

| Type | Routing key | Use case |
|---|---|---|
| RPC | `analyses.request` | `RequestAnalysisUseCase` |
| RPC | `analyses.list-by-document` | `ListAnalysesUseCase` |
| RPC | `analyses.get-by-id` | `GetAnalysisUseCase` |
| RPC | `analyses.delete` | `DeleteAnalysisUseCase` |

All four are RPC over RabbitMQ, called by the `api-gateway`. There's no HTTP route: unlike `documents-service`, no request here carries a file.

## Events

| Direction | Event | When |
|---|---|---|
| Publishes | `analysis.requested` | Stored in the outbox with the analysis record, then published by `OutboxRelay` |
| Consumes | `analysis.completed` | `rag-service` finished the analysis, with a result |
| Consumes | `analysis.failed` | `rag-service` failed to run the analysis |

Listeners tolerate an analysis that no longer exists and return without error, since there's no caller waiting on an async event.

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
│   │   │   └── invalid-analysis-transition.error.ts   # Thrown on an invalid status transition
│   │   ├── analysis-events.ts                          # Domain events recorded by the entity
│   │   ├── analysis-status.ts                          # AnalysisStatus type
│   │   ├── analysis-type.ts                            # AnalysisType type
│   │   ├── analysis.entity.ts                          # Aggregate: status transitions
│   │   └── analysis.repository.ts                      # Repository interface (port)
│   │
│   ├── application/
│   │   ├── dto/
│   │   │   └── analyses-rpc.dto.ts                     # Zod schemas for RPC payloads
│   │   ├── delete-analysis.use-case.ts                 # Delete, checks ownership
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
│   │           └── analysis-failed.listener.ts         # Consumes analysis.failed
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