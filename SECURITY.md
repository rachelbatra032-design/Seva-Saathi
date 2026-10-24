# Security

## Reporting a vulnerability

If you believe you have found a security issue in Seva Saathi, please **do not** open a public GitHub issue with exploit details. Email the maintainer listed in [README.md](README.md) (or use GitHub private security advisories once the public repository is enabled).

## Scope

This project is an **unofficial** information aggregator. It does **not** store government credentials, Aadhaar numbers, or application statuses on the server in v1.

## Secrets

- Never commit API keys (`SARVAM_API_KEY`, `LLM_API_KEY`, `DATABASE_URL`, etc.). Use `.env.local` (gitignored).
- Run `npm run secret-scan` before pushing.

## Dependencies

Keep dependencies updated (`npm audit`, CI). Production deployments should use platform secret stores, HTTPS, and rate limits already implemented in API routes.
