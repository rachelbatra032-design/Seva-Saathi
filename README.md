# Seva Saathi (unofficial)

**Open the site:** add the Vercel address here after the first deploy, for example `https://seva-saathi.vercel.app`. Until that address exists, the site runs on your own computer with the steps under Quick start.

Repository: [github.com/rachelbatra032-design/Seva-Saathi](https://github.com/rachelbatra032-design/Seva-Saathi)

**Seva Saathi** is an **unofficial**, independent guide to Indian government services. It is **not** affiliated with, endorsed by, or operated by the Government of India or any state government. There are **no government emblems or logos** in this app.

The official national directory is [india.gov.in](https://www.india.gov.in/).

![Home — ask-first hero](docs/media/seva-home.png)

| Screenshot | Description |
| --- | --- |
| [Home](docs/media/seva-home.png) | Question box, most-used services, and topic groups |
| [Life-event journey](docs/media/seva-journey.png) | Name-change guide with step tracker |
| [Ask with citations](docs/media/seva-ask.png) | Grounded answer with official source links |

## The problem

Indian government services sit on many different official websites. A passport, a name change after marriage, and a lost Aadhaar card each start on a different portal. A normal web search mixes ads, news, and unofficial pages with the real site, so people cannot tell where to go.

Seva Saathi exists so a person can start from one plain-language question and land on the right official website. The directory search used to keep a service when any word matched, including words that only started with the query. A short question then returned unrelated services, which recreated the same confusion inside this site. Search now keeps a result only when every meaningful word matches as a whole word or as a known synonym.

## How the site is built

One Next.js website. The service list and the life-event guides are files in this repository. The Ask box calls a small function in the same website. With no keys set, a built-in matcher answers from those files and must show official links.

```text
Browser  →  Seva Saathi pages and /api/ask
                →  files in the repo (and Postgres only if you set DATABASE_URL)
                →  official government website
```

Postgres, Sarvam voice, and an outside language model are optional. They are not required for someone to open the site. Real DigiLocker login stays off until a government programme approves it. See [ROADMAP.md](ROADMAP.md).

## Licence

The code in this repository is [Apache-2.0](LICENSE). Putting that file here is how you allow other people to use the code. You do not apply to the Apache Software Foundation, and you do not wait for an approval.

[NOTICE](NOTICE) names Copyright 2026 Rachel Batra. Government listings, summaries, and journey text are **not** covered by Apache-2.0. Each official site keeps its own terms.

The interface follows [UX4G](https://ux4g.gov.in), the Government of India design system, and the accessibility practices in [GIGW](https://guidelines.india.gov.in/). Those patterns are re-implemented in this repo. The State Emblem and ministry logos are not used. Details are in [docs/DESIGN-SOURCES.md](docs/DESIGN-SOURCES.md).

## Host it so people need no install

Visitors should get one link. They do not clone the repository or run `npm install`.

**Vercel** is the host for this app.

1. Create a Vercel account with the GitHub login that owns `rachelbatra032-design/Seva-Saathi`.
2. Choose Add New → Project and import that repo.
3. Production branch: `main`. Framework: Next.js. Node.js: 22.
4. Install command: `npm ci`. Leave the build command as Vercel’s default `next build`. Do not set it to `npm run build`. That script writes the build into `.next-ci` for local checks, and Vercel looks for `.next`.
5. Leave environment variables empty for the first release. The file-based site and the built-in Ask matcher work without them.
6. Deploy. Open the address Vercel shows and try the question box and a search for “passport”.
7. On GitHub, open the repo, click the gear beside About, and paste that address into Website. Put the same address at the top of this README as “Open the site”.

A custom domain can be attached later under Vercel → Settings → Domains.

Each merge to `main` publishes a new version on the same link. If a deploy looks wrong, open the Vercel project → Deployments and promote the previous successful deployment.

Render and Railway can run the same app if you want the optional database on the same bill later. Their start command must listen on the `PORT` they assign. Today `npm start` listens on port **4821**, so that command has to change before those hosts will work. GitHub Pages only stores fixed files, so it cannot run the Ask box.

### After hackathon acceptance (Muse)

When you have a Meta Model API key, set these in Vercel and redeploy:

```bash
ASSISTANT_PROVIDER=openai-compatible
LLM_API_KEY=...
LLM_BASE_URL=...   # the Meta base URL that serves /chat/completions
LLM_MODEL=...      # Muse Spark or Muse Wonder, from the hackathon docs
```

The composer in `src/lib/assistant/llm-provider.ts` calls that OpenAI-style endpoint. It may use only the official passages already retrieved. If the model’s answer is not grounded, the site falls back to the built-in matcher or refuses. Do not put the key in the repository.

## Quick start

```bash
git clone https://github.com/rachelbatra032-design/Seva-Saathi.git
cd Seva-Saathi
npm install
npm run dev        # http://localhost:4821
npm test
npm run build      # uses .next-ci (does not overwrite dev .next)
```

Copy [.env.example](.env.example) to `.env.local` for optional Sarvam, Muse or other model, and Postgres settings. **Never commit secrets.**

## What you get

| Area | Route | Summary |
| --- | --- | --- |
| Ask | `/ask` | Question box, citations, refusals, optional voice (Sarvam) |
| Life events | `/journeys` | Multi-agency plans with checklists |
| Directory | `/services` | Central and state portals |
| Topics | `/topics` | Browse by theme |
| Updates | `/updates` | PIB headlines (cached) |

## Optional Postgres

| Layer | Role |
| --- | --- |
| **Next.js route handlers** | `/api/ask`, `/api/chat`, `/api/voice/*`, `/api/journeys/[slug]`, `/api/actions/*` |
| **Postgres (optional)** | Drizzle schema: services, journeys, sources, chunks, link_checks, feedback |
| **Ingest worker** | `npm run ingest` — polite fetch, robots.txt for `INGEST_URLS`, mock embeddings without keys |
| **Retrieval** | File search + optional pgvector cosine search |
| **LLM** | OpenAI-compatible composer, including Meta Model API when configured; mock matcher when no key |
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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Report wrong links via the GitHub issue template.

## Security

See [SECURITY.md](SECURITY.md).

## Roadmap

[ROADMAP.md](ROADMAP.md)
