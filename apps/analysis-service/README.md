# analysis-service

Owns analysis requests and results for a document. It's the second participant in the document processing saga, and the first step of the analysis flow.

## Responsibilities

- Create an analysis request for one of the four types (Summary, Extract values, Deadlines, Compare)
- Publish `analysis.requested` so `rag-service` can run it
- React to `analysis.completed` / `analysis.failed` to store the result
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
| Publishes | `analysis.requested` | Right after the analysis record is created |
| Consumes | `analysis.completed` | `rag-service` finished the analysis, with a result |
| Consumes | `analysis.failed` | `rag-service` failed to run the analysis |

Listeners tolerate an analysis that no longer exists and return without error, since there's no caller waiting on an async event.

## Architecture

Clean Architecture, with dependencies pointing inward:

- **`domain`** — the `Analysis` entity carries the business rules (valid status transitions). `analysis.repository.ts` is the interface the infrastructure implements.
- **`application`** — one use case per operation. Each depends only on the domain and on ports (repository, event publisher), never on Prisma or RabbitMQ directly.
- **`infrastructure`** — the adapters: Prisma repository, RabbitMQ publisher and listeners.
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
│   │   │   └── invalid-analysis-transition.error.ts   # Thrown on an invalid status transition
│   │   ├── analysis-status.ts                          # AnalysisStatus type
│   │   ├── analysis-type.ts                            # AnalysisType type
│   │   ├── analysis.entity.ts                          # Aggregate: status transitions
│   │   └── analysis.repository.ts                      # Repository interface (port)
│   │
│   ├── application/
│   │   ├── dto/
│   │   │   └── analyses-rpc.dto.ts                     # Zod schemas for RPC payloads
│   │   ├── ports/
│   │   │   └── analysis-event-publisher.port.ts        # Port for publishing domain events
│   │   ├── delete-analysis.use-case.ts                 # Delete, checks ownership
│   │   ├── request-analysis.use-case.ts                # Persist, publish analysis.requested
│   │   ├── list-analyses.use-case.ts                   # List analyses for a document
│   │   ├── get-analysis.use-case.ts                    # Fetch one analysis, checks ownership
│   │   ├── mark-analysis-completed.use-case.ts         # Reacts to analysis.completed
│   │   └── mark-analysis-failed.use-case.ts            # Reacts to analysis.failed
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── prisma.service.ts
│   │   │   ├── prisma.module.ts
│   │   │   ├── analysis.prisma-repository.ts           # Implements analysis.repository.ts
│   │   │   └── generated/                              # Prisma client output
│   │   └── messaging/
│   │       ├── messaging.module.ts                     # Declares exchanges, registers publisher and listeners
│   │       ├── analysis-event-publisher.ts             # Implements analysis-event-publisher.port.ts
│   │       └── listeners/
│   │           ├── analysis-completed.listener.ts      # Consumes analysis.completed
│   │           └── analysis-failed.listener.ts         # Consumes analysis.failed
│   │
│   ├── presentation/
│   │   ├── rpc/
│   │   │   └── analyses.rpc-handler.ts                 # RPC handlers: request, list, get-by-id, delete
│   │   ├── filters/
│   │   │   └── rpc-exception.filter.ts
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
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
PORT=3003
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string. All services share one instance; this one uses the `analyses` schema |
| `RABBITMQ_URL` | RabbitMQ connection string |
| `PORT` | Service port |

## Running

RabbitMQ and Postgres must be running (`docker compose up -d` from the repository root), and migrations must have been applied (`pnpm run setup` from the repository root, or `pnpm db:migrate:analysis` for just this service).

```bash
# From the repository root
pnpm dev:analysis
```

The service listens on `http://localhost:3003`. This script runs `start`, not `start:dev`, so it doesn't reload on file changes.