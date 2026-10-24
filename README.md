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

Copy `.env.example` to `.env.local` for optional `SARVAM_API_KEY` and LLM settings. **Never commit secrets.**

## How this differs from a general AI chatbot

- Answers are built from a **curated corpus** (our directory, journeys, and short official snippets), with **citations** and **refusals** when unsupported.
- **Life events** are modeled as ordered, cross-ministry plans—not isolated FAQ answers.
- **Checklists and copy-ready summaries** stay in your browser; we do not submit forms to government systems.
- **Voice and translation** use Sarvam on the server when configured; demo mode is clearly labelled.

## Sarvam voice and retention

With `SARVAM_API_KEY`, audio is sent to Sarvam for STT/TTS/translate and is **not stored by Seva Saathi**. Sarvam's own retention policies apply to their API—configure retention in your Sarvam account and sign a DPA before production use. See [Sarvam data retention docs](https://docs.sarvam.ai/api/platform/data-retention.md).

## Roadmap

See [ROADMAP.md](ROADMAP.md). Contributing: [CONTRIBUTING.md](CONTRIBUTING.md).
