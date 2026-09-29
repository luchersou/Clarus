# web

The frontend, built with Next.js (App Router). It's the only piece a user's browser talks to directly — every request to the backend goes through the `api-gateway`, either from a Server Component/Action or proxied through a route in `app/api/`.

## Responsibilities

- Authenticate users via Supabase Auth (OAuth with Google and GitHub)
- Render the dashboard: documents, analyses, and chat
- Fetch data server-side and stream it in with `Suspense`, one boundary per independent piece of data
- Run mutations (upload, delete, request analysis) as Server Actions, never as client-side fetches to the gateway
- Proxy the one thing Server Actions can't do well — the streamed chat response — through a route handler

## Architecture

**Server first.** Reads happen in Server Components, calling plain async functions in `lib/api/`. Each of those functions gets the current session from `lib/supabase/server.ts` and calls the `api-gateway` with the user's token — the gateway URL and the token never reach the browser.

**Server/Client pairs.** Any component that needs both a data fetch and interactivity is split in two: a Server Component with the plain name (`documents-list.tsx`) that fetches and passes props down, and a Client Component with the `-client` suffix (`documents-list-client.tsx`) that renders and handles interaction. The server half can sit inside its own `Suspense` boundary; the client half stays a "dumb" component, easy to reuse or test with props alone.

**Where things live.** A component used by a single route stays in that route's own `_components/` folder, right next to the route that owns it — skeletons and `-client` counterparts included. A Server Action used by more than one route (like `requestAnalysis`, called from both the documents and analyses pages) moves out to `lib/actions/`; one used by a single route stays in that route's own `actions.ts`. The rule is the same in both cases: co-locate with the one owner, or centralize once there's more than one.

**Auth boundary.** `proxy.ts` (the root middleware) refreshes the Supabase session on every request and redirects unauthenticated visitors away from `/dashboard`. Inside the dashboard, `lib/supabase/server.ts` reads that same session to authorize each request to the gateway.

**Chat is the one exception to "Server Action for everything".** A streamed answer doesn't fit the request/response shape a Server Action expects, so the client calls `app/api/chat/route.ts` directly; that route reads the session server-side, forwards the request to the `api-gateway` with the token attached, and pipes the response stream straight back. The browser never sees the gateway's URL or the token.

**Assistant messages render as Markdown** (`react-markdown` + `remark-gfm`, styled with `@tailwindcss/typography`), since the LLM's replies come back formatted. User messages and error states stay as plain text.

## Project structure
```
apps/web/
├── public/
└── src/
    ├── app/
    │   ├── (auth)/              # Login and other unauthenticated auth pages
    │   ├── (public)/            # Landing page and other public marketing routes
    │   ├── api/
    │   │   ├── chat/            # Proxies POST /chat to the gateway, streaming the SSE response back
    │   │   ├── analyses/        # Backs the analyses list's polling from the client
    │   │   └── documents/       # Backs any client-side document fetch that can't use a Server Component
    │   ├── auth/
    │   │   └── callback/        # Supabase OAuth redirect target
    │   ├── dashboard/
    │   │   ├── layout.tsx       # Sidebar + header, shared by every dashboard page
    │   │   ├── page.tsx         # Home
    │   │   ├── documents/
    │   │   ├── analyses/
    │   │   ├── chat/
    │   │   ├── settings/
    │   │   └── _components/     # Components shared across dashboard pages (sidebar, header)
    │   ├── globals.css
    │   └── layout.tsx           # Root layout
    │
    ├── components/
    │   ├── ui/                  # shadcn primitives
    │   ├── layout/               # Landing-page header/footer, or other cross-cutting layout pieces
    │   └── sections/              # Landing-page sections
    │
    ├── hooks/
    │   ├── use-breakpoints.ts
    │   ├── use-chat-stream.ts
    │   ├── use-count-up.ts
    │   └── use-chat-stream.ts    # Parses the SSE stream from /api/chat into messages
    │
    ├── lib/
    │   ├── api/                   # Server-only read functions (getDocuments, getAnalyses, ...)
    │   ├── actions/                # Server Actions shared by more than one route (requestAnalysis, ...)
    │   ├── supabase/
    │   │   ├── admin.ts            # Service-role client, bypasses RLS — server-only, no session handling
    │   │   ├── client.ts           # Browser Supabase client
    │   │   └── server.ts           # Server Supabase client, reads cookies
    │   └── utils.ts
    │
    └── proxy.ts                    # Middleware: refreshes the session, guards /dashboard
```

## Configuration

Create an `.env.local` file in this folder:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
API_GATEWAY_URL=http://localhost:3001
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. Public — read by both server and browser code |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **secret** key (`sb_secret_...`). Server-only, bypasses RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **publishable** key (`sb_publishable_...`). Safe to expose; scoped by RLS |
| `API_GATEWAY_URL` | `api-gateway` base URL. Server-only — never sent to the browser, since nothing here is prefixed `NEXT_PUBLIC_` |

## Running

The `api-gateway` (and, transitively, the other backend services) should be running for any page beyond the public/auth ones to work.

```bash
# From the repository root
pnpm dev:web
```

The app listens on `http://localhost:3000`.