# Design sources and licensing

The visual source for Seva Saathi is **UX4G** (User Experience for Government), the design system published by the National e-Governance Division (NeGD) under the Ministry of Electronics and Information Technology for the Digital India programme. The accessibility and page-structure rules those components are built to meet are the **Guidelines for Indian Government Websites and apps (GIGW)**.

**Access date: 27 October 2026.**

Seva Saathi is an **unofficial** guide. It is not a Government of India website.

## UX4G

| Resource | URL | What we used |
| --- | --- | --- |
| Design system | https://ux4g.gov.in | Colour, type, buttons, cards, navbar, search, alerts, breadcrumbs, forms, and the life-event stepper |
| Component docs | https://doc.ux4g.gov.in | Published primary blue `#0d6efd`, the grey scale, success `#198754`, danger `#dc3545`, warning `#ffc107`, radius `0.375rem`, and the focus treatment |
| Colour page | https://doc.ux4g.gov.in/utilities/colors.php | `$primary: $blue` (`#0d6efd`) |
| NeGD project page | https://negd.gov.in/our_projects/ux4g/ | Confirms UX4G is the government design system |

The public docs still describe the Bootstrap-style release. We read those published values and re-implemented them in our own React and Tailwind. We do **not** ship the UX4G CSS/JS bundle beside Tailwind.

The official GitHub repository ([ux4g/ux4g-design-system-v1](https://github.com/ux4g/ux4g-design-system-v1)) has no `LICENSE` file. Its README says the code and documentation are copyright 2023 and that the docs are released under Creative Commons. Because that package licence is not stated as a grant we can rely on, this repo does not copy the compiled UX4G CSS or JavaScript. Colours and component shapes are re-implemented here and credited to UX4G.

## GIGW

| Resource | URL | What we followed |
| --- | --- | --- |
| Introduction | https://guidelines.india.gov.in/introduction/ | GIGW is the government website rulebook |
| Quick tips | https://guidelines.india.gov.in/quick-tips/ | One clear heading structure, a skip link, keyboard use, contrast, and plain language |

GIGW also tells a **central government** site to display the State Emblem of India so visitors can see that the site is official. That rule does not apply to Seva Saathi, and the State Emblem of India (Prohibition of Improper Use) Act, 2005 restricts the emblem. This site does not use:

- the State Emblem of India
- a line that says the site belongs to a ministry
- Digital India, MeitY, or department logos

The header and footer say the site is unofficial and link to [india.gov.in](https://www.india.gov.in/).

## What the interface uses

| Pattern | Approach |
| --- | --- |
| Colour, type, radius, focus | Re-implemented from the published UX4G tokens in `src/app/globals.css` and `src/styles/design-tokens.css` |
| Header, search, buttons, cards | Re-implemented in React (`SiteHeader`, `SiteSearch`, `Button`, `ServiceCard`) |
| Warning alert | Unofficial banner uses the UX4G warning colours (`#fff3cd` / `#664d03`) |
| Breadcrumbs and skip link | `Breadcrumbs`, layout skip link |
| Life-event stepper | `JourneyStepTracker`, using primary and success colours |
| Question box and directory | Home page: plain-language question, most-used services, topic groups, life events |
| Typography for Indic scripts | [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans) via `next/font/google` (SIL Open Font License 1.1). UX4G’s font stack includes Noto Sans. |
| Icons | Lucide (ISC licence) |

## India government content

Directory URLs, short summaries, and journey text remain third-party government material (not Apache-2.0). See [NOTICE](../NOTICE) and [README](../README.md).
