# India.Gov

An **unofficial** citizen portal that gathers India's many government websites into one place, in the spirit of an editorial hub like america.gov. It is not run by, or affiliated with, the Government of India. Every page says so, and every action sends you to the official site.

The government's own directory is the [National Portal of India](https://www.india.gov.in/). India.Gov adds a plain-language directory, life-event plans that span agencies, and an assistant that answers only from official sources.

## What is in this slice

| Area | What it does |
| --- | --- |
| **Ask India.Gov** (`/ask`) | Conversational box. Describe a situation ("I just got married, how do I change my name?") and get an ordered, cited plan, a tickable checklist, and official links. Refuses instead of guessing. Text, voice and Indian languages. |
| **Life-event guides** (`/journeys`) | Structured multi-agency plans: *Name change after marriage*, *I lost my Aadhaar or PAN*, *Move to another state*. Steps, dependencies, documents, official link per step, time and fee (clearly marked verified or not). |
| **Do-it-for-you layers** | (a) guided steps, (b) document checklist plus copy-ready form-fill summary, (c) official links per step, (d) a clearly labelled **roadmap stub** for delegated actions with explicit consent via DigiLocker / API Setu. Nothing is ever submitted to a government system. |
| **Services directory** (`/services`) | 77 central services and 28 state/UT portals with plain-language summaries, category, level, state, ministry, languages and the official URL. Client-side search plus category, central/state and state filters (synced to the URL). |
| **Service detail** (`/services/[slug]`) | What it is, who it is for, how to apply, documents commonly needed, and a prominent link to the official site with its link-check status. |
| **Topic hubs** (`/topics`) | One page per category. |
| **Latest updates** (`/updates`, home) | Server-side fetch of the PIB RSS feed, cached 15 minutes, with loading, empty and error states and source labels. |
| **Languages** | UI-language selector for 22 Indian languages plus English. Chrome is translated for English and Hindi; answers are translated through Sarvam when configured. |

## Run it locally

Requirements: Node 20+ (tested on Node 22) and npm.

```bash
npm install
npm run dev        # http://localhost:4821
```

Other scripts:

```bash
npm run build && npm start   # production build, served on :4821
npm test                     # data integrity, assistant routing/grounding, Sarvam client against a fake server
npm run typecheck
npm run lint
npm run data:refresh         # re-check every official link and re-snapshot page titles (writes src/data/generated/)
```

Stack: Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, shadcn/ui (Base UI). No database.

## Configuration

Copy `.env.example` to `.env.local`. Nothing is required to run the app.

