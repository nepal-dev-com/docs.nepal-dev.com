---
title: "ADR-0002 — Design documents are living snapshots, published as the Documentation project"
---

- **Status:** Proposed
- **Date:** 2026-10-31
- **Deciders:** Puncoz Nepal
- **Approved by:** —
- **Approved on:** —
- **Supersedes:** —
- **Superseded by:** —
- **Design documents:** `content/docs/documentation/index.md`, `content/docs/documentation/meta.json`,
  every directory `index.md`, `content/docs/documentation/_templates/`

## Context

This repository is a documentation site, so "documentation" means two different things here:

- **Package and project documentation**: the pages readers come for. It is the product.
- **Documentation about the site**: why it is built the way it is, and how it works.

The second kind serves two further jobs:

- **Decisions** need a permanent, ordered record of why.
- **Design documents** (flows, data flows, access rules, the threat model) must match the code
  at all times. A document that describes an old version is worse than none, because it is
  believed.

The owner decided on 2026-10-31 that the site's own documentation is published on the site,
as a Fumadocs project of its own named **Documentation**, rather than kept in a separate
`docs/` folder outside the content.

## Decision

1. **The site's own documentation is a Fumadocs root folder**, `content/docs/documentation/`,
   titled **Documentation**, published at `/docs/documentation` with its own sidebar tab
   (`meta.json`: `"root": true`).
2. **Three kinds of document:**
   - `content/docs/` outside `documentation/` — **package and project documentation**,
     written and updated within the approved content conventions and the invariants in
     `AGENTS.md` §6.
   - `content/docs/documentation/adr/` — **immutable once approved**; superseded, never
     rewritten.
   - Everything else under `content/docs/documentation/` — **living snapshots** of the site as
     it stands, edited in place. No revision tables, no "previously X, now Y", no
     strikethrough. What is no longer true is deleted. Git and ADRs hold the history.
3. **Typed directories**: `app-flow/`, `prd/`, `architecture/`, `erd/`, `dfd/`, `state/`,
   `sequence/`, `api/`, `rbac/`, `security/`, each with an `index.md` of its conventions, and
   `_templates/` with a starting point for each. Which ones a change requires is the table in
   `AGENTS.md` §8.
4. **Pages are Markdown (`.md`)** with a frontmatter `title` and no `#` heading; links between
   them are relative file paths.
5. **Diagrams are Mermaid** in fenced blocks: flows, sequences, state machines, ERDs and screen
   wireframes. No binary or externally hosted images. Rendering them as diagrams on the site is
   a separate decision (a new dependency).
6. **An implementation is not complete while a design document contradicts it.**
7. **Skill-generated specs and plans** go into these directories (usually the ADR and its
   design documents), not into a skill's own folder layout.

## Options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A — A published Documentation project in `content/docs/documentation/` | The site documents itself with its own tooling; one content tree; search, Markdown and `llms.txt` cover the design docs too | Design documents, including the threat model, are public | Chosen by the owner |
| B — A separate `docs/` folder outside the content | Internal notes stay off the site | Two folders called "docs"; the design docs get none of the site's features | Rejected by the owner |
| C — Changelog-style design docs | History visible inline | Readers must reconstruct the current state | Rejected |

## Consequences

**Positive**

- A reader finds the current system in the design docs, the reasons in ADRs, and the packages
  in the rest of the site — all in one place, searchable.

**Negative / accepted trade-offs**

- Everything here is public: the threat model, the audit checklist and the secrets inventory
  (variable names, never values). Accepted with this decision.
- Mermaid shows as code on the site until a renderer is adopted.

## Content invariants

§6.1 applies here as everywhere: nothing about a private project goes into these pages.

## Security considerations

These pages are published on every surface (`AGENTS.md` §6.1), so they must never hold a secret
value, a private project's details, or an unfixed vulnerability's exploit path. A finding that
is not yet fixed is reported to the owner, not written here, until it is fixed.
`content/docs/documentation/security/` follows the living-snapshot rule, so the threat model
and secrets inventory are kept accurate rather than historical.

## Implementation notes

- [x] `content/docs/documentation/` with `meta.json` (`"root": true`), `index.md` and each
      directory `index.md`.
- [x] `content/docs/documentation/_templates/` holds the templates.
- [x] `AGENTS.md` §8 states the three kinds, the page format and the "write before building"
      table.
- Tests: none — verified by `bunx next build` compiling every page.

## Docs to update on implementation

- [ ] `content/docs/documentation/adr/index.md` — status on approval.
