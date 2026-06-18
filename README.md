# MARS — Model Agnostic Research System

MARS turns a plain-language question into a clean, **cited research report**. Instead of relying on a single search engine or model, it fires **multiple search-intelligence systems in parallel**, cross-checks what they return, and synthesizes the result into one structured, readable document — streamed to you live as it's written.

It works for any topic (technology, science, markets, health, policy, …), not just one domain.

---

## How it works

```
Topic ─▶ Collect (parallel) ─▶ Verify ─▶ Synthesize ─▶ Report
         Serper · Tavily        OpenAI     OpenAI         Markdown + charts
         Perplexity · Parallel   cross-     streaming      + images + sources
                                 check
```

1. **Collect** — Serper (Google + images), Tavily, Perplexity, and the Parallel AI Search API are queried **at the same time**. Each call is timeout-bounded, and a failing provider degrades gracefully instead of stalling the run.
2. **Verify** — OpenAI cross-checks claims across sources, flags conflicts, and discards weakly-supported statements.
3. **Synthesize** — OpenAI streams a structured Markdown report (Executive Summary, Key Findings, Data & Stats, Deep Insights, Sources) plus extracted charts.
4. **Persist & stream** — the report is saved to SQLite and pushed to the browser live over Server-Sent Events.

---

## Architecture

| Layer | Stack | Location |
|-------|-------|----------|
| **Backend** | Node.js · Express · TypeScript · SQLite (`better-sqlite3`) · OpenAI | [`researcher/`](researcher/) |
| **Frontend** | Next.js 15 · React 19 · Tailwind CSS 4 · framer-motion · Recharts | [`med-researcher/`](med-researcher/) |

There is **no authentication layer** — the backend is a stateless API and the frontend is a public client.

---

## Getting started

### 1. Backend (`researcher/`)

```bash
cd researcher
npm install
cp .env.example .env   # then fill in your API keys
npm run dev            # starts on http://localhost:8000
```

Required keys: `OPENAI_API_KEY`, `SERPER_API_KEY`, `TAVILY_API_KEY`, `PERPLEXITY_API_KEY`.
Optional: `PARALLEL_API_KEY` (enables the real Parallel AI Search; falls back to an OpenAI research map when absent). See [`researcher/README.md`](researcher/README.md) for the full list.

### 2. Frontend (`med-researcher/`)

```bash
cd med-researcher
npm install
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
npm run dev            # starts on http://localhost:3000
```

Open <http://localhost:3000>, click **Start Researching** (or go to `/app`), and enter a topic.

---

## HTTP API

| Method | Route | Purpose |
|--------|-------|---------|
| `GET`  | `/api/health` | Service + model status |
| `POST` | `/api/research` | Start a report — body `{ "topic": string }`, returns `{ reportId, slug, status }` |
| `GET`  | `/api/research/:reportId/stream` | Live progress + markdown via Server-Sent Events |
| `GET`  | `/api/reports` | List recent reports |
| `GET`  | `/api/reports/:reportId` | Fetch a full report record |

---

## Project layout

```
MARS/
├── researcher/        # Express + TypeScript backend
│   └── src/
│       ├── server.ts            # routes
│       ├── services/            # search providers + research pipeline
│       ├── db.ts                # SQLite persistence
│       └── config.ts            # env config
└── med-researcher/    # Next.js frontend
    └── src/
        ├── app/                 # / (landing), /app (search + history), /report/[id]
        ├── components/          # SearchBar, ReportView, DataChart, …
        └── lib/                 # api client, pdf export, provider metadata
```
