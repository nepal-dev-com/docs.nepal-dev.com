---
title: "App flow — <feature>"
---

- **Status:** Draft
- **Last updated:** YYYY-MM-DD
- **Related ADRs:** ADR-NNNN

> Snapshot of the system as it stands today. Edit in place; never record what changed.

What a person sees and how they move through it. Sample values are invented (ADR-0008).
Phone width first; note where desktop differs.

## Entry points

- Where a person reaches it from (home page, sidebar, search, a package badge or README link,
  a direct URL, the Markdown version), and what access it needs.
- Who does not see it, and what they get at its URL.

## Flow

```mermaid
flowchart LR
  A[Screen A] -->|action| B[Screen B]
  B -->|back| A
  B -->|search| S[Search dialog]
```

## Screens

### 1. `<Screen name>` — `/route`

```mermaid
block-beta
  columns 4
  menu["☰"] title["Site name"]:2 search["⌕"]
  crumb["Packages › npm › example-pkg"]:4
  h1["example-pkg"]:3 version["v1.2.0 ▾"]
  block:body:4
    columns 4
    install["npm install example-pkg"]:4
    para["Short description of what it does."]:4
  end
  nav["‹ Previous · Next ›"]:4
```

**States**

- Empty: …
- Loading: …
- Not found: …
- Refused (private, no access): …
- Error: …
- Degraded (an external service such as search is unavailable): …
- Success: …
