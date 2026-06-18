# MARS Frontend

The Next.js client for [MARS](../README.md). It collects a research topic, streams the report from the backend live, and renders it with charts, images, and cited sources.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS 4** with a glassmorphism design system
- **framer-motion** (motion), **Recharts** (charts), **react-markdown** + **remark-gfm** (report body)
- **jsPDF** for text-based PDF export (no DOM rasterization — produces selectable, lightweight PDFs)

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page with the parallel-search orbit animation |
| `/app` | Research entry point — search bar + recent-reports history |
| `/report/[id]` | Live report view; streams status + markdown over SSE, exports PDF |

## Run locally

```bash
npm install
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
npm run dev
```

`NEXT_PUBLIC_API_BASE_URL` must point at a running [backend](../researcher/README.md) (defaults to `http://localhost:8000`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Structure

```
src/
├── app/                 # routes (/, /app, /report/[id]) + layout + globals.css
├── components/          # SearchBar, RecentReports, ReportView, DataChart,
│                        # ImageGrid, SourceList, StatCard, StreamLoader, …
├── lib/                 # api.ts (client), pdf.ts (export), providers.ts (accent map)
└── types/               # shared report types (mirrors the backend)
```
