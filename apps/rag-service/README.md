# rag-service

Owns document processing and retrieval-augmented generation. It's the second participant in the document processing saga, and the second step of the analysis flow. It also serves the chat feature directly over HTTP.

## Responsibilities

- Download an uploaded file, extract its text (including tables), and split it into chunks
- Generate an embedding for each chunk and store it in `pgvector`
- React to `document.uploaded` to run this pipeline, and to `analysis.requested` to run an analysis
- Retrieve the chunks most relevant to a question or analysis type, and pass them to an LLM
- Stream chat answers back over Server-Sent Events, with no queue in between

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/chat` | Ask a question about one document or across all of them; response streams as SSE |
| GET | `/chat/sessions` | List a user's chat sessions |
| GET | `/chat/sessions/{id}/messages` | List the messages in a session |

Chat is HTTP, not RPC: a streamed answer doesn't fit the request/response shape RabbitMQ RPC is built for, and the `api-gateway` proxies these routes directly instead of going through the broker.

## Events

| Direction | Event | When |
|---|---|---|
| Consumes | `document.uploaded` | `documents-service` finished saving the file, ready to be embedded |
| Publishes | `document.embedded` | Chunking and embedding succeeded |
| Publishes | `document.embedding_failed` | Download, extraction, or embedding failed |
| Consumes | `analysis.requested` | `analysis-service` created an analysis request |
| Publishes | `analysis.completed` | The LLM produced a result |
| Publishes | `analysis.failed` | Retrieval or the LLM call failed |

Both consumers catch their own exceptions and always publish a `*_failed` event on error, so a message is never left unacknowledged and endlessly redelivered by RabbitMQ.

## Architecture

Unlike the TypeScript services, this one doesn't have a separate domain layer. SQLAlchemy models in `infrastructure/persistence/models.py` are used directly as entities — the FastAPI/SQLAlchemy ecosystem doesn't reward the same isolation Clean Architecture buys in Nest, so the models double as both the ORM mapping and the domain object.

- **`application`** — one function per use case (`process_document`, `run_analysis`, `chat_with_documents`), plus `retrieval/` for the retrieval step they share.
- **`infrastructure`** — everything that talks to the outside world: Postgres (`persistence`), RabbitMQ (`messaging`), Supabase Storage (`storage`), text extraction (`text_extraction`), and the two LLM providers (`llm`).
- **`schemas`** — Pydantic models generated from the shared JSON Schema contracts, used to validate events on the way in and out.
- **`api`** — the FastAPI router for chat.

Two providers, two jobs: Groq generates text (chat answers, analysis results); Google generates embeddings. Neither does both.

## Project structure

```
apps/rag-service/
├── app/
│   ├── core/
│   │   └── config.py                     # Settings loaded from .env (pydantic-settings)
│   │
│   ├── application/
│   │   ├── retrieval/
│   │   │   └── retrieve_relevant_chunks.py   # Embeds the query, finds similar chunks via pgvector
│   │   ├── process_document.py               # Use case: download, extract, chunk, embed, publish
│   │   ├── run_analysis.py                   # Use case: retrieve + prompt + Groq, publish result
│   │   └── chat_with_documents.py            # Use case: retrieve + prompt + Groq, streamed
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── database.py                       # Async engine and session factory
│   │   │   ├── models.py                         # SQLAlchemy models: DocumentChunk, ChatSession, ChatMessage
│   │   │   ├── document_chunk_repository.py      # Similarity search over embeddings
│   │   │   ├── chat_session_repository.py        # Create/find chat sessions
│   │   │   └── chat_message_repository.py        # Save/list messages in a session
│   │   ├── text_extraction/
│   │   │   └── extractor.py              # PDF (with tables), DOCX, and XLSX text extraction + chunking
│   │   ├── messaging/
│   │   │   ├── connection.py             # aio-pika connection/channel/exchange, cached as singletons
│   │   │   ├── consumer_setup.py         # Declares queues, binds them, registers the two consumers
│   │   │   ├── publisher.py              # Publishes the 4 outgoing events (2 validated, 2 plain dict)
│   │   │   └── consumers/
│   │   │       ├── document_uploaded_consumer.py    # Handles document.uploaded
│   │   │       └── analysis_requested_consumer.py   # Handles analysis.requested
│   │   ├── storage/
│   │   │   └── supabase_storage_client.py    # Downloads the uploaded file from Supabase Storage
│   │   └── llm/
│   │       ├── groq_client.py            # Text generation: one-shot (analysis) and streamed (chat)
│   │       └── embedding_client.py       # Embeddings via Google's gemini-embedding-001 (768 dims)
│   │
│   ├── schemas/                          # Pydantic models generated from the shared JSON Schema contracts
│   │   ├── document_uploaded.py
│   │   ├── document_embedded.py
│   │   ├── analysis_requested.py
│   │   └── analysis_completed.py
│   │
│   ├── api/
│   │   ├── health_router.py              # GET /health — used by Render's health check
│   │   └── chat_router.py                # POST /chat (SSE) and the two session-listing routes
│   │
│   └── main.py                           # FastAPI app; starts consumers on startup, closes RabbitMQ on shutdown
│
├── alembic/                              # Migrations for the `rag` schema (document_chunks, chat_sessions, chat_messages)
│   ├── versions/
│   └── env.py                            # Configured for async SQLAlchemy, restricted to the `rag` schema
├── .env
└── pyproject.toml
```


## Configuration

Create an `.env` file in this folder:

```dotenv
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/clarus"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
GOOGLE_API_KEY="..."
GROQ_API_KEY="..."
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string, using the async driver (`+asyncpg`). All services share one instance; this one uses the `rag` schema |
| `RABBITMQ_URL` | RabbitMQ connection string |
| `SUPABASE_URL` | Supabase project URL, used to download uploaded files |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **secret** key (`sb_secret_...`), not the publishable one — this bypasses RLS |
| `GOOGLE_API_KEY` | Google AI Studio key, used only for embeddings |
| `GROQ_API_KEY` | Groq key, used for chat and analysis text generation |

## Running

RabbitMQ and Postgres must be running (`docker compose up -d` from the repository root), and the `vector` extension must exist on the database (already handled by the root init script).

Unlike `documents-service` and `analysis-service`, this service's migrations aren't part of the root `pnpm setup`/`db:setup` scripts — apply them directly with Alembic:

```bash
cd apps/rag-service
uv sync
uv run alembic upgrade head
```

Then, from the repository root:

```bash
pnpm dev:rag
```

The service listens on `http://localhost:3004`, with `--reload` enabled, so it restarts on file changes.