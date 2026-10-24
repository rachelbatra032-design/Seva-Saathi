# Seva Saathi (unofficial)

Repository: [github.com/rachel-batra/seva-saathi](https://github.com/rachel-batra/seva-saathi)

**Seva Saathi** is an **unofficial**, independent guide to Indian government services. It is **not** affiliated with, endorsed by, or operated by the Government of India or any state government. There are **no government emblems or logos** in this app.

The official national directory is [india.gov.in](https://www.india.gov.in/). Seva Saathi adds plain-language pointers, cross-agency **life-event plans**, and a **citation-grounded** assistant inspired by editorial government portals (see [docs/DESIGN-SOURCES.md](docs/DESIGN-SOURCES.md)).

![Home — ask-first hero](docs/media/seva-home.png)

| Screenshot | Description |
| --- | --- |
| [Home](docs/media/seva-home.png) | Editorial hero with a large question box and quick services |
| [Life-event journey](docs/media/seva-journey.png) | Name-change guide with step tracker |
| [Ask with citations](docs/media/seva-ask.png) | Grounded answer with official source links |

## Quick start

```bash
git clone https://github.com/rachel-batra/seva-saathi.git
cd seva-saathi
npm install
npm run dev        # http://localhost:4821
npm test
npm run build      # uses .next-ci (does not overwrite dev .next)
```

Copy [.env.example](.env.example) to `.env.local` for optional Sarvam, LLM, and Postgres settings. **Never commit secrets.**

## What you get

| Area | Route | Summary |
| --- | --- | --- |
| Ask | `/ask` | Question box, citations, refusals, optional voice (Sarvam) |
| Life events | `/journeys` | Multi-agency plans with checklists |
| Directory | `/services` | Central and state portals |
| Topics | `/topics` | Browse by theme |
| Updates | `/updates` | PIB headlines (cached) |

Optional Postgres + ingestion: see **Backend architecture** below.

## Licence and data

- **Code:** [Apache-2.0](LICENSE) — see [NOTICE](NOTICE).
- **Government listings and summaries:** not Apache-licensed; each official site’s terms apply.
- **Design:** patterns informed by America.gov / USWDS; implementation is our own — [docs/DESIGN-SOURCES.md](docs/DESIGN-SOURCES.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Report wrong links via the GitHub issue template.

## Security

See [SECURITY.md](SECURITY.md).

## Backend architecture (v1)

| Layer | Role |
| --- | --- |
| **Next.js route handlers** | `/api/ask`, `/api/chat`, `/api/voice/*`, `/api/journeys/[slug]`, `/api/actions/*` |
| **Postgres (optional)** | Drizzle schema: services, journeys, sources, chunks, link_checks, feedback |
| **Ingest worker** | `npm run ingest` — polite fetch, robots.txt for `INGEST_URLS`, mock embeddings without keys |
| **Retrieval** | File BM25 + optional pgvector cosine search |
| **LLM** | Pluggable OpenAI-compatible composer; mock matcher when no key |
| **Actions** | Stage 1 prefill/deep links; stages 2–3 roadmap stubs (DigiLocker / API Setu) |

```bash
npm run db:up
export DATABASE_URL=postgresql://seva:seva_local@127.0.0.1:5433/seva_saathi
npm run db:migrate && npm run db:seed && npm run ingest
```

E2E tests use port **4822** and `.next-e2e` so dev on **4821** is untouched.

### Evaluations

```bash
npm test
npm run test:eval
npm run test:eval-db   # requires DATABASE_URL
npm run test:e2e
```

## Sarvam voice

With `SARVAM_API_KEY`, audio is processed server-side and **not stored** by Seva Saathi. Configure retention in your Sarvam account before production.

## Roadmap

[ROADMAP.md](ROADMAP.md)
