---
title: "ADR-0005 — Security and privacy are a standing practice"
---

- **Status:** Proposed
- **Date:** 2026-10-31
- **Deciders:** Puncoz Nepal
- **Approved by:** —
- **Approved on:** —
- **Supersedes:** —
- **Superseded by:** —
- **Design documents:** `AGENTS.md` §9, `content/docs/documentation/security/index.md`, `threat-model.md`,
  `data-classification.md`, `secrets.md`, `checklist.md`, `content/docs/documentation/_templates/security.md`

## Context

The site documents public packages and will also document **private projects**. Today every
page in `content/docs/` is published on several surfaces at once: the rendered page, its
Markdown version, `llms.txt` / `llms-full.txt`, the `static.json` record list, an Open Graph
image, and the Algolia index, which anyone holding the public search-only key can read in full.
A private page placed there is public the moment the site is built.

The build also holds a write key to the search index, and documentation examples are a natural
place for a real token or internal hostname to slip in.

Security added before launch, as a one-off review, misses the decisions made along the way.

## Decision

1. **Security is a property of every change.** Every ADR has a mandatory *Security
   considerations* section. "None" is a valid answer; an omitted section is not.
2. **The owner decides security and privacy questions** — which projects are private, who may
   read them, what is sent to a third party, what an example may contain — and they are
   recorded (ADR-0004).
3. **A per-change checklist** (`AGENTS.md` §9) is run for the rows a change touches.
4. **Full audits** (`content/docs/documentation/security/checklist.md`) run before the first internet-reachable
   deployment and before each release.
5. **Living security documents** in `content/docs/documentation/security/`: threat model, data classification,
   secrets inventory, audit checklist, and per-feature analyses when warranted.
6. **Tool-specific rules arrive with the tool.** The ADR adopting a host, analytics, CI or an
   authentication provider adds its checks to `checklist.md`.
7. **Principles that hold regardless of stack**: no secret literals; anything in the browser or
   the search index is public; authorization server-side; published is permanent; no secrets or
   personal data in logs or responses; generic client errors; a publishing build refuses to run
   without its secrets.

## Options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A — Standing practice, per-change checks, gated audits | Decisions are made deliberately when they are cheapest | Overhead on each ADR | Chosen |
| B — Pre-launch security review only | Less overhead | Misses design-time decisions; a published private page cannot be recalled | Rejected |

## Consequences

**Positive**

- How private documentation is kept and served is designed in, not patched on.

**Negative / accepted trade-offs**

- Every ADR is longer. Accepted.

## Content invariants

Directly supports §6.1 (private stays private) and §6.4 (examples carry no real credentials or
data).

## Security considerations

This ADR is the security policy. The data classification levels in
`content/docs/documentation/security/data-classification.md` are **proposed** with it and become binding on approval.

## Implementation notes

- [x] `content/docs/documentation/security/` files exist and describe the current surface.
- [x] `AGENTS.md` §9 holds the per-change checklist.
- [x] `content/docs/documentation/_templates/security.md` exists.
- [ ] Add `.env.example` with the three Algolia variables, placeholders only.
- Tests: not applicable (process only).

## Docs to update on implementation

- [ ] `content/docs/documentation/security/data-classification.md` — mark the levels approved.
- [ ] `content/docs/documentation/adr/index.md` — status.
