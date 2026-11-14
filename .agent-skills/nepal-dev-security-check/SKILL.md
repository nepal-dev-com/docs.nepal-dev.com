---
name: nepal-dev-security-check
description: "The security and privacy checks for a change in the Nepal Dev Verse docs repository: the per-change table for secrets and env vars, new pages, route handlers, third parties, input and logging; the full audits at gates and how findings are reported; tool-specific rules. Read before touching a secret, an env var, .env.example, a route handler, a third-party call, input handling, logging, or deciding whether something is public."
---

# nepal-dev-security-check

Part of this repository's working agreement (ADR-0045): as binding as `AGENTS.md`, which holds the rules every task needs. The text below is the depth of the sections named in each heading; a `§N` in it is a section of `AGENTS.md`. Links are relative to this file.

## First

- The owner decides every security, privacy and public-or-private question. Ask; never assume.
- `NEXT_PUBLIC_` publishes to the world. No secret is ever a string literal.
- Findings go to the owner, not into the maintainer documentation, until they are fixed.
- Never send private content to a third party without an approved ADR.
- A new env var goes in `content/docs/maintainer-guide/security/secrets.mdx` and `.env.example`, name only.

## Per-change check and full audits (`AGENTS.md` §9)

### Per-change check — only the rows the change touches

| If the change… | Check |
|---|---|
| Introduces or reads a secret / env var | Not a literal in source · **`NEXT_PUBLIC_` publishes to the world** · added to `content/docs/maintainer-guide/security/secrets.mdx` **and** `.env.example` |
| Adds a page to `content/` | Belongs to a public package or project (§6.1) · has a `description` · no secret, token, internal hostname, client name or personal data in text, examples or screenshots |
| Adds a route handler or endpoint | Says what it exposes, to whom · documented in `content/docs/maintainer-guide/api/` · private content excluded or authorization enforced server-side |
| Sends anything to a third party (search, analytics, hosting) | Exactly what is sent, minimised · recorded as a DFD boundary crossing · never private content without an approved ADR |
| Accepts input (search queries, URLs, MDX components that take props) | Validated · output encoded · no user-controlled HTML |
| Adds logging or error handling | **No secrets, tokens or personal data** in logs or client responses |

### Full audits at gates

The audits in [`content/docs/maintainer-guide/security/checklist.mdx`](../../content/docs/maintainer-guide/security/checklist.mdx) run **before the first
internet-reachable deployment** and **before each release** of the site. Findings are reported
as: what it is · where it is · how it would be exploited · the fix. Fix data exposure and
unauthorized access first, abuse and logic flaws second. **Findings go to the owner, not into
the maintainer documentation**, until they are fixed: those pages are published (ADR-0002).

## Tool-specific rules (`AGENTS.md` §9)

### Tool-specific rules

Algolia, Vercel Analytics and Google Analytics (ADR-0041) and Vercel hosting (ADR-0042) are adopted; their checks are in
[`content/docs/maintainer-guide/security/checklist.mdx`](../../content/docs/maintainer-guide/security/checklist.mdx#tool-specific-checks). **The ADR that
adopts a host, analytics, CI or an authentication provider adds its own checks** there.
