---
title: "ADR-0001 — Every change starts with an approved ADR"
---

- **Status:** Proposed
- **Date:** 2026-10-31
- **Deciders:** Puncoz Nepal
- **Approved by:** —
- **Approved on:** —
- **Supersedes:** —
- **Superseded by:** —
- **Design documents:** `AGENTS.md` §2–§3, `content/docs/documentation/adr/index.md`, `content/docs/documentation/_templates/adr.md`

## Context

puncoz-packages-docs is greenfield: a Fumadocs scaffold that will document every package,
library and project its owner builds — npm, Composer and other ecosystems, public and private
projects. The owner builds it change by change, largely with AI agents.

Two forces make an explicit gate necessary:

- **The expensive mistakes are structural and early.** How content is laid out per ecosystem
  and package, how versions are handled, and how private project documentation is kept off the
  public site are cheap to get right on paper and expensive to change once many pages and
  inbound links depend on them. A private page that was published cannot be unpublished.
- **Agents produce plausible work fast.** Without a gate, a decision is made implicitly in code
  and found late.

## Decision

1. **Every feature and functional change starts with an ADR** in `content/docs/documentation/adr/`, written from
   `content/docs/documentation/_templates/adr.md`, with `Status: Proposed` and an index row in `content/docs/documentation/adr/index.md`.
2. **No application code is written until the owner explicitly approves it.** Approval sets
   `Status: Approved`, `Approved by`, `Approved on`.
3. **Once approved, the whole scope is implemented in one pass**, with tests and every affected
   document, without stopping for per-step review.
4. **Agents never commit, push, rebase or switch branches.** The owner reviews the working tree
   and commits.
5. **An approved ADR's Decision is never edited**; it is superseded by a new ADR.
6. **Content within approved conventions needs no ADR.** Writing or updating a package's or
   project's pages is the site's normal work; deciding the conventions themselves is not.

What needs an ADR is the table in `AGENTS.md` §2. Anything that decides how private project
documentation is stored, built, served or searched always does.

## Options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A — ADR gate for every functional change | Decisions are explicit, reviewable and recorded; structural mistakes are caught before code | Ceremony on small features | Chosen |
| B — Code first, document after | Fast | Decisions are implicit; privacy and structure errors are found late | Rejected |
| C — ADRs only for "big" changes | Less ceremony | "Big" is judged by whoever wants to skip it | Rejected |

## Consequences

**Positive**

- Every decision has a record of why, which an agent in a later session can read.
- The owner controls scope change by change.

**Negative / accepted trade-offs**

- Small features carry an ADR's overhead. Accepted: the template keeps a small ADR small.

## Content invariants

Establishes the gate through which any departure from `AGENTS.md` §6 must pass.

## Security considerations

None directly — this is a process decision. It does make every later security decision pass
through the mandatory security section of an ADR (ADR-0005).

## Implementation notes

- [x] `AGENTS.md` §2–§3 describe the gate and execution rules.
- [x] `content/docs/documentation/adr/index.md` holds the index and the next free number.
- [x] `content/docs/documentation/_templates/adr.md` exists.
- Tests: not applicable (process only).

> Written together with the documents it governs, at the owner's direct request, so the
> implementation notes above are already done. If the owner rejects or changes this ADR, the
> documents are changed to match.

## Docs to update on implementation

- [ ] `content/docs/documentation/adr/index.md` — status on approval.
