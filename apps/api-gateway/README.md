# API Gateway

Single entry point for the Clarus frontend. It authenticates every request and forwards it to the right service. It has no database and no business logic.

## Responsibilities

- Validate the Supabase access token on every route (a global guard; only `/health` is public)
- Route each request to the service that owns the data, using the transport that fits the operation
- Translate errors from downstream services into HTTP responses

## Routes

| Endpoint | Transport | Target |
|---|---|---|
| `POST /documents` (multipart, field `file`) | HTTP | documents-service |
| `GET /documents` | RPC `documents.list` | documents-service |
| `GET /documents/:id` | RPC `documents.get-by-id` | documents-service |
| `DELETE /documents/:id` | RPC `documents.delete` | documents-service |
| `POST /analyses` | RPC `analyses.request` | analysis-service |
| `GET /analyses?documentId=` | RPC `analyses.list` | analysis-service |
| `GET /analyses/quota` | RPC `analyses.quota` | analysis-service |
| `GET /analyses/:id` | RPC `analyses.get-by-id` | analysis-service |
| `DELETE /analyses/:id` | RPC `analyses.delete` | analysis-service |
| `POST /chat` (SSE stream) | HTTP | rag-service |
| `GET /chat/sessions` | HTTP | rag-service |
| `GET /chat/sessions/:id/messages` | HTTP | rag-service |
| `GET /dashboard/summary` | RPC `documents.list` + `analyses.list`, in parallel | documents-service, analysis-service |
| `GET /health` (public) | — | — |

RPC calls go to the `clarus.rpc` exchange with a 5 s timeout. Uploads accept PDF, DOCX, and XLSX only (anything else is a 400) and are forwarded with a 30 s timeout. `GET /analyses/quota` is declared before `GET /analyses/:id` so that `quota` isn't captured as an id.

## Error mapping

Services answer RPC errors as `{ error, message }`; `shared/rpc-error.mapper.ts` turns them into HTTP responses:

| RPC error | HTTP |
|---|---|
| `VALIDATION_ERROR` | 400, with `details` |
| `NOT_FOUND` | 404 |
| `CONFLICT` (the same analysis is already running) | 409 |
| `QUOTA_EXCEEDED` (daily analysis limit reached) | 429 |
| anything else | 500 |
| no reply / broker unreachable | 503 |

Invalid request bodies (Zod) are answered with 400 by `filters/zod-exception.filter.ts`.

## Design notes

- **Thin by design.** The gateway only authenticates, routes, and maps errors. Business rules live in the services that own the data, so it doesn't use the layered structure of the domain services.
- **Identity comes from the token.** The user ID is always taken from the validated token, never from the request body or query string.
- **Transport follows the payload.** Reads and commands go over RabbitMQ RPC. File uploads and chat streaming use plain HTTP: multipart bodies don't fit a message queue, and the chat response is streamed to the client as it is generated.

## Project structure

```
apps/api-gateway/
├── src/
│   ├── auth/
│   │   ├── supabase-auth.guard.ts        # Global guard: validates the Supabase token
│   │   ├── current-user.decorator.ts     # Exposes the authenticated user to controllers
│   │   ├── public.decorator.ts           # Marks a route as exempt from the auth guard
│   │   └── auth.module.ts
│   │
│   ├── shared/
│   │   ├── rpc-client.service.ts         # Wrapper for RabbitMQ request/response calls
│   │   ├── rpc-error.mapper.ts           # Maps RPC errors to HTTP exceptions
│   │   └── shared.module.ts
│   │
│   ├── documents/
│   │   ├── documents.controller.ts       # Upload, list, get, and delete routes
│   │   ├── documents.service.ts          # RPC calls and upload forwarding to documents-service
│   │   └── documents.module.ts
│   │
│   ├── analyses/
│   │   ├── dto/
│   │   │   └── request-analysis.dto.ts   # Zod schema for the analysis request body
│   │   ├── analyses.controller.ts        # Request, list, quota, get, and delete routes
│   │   ├── analyses.service.ts           # RPC calls to analysis-service
│   │   └── analyses.module.ts
│   │
│   ├── chat/
│   │   ├── dto/
│   │   │   └── chat.dto.ts               # Zod schema for the chat request body
│   │   ├── chat.controller.ts            # Chat stream and session routes
│   │   ├── chat.service.ts               # HTTP calls to rag-service, pipes the SSE stream
│   │   └── chat.module.ts
│   │
│   ├── dashboard/
│   │   ├── dashboard.controller.ts       # Dashboard summary route
│   │   ├── dashboard.service.ts          # Aggregates data from documents and analyses
│   │   └── dashboard.module.ts
│   │
│   ├── health/
│   │   └── health.controller.ts          # GET /health, public — used by Render's health check
│   │
│   ├── filters/
│   │   └── zod-exception.filter.ts       # Maps Zod validation errors to HTTP 400
│   │
│   ├── messaging/
│   │   └── messaging.module.ts           # RabbitMQ connection and exchanges
│   │
│   ├── app.module.ts
│   └── main.ts                           # Bootstrap and CORS setup
│
├── .env
└── package.json
```

## Configuration

Create an `.env` file in this folder:

```dotenv
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-supabase-publishable-key>
RABBITMQ_URL=amqp://guest:guest@localhost:5672
DOCUMENTS_SERVICE_URL=http://localhost:3002
RAG_SERVICE_URL=http://localhost:3004
FRONTEND_URLS=http://localhost:3000
PORT=3001
```

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL, used by the auth guard |
| `SUPABASE_ANON_KEY` | Supabase publishable key, used by the auth guard |
| `RABBITMQ_URL` | RabbitMQ connection string, used for RPC |
| `DOCUMENTS_SERVICE_URL` | Base URL of `documents-service`, used for uploads |
| `RAG_SERVICE_URL` | Base URL of `rag-service`, used for chat |
| `FRONTEND_URLS` | Comma-separated origins allowed by CORS |
| `PORT` | Service port (default 3001) |

## Running

RabbitMQ must be running (`docker compose up -d` from the repository root), along with `documents-service`, `analysis-service`, and `rag-service` for the routes that reach them. The gateway has no database, so there are no migrations.

```bash
# From the repository root
pnpm dev:api
```

The service listens on `http://localhost:3001`. This script runs `start`, not `start:dev`, so it doesn't reload on file changes.