| Variable | Purpose |
| --- | --- |
| `SARVAM_API_KEY` | Enables real voice input, translation and read-aloud via [Sarvam AI](https://docs.sarvam.ai). Server-side only; never sent to the browser and never committed. |
| `SARVAM_STT_MODEL`, `SARVAM_TRANSLATE_MODEL`, `SARVAM_TTS_MODEL`, `SARVAM_TTS_SPEAKER`, `SARVAM_BASE_URL` | Optional overrides. Defaults: `saaras:v4`, `sarvam-translate:v1`, `bulbul:v3`, `shubh`. |
| `ASSISTANT_PROVIDER` | `mock` (default, deterministic, no LLM) or `openai-compatible`. |
| `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL` | Used when `ASSISTANT_PROVIDER=openai-compatible`. Any OpenAI-style `/chat/completions` endpoint. |
| `FEED_USER_AGENT` | Optional. PIB's CDN rejects non-browser user agents, so a browser-like default is used. |

### Voice and Indian languages with Sarvam AI

1. Create an API key in the [Sarvam dashboard](https://dashboard.sarvam.ai) and put it in `.env.local` as `SARVAM_API_KEY=...`, then restart the server.
2. On `/ask`, press the mic, speak, press again to stop. Flow, all server-side:
   1. Audio (WebM from the browser) goes to `POST /api/voice/transcribe`, which calls Sarvam speech-to-text with `language_code=unknown` for **automatic language detection**.
   2. The transcript is sent to `POST /api/chat`. If it is not English it is translated to English with **Sarvam Translate** (`sarvam-translate:v1`, which covers 22 Indian languages).
   3. The assistant answers from the curated corpus, and the answer is translated back into the language chosen in the selector.
   4. **Read aloud** calls `POST /api/voice/speak`, which uses Sarvam **Bulbul** TTS and plays the returned WAV. Bulbul currently covers 11 languages (English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia); other languages get a clear "not available yet" message.
3. Without a key: text chat works as normal. The mic opens a **"Voice needs configuration"** panel with a **demo mode** (clearly labelled, simulated). Demo mode returns a canned spoken question, a keyword-glossary translation for a few Hindi phrases, pre-translated Hindi sentences for the fixed parts of one answer, and uses the browser's speech synthesis for read-aloud. No audio leaves the device.

Notes on Sarvam models: the current Sarvam docs list `saaras:v3`/`saaras:v4` for speech-to-text (the successor to Saarika), so the default is `saaras:v4`; change it with `SARVAM_STT_MODEL`. The server rate-limits voice and chat endpoints per IP (best effort, in-memory) to protect the key.

### Pluggable answer provider

The assistant is split into **retrieve, then compose**:

1. **Retrieval** (`src/lib/assistant/corpus.ts`, `planner.ts`): BM25 over our own corpus, which is the services directory, every journey and step, and page titles, descriptions and headings fetched from official sites (`src/data/generated/official-snippets.json`). The planner decides *journey*, *services*, *weak match* or *refuse* (no match, out of scope, or a request about someone's personal record).
2. **Composition** (`src/lib/assistant/*-provider.ts`): the default **mock provider** assembles text only from curated data, so it cannot invent anything. With `ASSISTANT_PROVIDER=openai-compatible` an LLM writes the answer from the retrieved passages only.
3. **Guardrails** (`answer.ts`): refusals never reach the LLM. An LLM answer must report `supported: true`, cite passage numbers that exist, and include `[n]` markers; otherwise it falls back to the mock provider. Citations are rebuilt from the passages' own URLs and any non-official URL is dropped.

## Data and link verification

Data lives in `src/data/`: `categories.ts`, `states.ts`, `services-central.ts`, `services-states.ts`, `journeys.ts`.

- Every URL must be on a government domain (`gov.in`, `nic.in`, ...) or a short named list of official agency domains (`src/lib/official-hosts.ts`). `npm test` fails on anything else.
- `npm run data:refresh` requests every link and records `ok`, `blocked` (the site refuses bots) or `unreachable`, plus page title and description snapshots. Many Indian government sites restrict access from outside India or ship incomplete certificate chains, so **a number of links could not be reached from the network this was built on**. They are the addresses the departments publish and are labelled "not reachable from our checker" in the UI; re-run the script from an Indian network or CI runner to confirm them.
- Fees and processing times in journeys are marked **Unverified** unless confirmed against an official page we could read. Most government portals are single-page apps that cannot be read by a script, so almost all are currently unverified and say "check the official site".
- Links are portal-level addresses plus the menu path in the step text. Exact per-step deep links are not claimed because they could not be verified.

## How India.Gov differs from a general AI chatbot

- **Official sources only, with citations and refusals.** Answers come from a curated corpus of government sources. Each answer lists its links, a non-official link cannot be cited, and when the corpus does not support an answer the assistant says so and points to the National Portal rather than improvising. A general chatbot will happily answer from the open web, including outdated or scam sites.
- **Cross-agency orchestration of life events.** A marriage touches the registrar, UIDAI, the Income Tax Department, Passport Seva, EPFO, the RTO, the bank and the Election Commission. India.Gov models those as one dependency-ordered plan, rather than answering each question in isolation.
- **Action-oriented checklists, prefill and handoff.** You get a persistent checklist, a document list per step, a copy-ready form-fill summary built from details that stay in your browser, and the official link for each step. It prepares you to act; it does not pretend to file for you.
- **Multilingual voice for India.** Speak or type in any of 22 languages Sarvam supports, get answers back in your language, and have them read aloud where Bulbul supports the language.

## Roadmap

- **More states and UTs**: full state directories (e-District, grievance, transport, land records) and state-specific variants of each journey step (marriage registration, ration card, RTO).
- **More feeds**: ministry notifications, state gazettes, scheme alerts and deadlines; dated items; per-topic filtering.
- **More life events**: birth of a child, death of a family member, starting a business, retirement, losing a passport or driving licence.
- **i18n**: translated UI chrome for all supported languages (today English and Hindi), static translations of journey steps reviewed by humans, right-to-left layout for Urdu, Sindhi and Kashmiri.
- **Link health checks**: run `data:refresh` on a schedule from an Indian network, open an issue on regressions, verify exact deep links, and confirm fees and timings against official pages.
- **Delegated actions (stub today)**: explicit, revocable consent through DigiLocker and API Setu, scoped to one step, with an audit trail. Depends on departments offering official APIs.
- **Assistant quality**: evaluation set of real citizen questions, LLM provider evaluation behind the existing grounding checks, snapshots of more official page text.
