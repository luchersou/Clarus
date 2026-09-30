# documents-service

Owns the lifecycle of uploaded documents: storing the file, tracking processing status, and soft deleting. It's the first participant in the document processing saga.

## Responsibilities

- Accept file uploads and store them in Supabase Storage
- Persist document metadata and status (`UPLOADED`, `PROCESSED`, `FAILED`)
- Publish `document.uploaded` so `rag-service` can process the file
- React to `document.embedded` / `document.embedding_failed` to update status
- Serve document data to the gateway over RPC, scoped to the requesting user

## Endpoints

| Type | Route / routing key | Use case |
|---|---|---|
| HTTP | `POST /documents` | `UploadDocumentUseCase` |
| RPC | `documents.list` | `ListDocumentsUseCase` |
| RPC | `documents.get-by-id` | `GetDocumentUseCase` |
| RPC | `documents.delete` | `DeleteDocumentUseCase` |

Upload is HTTP because the payload is a multipart file, not message-shaped. The other three are RPC over RabbitMQ, called by the `api-gateway`.

## Events

| Direction | Event | When |
|---|---|---|
| Publishes | `document.uploaded` | After the file is stored and the document is persisted |
| Consumes | `document.embedded` | `rag-service` finished processing the document |
| Consumes | `document.embedding_failed` | `rag-service` failed to process the document |

Listeners tolerate a document that no longer exists (for example, soft-deleted while still being processed) and return without error, since there's no caller waiting on an async event.

## Architecture

Clean Architecture, with dependencies pointing inward:

- **`domain`** — the `Document` entity carries the business rules (valid status transitions, soft delete). `document.repository.ts` is the interface the infrastructure implements.
- **`application`** — one use case per operation. Each depends only on the domain and on ports (repository, file storage, event publisher), never on Prisma, RabbitMQ, or Supabase directly.
- **`infrastructure`** — the adapters: Prisma repository, Supabase Storage client, RabbitMQ publisher and listeners.
- **`presentation`** — the HTTP controller and RPC handler, plus response mapping and exception filters.

`GetDocumentUseCase` and `DeleteDocumentUseCase` check that the document belongs to the requesting user and return "not found" rather than "forbidden" on a mismatch, so the existence of another user's document isn't revealed.

## Project structure

```
apps/documents-service/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── domain/
│   │   ├── errors/
│   │   │   └── invalid-document-transition.error.ts   # Thrown on an invalid status transition
│   │   ├── document-status.ts                          # DocumentStatus type
│   │   ├── file-type.ts                                # FileType type
│   │   ├── document.entity.ts                          # Aggregate: status transitions, soft delete
│   │   └── document.repository.ts                      # Repository interface (port)
│   │
│   ├── application/
│   │   ├── dto/
│   │   │   ├── documents-rpc.dto.ts                    # Zod schemas for RPC payloads
│   │   │   └── upload-document.dto.ts                  # Zod schema for the upload request body
│   │   ├── ports/
│   │   │   ├── document-event-publisher.port.ts        # Port for publishing domain events
│   │   │   └── file-storage.port.ts                    # Port for file storage
│   │   ├── get-document.use-case.ts                    # Fetch one document, checks ownership
│   │   ├── delete-document.use-case.ts                 # Soft delete, checks ownership
│   │   ├── list-documents.use-case.ts                  # List a user's documents
│   │   ├── upload-document.use-case.ts                 # Store the file, persist, publish document.uploaded
│   │   ├── mark-document-processed.use-case.ts         # Reacts to document.embedded
│   │   └── mark-document-failed.use-case.ts            # Reacts to document.embedding_failed
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── prisma.service.ts
│   │   │   ├── prisma.module.ts
│   │   │   ├── document.prisma-repository.ts           # Implements document.repository.ts
│   │   │   └── generated/                              # Prisma client output
│   │   ├── messaging/
│   │   │   ├── rabbitmq.module.ts                      # Declares exchanges, registers publisher and listeners
│   │   │   ├── document-event-publisher.ts             # Implements document-event-publisher.port.ts
│   │   │   └── listeners/
│   │   │       ├── document-embedded.listener.ts       # Consumes document.embedded
│   │   │       └── document-embedding-failed.listener.ts  # Consumes document.embedding_failed
│   │   └── storage/
│   │       └── supabase-storage.service.ts             # Implements file-storage.port.ts
│   │
│   ├── presentation/
│   │   ├── rpc/
│   │   │   └── documents.rpc-handler.ts                # RPC handlers: list, get-by-id, delete
│   │   ├── health/
│   │   │   └── health.controller.ts                    # GET /health — used by Render's health check 
│   │   ├── filters/
│   │   │   ├── rpc-exception.filter.ts
│   │   │   └── zod-exception.filter.ts                 # Maps Zod validation errors to HTTP 400
│   │   ├── document-response.mapper.ts                 # Maps the entity to the HTTP/RPC response shape
│   │   └── documents.controller.ts                     # HTTP route: upload
│   │
│   ├── documents.module.ts
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
SUPABASE_URL="https://<your-project>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<your-supabase-secret-key>"
PORT=3002
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string. All services share one instance; this one uses the `documents` schema |
| `RABBITMQ_URL` | RabbitMQ connection string |
| `SUPABASE_URL` | Supabase project URL, used for Storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key, used to upload files server-side |
| `PORT` | HTTP port for the upload route |

## Running

RabbitMQ and Postgres must be running (`docker compose up -d` from the repository root).

```bash
# Generate the Prisma client and run migrations
pnpm exec prisma generate
pnpm exec prisma migrate deploy

# Start the service
pnpm start:dev
```