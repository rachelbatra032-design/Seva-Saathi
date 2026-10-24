# Design sources and licensing

This document records what we checked before borrowing layout patterns from [America.gov](https://www.america.gov/) and the [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/). **Access date for all URLs below: 24 October 2026.**

Seva Saathi is **not** a U.S. government site. We do not use U.S. government seals, agency logos, or America.gov branding.

## America.gov (GSA)

| Page | URL | What it says (summary) |
| --- | --- | --- |
| Terms of use | https://america.gov/terms (last updated 8 September 2026) | Operated by GSA. **Most content is U.S. government work in the public domain** and may be reused freely. **Exceptions:** third-party logos, trademarks, photographs, and **agency seals**; do not imply endorsement. |
| Privacy policy | https://www.america.gov/privacy-policy/ (last updated 20 October 2026) | Describes chat, attachments, voice, cookies/local storage, analytics, and vendors. Does not state a separate copyright policy beyond being a GSA service. |
| About | https://america.gov/about | Describes National Design Studio and GSA partnership; **does not name USWDS** as the implementation stack. |
| FAQ | https://america.gov/faq | Describes National Design Studio; **no USWDS mention**. |

**17 U.S.C. § 105:** U.S. federal works prepared by officers/employees in official duties are generally **not subject to domestic copyright** ([17 U.S.C. § 105](https://uscode.house.gov/us/usc/119-118/t17/s105/)). That does **not** cover third-party material on federal sites ([USA.gov guidance](https://www.usa.gov/government-copyright)).

**Is America.gov built on USWDS?** **Not confirmed from public pages we read.** America.gov is not listed in the USWDS [showcase](https://designsystem.digital.gov/documentation/showcase/) (checked 24 October 2026). Its marketing copy points to a **custom National Design Studio interface**. We therefore treat America.gov’s **page copy, imagery, animations, and branding** as **reference only** and **re-implement** patterns in our own React/Tailwind code.

**Fonts / images on America.gov:** We did not obtain a separate America.gov “copyright” or asset licence page beyond the terms above. Hero illustrations, agency badges, fingerprint animation, and social preview images (`america.gov/images/...`) are **not** copied into this repo.

## U.S. Web Design System (USWDS)

| Resource | URL | Licence (summary) |
| --- | --- | --- |
| USWDS repository | https://github.com/uswds/uswds (`LICENSE.md`, develop branch) | **GSA-authored software modifications: CC0 worldwide** + **public domain in the U.S.** Bundled fonts/icons have **separate licences** (SIL OFL 1.1 for Source Sans Pro, Merriweather, Public Sans; Apache 2.0 for Roboto Mono and Material-derived icons; MIT for normalize-derived files). **GSA trademarks are reserved.** |

We **do not** ship the full USWDS npm package or USWDS sprite assets in v1. We **re-implemented** spacing, focus, and layout patterns in Tailwind/CSS, informed by USWDS documentation. If we later import USWDS components or tokens directly, we will list them in [NOTICE](../NOTICE) and comply with bundled font/icon licences.

## Seva Saathi implementation choices

| Pattern | Approach |
| --- | --- |
| Editorial hero + large question field | **Re-implemented** (`HeroForms`, home hero); inspired by America.gov, our colours and copy |
| Topic hub cards, explainer columns | **Re-implemented** (`TopicHubCard`, home sections) |
| Header search + language switcher | **Re-implemented** (`SiteHeader`, `SiteSearch`, `LanguageSelect`) |
| Footer disclaimer + official source links | **Re-implemented** (`SiteFooter`) |
| Answer cards + visible citations | **Re-implemented** (`AskChat` / `AssistantMessage`) |
| Breadcrumbs, skip link, focus rings | **Re-implemented** (`Breadcrumbs`, layout skip link, `--focus-ring` tokens) |
| Typography for Indic scripts | **Direct use:** [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans) family via `next/font/google` (**SIL Open Font License 1.1**) |
| Icons | **Lucide** (ISC licence), not USWDS Material icons |

## India government content

Directory URLs, short summaries, and journey text remain **third-party government material** (not Apache-2.0). See [NOTICE](../NOTICE) and [README](../README.md).
