# API Gateway

Single entry point for the Clarus frontend. It authenticates every request and forwards it to the right service. It has no database and no business logic.

## Responsibilities

- Validate the Supabase access token on every protected route
- Route each request to the service that owns the data, using the transport that fits the operation
- Translate errors from downstream services into HTTP responses

## Routes

| Endpoint | Transport | Target |
|---|---|---|
| `POST /documents/upload` | HTTP (multipart) | documents-service |
| `GET /documents` | RPC | documents-service |
| `GET /documents/:id` | RPC | documents-service |
| `DELETE /documents/:id` | RPC | documents-service |
| `POST /analyses` | RPC | analysis-service |
| `GET /analyses?documentId=` | RPC | analysis-service |
| `GET /analyses/:id` | RPC | analysis-service |
| `POST /chat` (SSE stream) | HTTP | rag-service |
| `GET /chat/sessions` | HTTP | rag-service |
| `GET /chat/sessions/:id/messages` | HTTP | rag-service |
| `GET /dashboard/summary` | RPC | documents-service, analysis-service |

## Design notes

- **Thin by design.** The gateway only authenticates, routes, and maps errors. Business rules live in the services that own the data, so it doesn't use the layered structure of the domain services.
- **Identity comes from the token.** The user ID is always taken from the validated token, never from the request body or query string.
- **Transport follows the payload.** Reads and commands go over RabbitMQ RPC. File uploads and chat streaming use plain HTTP: multipart bodies don't fit a message queue, and the chat response is streamed to the client as it is generated.

## Project structure

```
apps/api-gateway/
├── src/
│   ├── auth/
│   │   ├── supabase-auth.guard.ts        # Validates the Supabase token on protected routes
│   │   ├── current-user.decorator.ts     # Exposes the authenticated user to controllers
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
│   │   ├── analyses.controller.ts        # Request, list, and get analysis routes
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
│   ├── filter/
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
```

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL, used by the auth guard |
| `SUPABASE_ANON_KEY` | Supabase publishable key, used by the auth guard |
| `RABBITMQ_URL` | RabbitMQ connection string, used for RPC |
| `DOCUMENTS_SERVICE_URL` | Base URL of `documents-service`, used for uploads |
| `RAG_SERVICE_URL` | Base URL of `rag-service`, used for chat |

## Running

RabbitMQ and Postgres must be running (`docker compose up -d` from the repository root), and migrations must have been applied (`pnpm run setup` from the repository root, or `pnpm db:migrate:documents` for just this service).

```bash
# From the repository root
pnpm dev:documents
```

The service listens on `http://localhost:3002`. 