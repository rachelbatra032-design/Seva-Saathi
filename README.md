# Seva Saathi (unofficial)

**Seva Saathi** is an **unofficial**, independent project. It is **not** affiliated with, endorsed by, or operated by the Government of India or any state government. There are no government emblems or logos in this app.

The official national directory is the [National Portal of India](https://www.india.gov.in/). Seva Saathi adds plain-language pointers, cross-agency life-event plans, and a citation-grounded assistant.

## Licence

- **Source code** in this repository is licensed under the [Apache License 2.0](LICENSE). See also [NOTICE](NOTICE).
- **Data** (service URLs, paraphrased summaries, journey text) is **not** covered by that licence. It remains subject to each government or agency site's terms and copyright. We link to official pages rather than republishing their text.

## What is in this slice

| Area | What it does |
| --- | --- |
| **Ask Seva Saathi** (`/ask`) | One question box: describe your situation and get an ordered plan with official links, citations, and a tickable checklist. Refuses when the corpus does not support an answer. Voice and Indian languages via Sarvam when configured. |
| **Life-event guides** (`/journeys`) | Multi-agency plans (marriage name change, lost ID, interstate move, new baby, first job, bereavement). Per-step progress, documents, and official links. |
| **Services directory** (`/services`) | Central and state portals with search and filters. |
| **Topic hubs** (`/topics`) | Browse by theme. |
| **Updates** (`/updates`) | PIB RSS headlines with caching and fallbacks. |

## Run locally

```bash
npm install
npm run dev        # http://localhost:4821
npm test
npm run build
npm run data:refresh   # link check + generated snapshots
```

Copy `.env.example` to `.env.local` for optional keys. **Never commit secrets.**

**Without `DATABASE_URL`:** the app serves directory, journeys, and the assistant from reviewed files in `src/data/` (default for CI and quick dev).

**With Postgres:** hybrid retrieval can use ingested chunks (PIB RSS first). Works with local Docker Compose or hosted Neon/Supabase.

```bash
npm run db:up          # Docker: Postgres + pgvector on localhost:5433
export DATABASE_URL=postgresql://seva:seva_local@127.0.0.1:5433/seva_saathi
npm run db:migrate
npm run db:seed        # load services/journeys/link checks from TS + JSON
npm run ingest         # polite PIB RSS ingest → chunks + mock embeddings
```

E2E tests use port **4822** so the preview dev server can stay on **4821**.

## Backend architecture (v1)

| Layer | Role |
| --- | --- |
| **Next.js route handlers** | `/api/ask`, `/api/chat`, `/api/voice/*`, `/api/journeys/[slug]`, `/api/actions/*` |
| **Postgres (optional)** | Drizzle schema: services, journeys, sources, chunks, link_checks, feedback |
| **Ingest worker** | `npm run ingest` — rate-limited fetch, short summaries only, content hashes |
| **Retrieval** | File BM25 planner + optional DB chunk similarity when `DATABASE_URL` is set |
| **LLM** | Pluggable OpenAI-compatible composer; **mock matcher** when no key |
| **Actions** | Stage 1 prefill/deep links; stages 2–3 **roadmap stubs** (DigiLocker / API Setu consent mocks only) |

### API summary

- `POST /api/ask` — grounded answer schema `{ answer, citations, confidence, refused }`
- `POST /api/chat` — same assistant with translation (Sarvam or demo)
- `POST /api/voice/transcribe|translate|speak` — Sarvam proxies; audio not stored
- `POST /api/actions/consent` — mock consent grant (roadmap)
- `POST /api/actions/prefill` — journey prefill + official deep links (no submission)

### Evaluations

```bash
npm test              # unit + routing + Sarvam client mocks
npm run test:eval     # evals/ask-eval.json regression set
npm run test:e2e      # Playwright on :4822
```

## How this differs from a general AI chatbot

- Answers are built from a **curated corpus** (our directory, journeys, and short official snippets), with **citations** and **refusals** when unsupported.
- **Life events** are modeled as ordered, cross-ministry plans—not isolated FAQ answers.
- **Checklists and copy-ready summaries** stay in your browser; we do not submit forms to government systems.
- **Voice and translation** use Sarvam on the server when configured; demo mode is clearly labelled.

## Sarvam voice and retention

With `SARVAM_API_KEY`, audio is sent to Sarvam for STT/TTS/translate and is **not stored by Seva Saathi**. Sarvam's own retention policies apply to their API—configure retention in your Sarvam account and sign a DPA before production use. See [Sarvam data retention docs](https://docs.sarvam.ai/api/platform/data-retention.md).

## Roadmap

See [ROADMAP.md](ROADMAP.md). Contributing: [CONTRIBUTING.md](CONTRIBUTING.md).
