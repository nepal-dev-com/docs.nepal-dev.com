---
title: "API — Machine-readable content routes"
---

- **Status:** Current
- **Last updated:** 2026-10-31
- **Related ADRs:** none yet — scaffold routes

> Snapshot of the system as it stands today. Edit in place; never record what changed.

All of these are generated at build time (`revalidate = false`), need no authentication, and
return **every page in `content/docs/`**. None filters anything out.

## Endpoints

| Method | Path | Purpose | Auth |
|---|---|---|---|
| GET | `/docs/<slug>.md` | One page as Markdown (rewritten by `src/proxy.ts`) | None |
| GET | `/docs/<slug>` with `Accept` preferring Markdown | One page as Markdown (rewritten by `src/proxy.ts`) | None |
| GET | `/llms.mdx/docs/<slug>/content.md` | One page as Markdown | None |
| GET | `/llms.txt` | Index of every page | None |
| GET | `/llms-full.txt` | Every page's Markdown, concatenated | None |
| GET | `/og/docs/<slug>/image.png` | Open Graph image for a page | None |
| GET | `/static.json` | Every page as an Algolia search record | None |

---

### `GET /llms.mdx/docs/<slug>/content.md`

**Purpose.** The processed Markdown of one page, headed `# <title> (<url>)`.

**Authorisation.** Public. Nothing keeps private content out — see `AGENTS.md` §6.1.

**Responses**

| Status | Meaning | Body |
|---|---|---|
| 200 | Page found | Markdown, `Content-Type: text/markdown` |
| 404 | No such page | Next.js not-found page |

**Notes.** `/docs/<slug>.md`, and `/docs/<slug>` when the request prefers Markdown, are
rewritten here by `src/proxy.ts`; the second adds `Vary: Accept`.

---

### `GET /llms.txt` and `GET /llms-full.txt`

**Purpose.** `llms.txt` lists every page; `llms-full.txt` returns all of their Markdown in one
response. Both come from `docsLlms` in `src/lib/source.ts`.

**Authorisation.** Public.

**Responses**

| Status | Meaning | Body |
|---|---|---|
| 200 | Always | Plain text |

---

### `GET /og/docs/<slug>/image.png`

**Purpose.** A generated Open Graph image showing the page's title, description and the site
name (`appName`).

**Authorisation.** Public.

**Responses**

| Status | Meaning | Body |
|---|---|---|
| 200 | Page found | PNG |
| 404 | No such page | Next.js not-found page |

---

### `GET /static.json`

**Purpose.** Every page as an Algolia `DocumentRecord`, from `toDocuments(source)`. The
build reads this route's output and pushes it to the index (`scripts/sync-content.ts`).

**Authorisation.** Public — it is served by the deployed site as well as read by the build.

**Responses**

| Status | Meaning | Body |
|---|---|---|
| 200 | Always | JSON array of records |
