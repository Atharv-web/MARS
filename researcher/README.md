# MARS Backend

The research engine for [MARS](../README.md). A stateless Express + TypeScript API that queries multiple search providers in parallel, cross-verifies and synthesizes the results with OpenAI, persists reports to SQLite, and streams progress to the client over Server-Sent Events.

## Stack

Node.js · Express · TypeScript · SQLite (`better-sqlite3`) · OpenAI · Zod

## Run locally

```bash
npm install
cp .env.example .env   # fill in your keys
npm run dev            # tsx watch, http://localhost:8000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode (`tsx watch src/server.ts`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled server (`node dist/server.js`) |

## Environment variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `PORT` | no | `8000` | HTTP port |
| `FRONTEND_ORIGIN` | no | `http://localhost:3000` | CORS allow-origin |
| `DATABASE_PATH` | no | `data/mars.db` | SQLite file path |
| `OPENAI_API_KEY` | **yes** | — | Verification + synthesis |
| `OPENAI_MODEL` | no | `gpt-5.4` | OpenAI model id |
| `SERPER_API_KEY` | **yes** | — | Google search + images |
| `TAVILY_API_KEY` | **yes** | — | Grounded web search |
| `PERPLEXITY_API_KEY` | **yes** | — | Cited LLM research |
| `PERPLEXITY_MODEL` | no | `sonar-pro` | Perplexity model |
| `PARALLEL_API_KEY` | no | — | Enables the real [Parallel AI Search API](https://docs.parallel.ai/api-reference/search/search). When unset, this lens falls back to an OpenAI research map. |
| `PARALLEL_MODE` | no | `advanced` | Parallel search mode: `turbo` \| `basic` \| `advanced` |
| `PROVIDER_TIMEOUT_MS` | no | `22000` | Max time any single provider may take before it's abandoned |

## Pipeline

`collecting → verifying → synthesizing → completed`

1. **collecting** — `collectParallelResearch()` runs all providers via `Promise.allSettled`. Each request is timeout-bounded (`PROVIDER_TIMEOUT_MS`) and checked for a non-2xx response, so a slow or failing provider can't hang the run or silently return empty grounding. The run only fails if **every** provider fails.
2. **verifying** — OpenAI cross-checks claims, conflicts, and credibility.
3. **synthesizing** — OpenAI streams the Markdown report; structured artifacts (summary, key findings, deep insights, charts) are then extracted.
4. **completed** — sources (deduped, top 20) and images (top 8) are persisted to SQLite.

## API

| Method | Route | Purpose |
|--------|-------|---------|
| `GET`  | `/api/health` | Service + model status |
| `POST` | `/api/research` | Start a report — `{ "topic": string }` (3–300 chars) |
| `GET`  | `/api/research/:reportId/stream` | SSE: `status`, `markdown_delta`, `report_ready`, `error` |
| `GET`  | `/api/reports` | Recent reports |
| `GET`  | `/api/reports/:reportId` | Full report record |

## Structure

```
src/
├── server.ts                  # Express app + routes
├── config.ts                  # env config
├── db.ts                      # SQLite persistence
├── types.ts / utils.ts        # shared types + helpers
└── services/
    ├── openai.ts              # OpenAI client
    ├── searchProviders.ts     # Serper, Tavily, Perplexity, Parallel AI
    └── researchPipeline.ts    # orchestration + SSE streaming
```
