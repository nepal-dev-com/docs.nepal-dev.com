---
title: "Secrets inventory"
---

- **Status:** Current
- **Last updated:** 2026-10-31
- **Related ADRs:** ADR-0005

> Snapshot of the system as it stands today. Edit in place; never record what changed.

## Inventory

The variables are read directly where they are used. Locally they live in `.env.local`, which
`.gitignore` excludes (`.env*.local`). There is no `.env.example` yet (ADR-0005 implementation
notes).

| Variable | What it is | Secret? | Reaches the browser? | Read by | Rotation |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | Algolia application ID | No | **Yes**, inlined into the client bundle | `src/components/search.tsx`, `scripts/sync-content.ts` | With the Algolia application |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | Algolia search-only API key | No — public by design, but it can read **every record** in the index | **Yes**, inlined into the client bundle | `src/components/search.tsx` | On suspicion of abuse, in the Algolia dashboard |
| `ALGOLIA_WRITE_KEY` | Algolia key with write access to the index | **Yes** | No | `scripts/sync-content.ts` only | On suspicion, or yearly, in the Algolia dashboard |

## Rules

- **No secret is ever a string literal** — not in source, config, comments, tests or docs.
- **`NEXT_PUBLIC_*` publishes a value to every browser.** Never a secret; each one is reviewed
  as a publication. `ALGOLIA_WRITE_KEY` must never gain the prefix.
- **`.env*` files stay out of git.** `.env.example` documents every variable with a
  placeholder, never a value.
- **A build that publishes refuses to run without the secrets it needs**, naming the variable
  and never printing its value.
- **If a secret is ever committed, rotate it immediately.** Removing it from the tree or from
  history is not enough.
