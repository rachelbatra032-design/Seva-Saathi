# Contributing to Seva Saathi

Thank you for helping improve this **unofficial** guide. We do not accept changes that imply government affiliation, use official emblems, or copy large blocks of government text.

## Setup

```bash
npm install
npm run dev
npm test
```

## Data changes

- Official URLs must pass `src/lib/official-hosts.ts` checks.
- Run `npm run data:refresh` after URL changes (ideally from a network that can reach `.gov.in` sites).
- Mark fees and timelines **unverified** unless tied to an official page you cite.

## Pull requests

- One logical change per PR.
- Include test updates when behaviour changes.
- Do not commit `.env.local` or API keys (`npm run secret-scan` must pass).

## Code licence

Apache-2.0 for code in this repo. Government content you link to remains under its own terms.
