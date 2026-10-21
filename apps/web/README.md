# web

The frontend, built with Next.js (App Router). It's the only piece a user's browser talks to directly — every request to the backend goes through the `api-gateway`, either from a Server Component/Action or proxied through the one route handler in `app/api/chat/`.

## Responsibilities

- Authenticate users via Supabase Auth: OAuth with Google and GitHub, or email and password
- Render the public landing page and the dashboard: home, documents, analyses, chat, and settings
- Fetch data server-side and stream it in with `Suspense`, one boundary per independent piece of data
- Run mutations (upload, delete, request analysis, account settings) as Server Actions, never as client-side fetches to the gateway
- Proxy the one thing Server Actions can't do well — the streamed chat response — through a route handler

## Architecture

**Server first.** Reads happen in Server Components, calling plain async functions in `lib/api/`. Each of them builds its `Authorization` header with `lib/api/auth-headers.ts`, which reads the current session through `lib/supabase/server.ts`, and calls the `api-gateway` with the user's token — the gateway URL and the token never reach the browser. When a Client Component needs fresh data after the first render (polling the analyses list while one is pending, loading a document into the detail dialog), it calls a Server Action that wraps the same `lib/api/` function.

**Server/Client pairs.** Any component that needs both a data fetch and interactivity is split in two: a Server Component with the plain name (`documents-list.tsx`) that fetches and passes props down, and a Client Component with the `-client` suffix (`documents-list-client.tsx`) that renders and handles interaction. The server half can sit inside its own `Suspense` boundary; the client half stays a "dumb" component, easy to reuse or test with props alone.

**Where things live.** Everything lives with the nearest route that owns it. A component, hook, or config used by a single route stays in that route's `_components/`, `_hooks/`, or `_lib/` folder (skeletons and `-client` counterparts included); one shared by several dashboard pages goes up to `app/dashboard/_components/` or `app/dashboard/_lib/`; only what the whole app shares lives in `src/components/`, `src/hooks/`, and `src/lib/`. Server Actions follow the same rule: each lives in the `actions.ts` of the route that owns the data. Another route can import it from there — `requestAnalysis` belongs to `dashboard/analyses/actions.ts` and is also used by the documents page.

**Errors from Server Actions are returned, not thrown.** In production Next.js hides the message of an error thrown by a Server Action, so `requestAnalysis` returns `{ ok: false, error }` instead. That's how the gateway's explanations for a reached daily quota (429) or an analysis already running (409) reach the user.

**Auth boundary.** `proxy.ts` (the middleware) runs on `/dashboard` routes: it refreshes the Supabase session and redirects visitors without one to `/login`. `app/dashboard/layout.tsx` checks the user again as a second layer, and the login page sends an already signed-in user to `/dashboard`. Inside the dashboard, `lib/supabase/server.ts` reads that same session to authorize each request to the gateway.

**Chat is the one exception to "Server Action for everything".** A streamed answer doesn't fit the request/response shape a Server Action expects, so the client calls `app/api/chat/route.ts` directly; that route reads the session server-side, forwards the request to the `api-gateway` with the token attached, and pipes the response stream straight back. The browser never sees the gateway's URL or the token. On the client, `dashboard/chat/_hooks/use-chat-stream.ts` parses the SSE stream with `eventsource-parser`.

**LLM output renders as Markdown** (`react-markdown` + `remark-gfm`, styled with `@tailwindcss/typography`) — both assistant chat messages and analysis results, since the LLM's replies come back formatted. User messages and error states stay as plain text.

## Project structure
```
apps/web/
├── public/
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   └── login/
    │   │       ├── page.tsx         # Email/password and OAuth sign-in
    │   │       ├── actions.ts       # loginWithPassword
    │   │       └── _components/     # Login form, OAuth buttons
    │   ├── (public)/
    │   │   ├── layout.tsx           # Landing header + footer
    │   │   ├── page.tsx             # Landing page
    │   │   └── _components/
    │   │       ├── layout/          # Landing header and footer
    │   │       ├── sections/        # Hero, features, how it works, FAQ, CTA
    │   │       └── reveal.tsx       # Scroll-reveal animation wrapper
    │   ├── api/
    │   │   └── chat/                # Proxies POST /chat to the gateway, streaming the SSE response back
    │   ├── auth/
    │   │   └── callback/            # Supabase OAuth redirect target
    │   ├── dashboard/
    │   │   ├── layout.tsx           # Auth check, sidebar + header, shared by every dashboard page
    │   │   ├── page.tsx             # Home: welcome, metrics, recent analyses
    │   │   ├── _components/
    │   │   │   ├── header/          # Header and command-palette search
    │   │   │   ├── sidebar/         # Sidebar, logo, navigation, user menu
    │   │   │   └── home/            # Home page widgets and their skeletons
    │   │   ├── _lib/
    │   │   │   └── nav-items.ts     # Navigation entries, shared by the sidebar and the search
    │   │   ├── documents/           # page.tsx, actions.ts (upload, delete, get by id), _components/
    │   │   ├── analyses/            # page.tsx, actions.ts (request, delete, list), _components/
    │   │   ├── chat/                # page.tsx, _components/, _hooks/use-chat-stream.ts
    │   │   └── settings/            # page.tsx, actions.ts (profile, email, password, accounts, sessions, delete), _components/
    │   ├── globals.css
    │   └── layout.tsx               # Root layout
    │
    ├── components/
    │   ├── ui/                      # shadcn primitives
    │   └── icons/                   # Google and GitHub icons (login and settings)
    │
    ├── hooks/
    │   ├── use-breakpoints.ts       # useIsMobile / useIsTablet (matchMedia)
    │   └── use-supabase-user.ts     # Current Supabase user on the client
    │
    ├── lib/
    │   ├── api/                     # Server-only read functions that call the gateway
    │   │   ├── auth-headers.ts      # Builds the Bearer header from the current session
    │   │   ├── analyses.ts          # getAnalyses, getAnalysisQuota, ...
    │   │   ├── chat.ts
    │   │   ├── dashboard.ts         # getDashboardSummary
    │   │   └── documents.ts         # getDocuments, getDocumentById
    │   ├── supabase/
    │   │   ├── admin.ts             # Service-role client, bypasses RLS — server-only, used for account deletion
    │   │   ├── client.ts            # Browser Supabase client
    │   │   └── server.ts            # Server Supabase client, reads cookies
    │   └── utils.ts
    │
    └── proxy.ts                     # Middleware: refreshes the session, guards /dashboard
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **publishable** key (`sb_publishable_...`). Safe to expose; scoped by RLS. Used by the browser, server and middleware clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **secret** key (`sb_secret_...`). Server-only, bypasses RLS. Used only by `lib/supabase/admin.ts` |
| `API_GATEWAY_URL` | `api-gateway` base URL. Server-only — never sent to the browser, since it isn't prefixed `NEXT_PUBLIC_` |

## Running

The `api-gateway` (and, transitively, the other backend services) should be running for any page beyond the public/auth ones to work.

```bash
# From the repository root
pnpm dev:web   # just this app
pnpm dev       # every service at once
```

The app listens on `http://localhost:3000`. Inside this folder, the usual `dev`, `build`, `start`, and `lint` scripts are available.
