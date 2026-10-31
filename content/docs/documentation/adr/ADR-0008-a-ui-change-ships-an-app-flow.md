---
title: "ADR-0008 — A UI change ships an app flow, drawn in Mermaid"
---

- **Status:** Proposed
- **Date:** 2026-10-31
- **Deciders:** Puncoz Nepal
- **Approved by:** —
- **Approved on:** —
- **Supersedes:** —
- **Superseded by:** —
- **Design documents:** `content/docs/documentation/app-flow/index.md`, `content/docs/documentation/_templates/app-flow.md`, `AGENTS.md` §2

## Context

An ADR's text says what is decided. It rarely shows what a reader will see, and UI mistakes
(a missing state, a confusing navigation, a buried install command) are cheapest to catch
before code. A documentation site lives or dies on how fast a reader gets from a search or a
package name to the snippet they need.

The owner wants diagrams, flows and screens drawn in **Mermaid**: flowcharts for flows and
`block-beta` diagrams for wireframes.

## Decision

1. **Any ADR that adds or changes something a person sees ships
   `content/docs/documentation/app-flow/<feature-slug>.md`**, reviewed together with the ADR.
2. It contains:
   - **entry points**, and who does not see the feature;
   - **the flow** as a Mermaid flowchart;
   - **one wireframe per screen** as a Mermaid `block-beta` diagram, phone width first, with
     invented sample values;
   - **each screen's states**: empty, loading, not found, refused, error, degraded, success.
3. **One file per feature, living** (ADR-0002): later ADRs that change the feature's UI edit it
   in place.
4. Not required for bug fixes, for content within the approved conventions, or for ADRs that
   change nothing visible. If unsure, write it.

## Options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A — Mermaid flow + `block-beta` wireframes | Matches the owner's instruction; renders on GitHub; diffs as text | `block-beta` is coarse for detailed layout | Chosen |
| B — Plain-text ASCII mockups | Precise layout; no renderer needed | Doesn't match the owner's instruction | Rejected |
| C — Design tool images | High fidelity | Binary, external, don't diff, drift | Rejected |

## Consequences

**Positive**

- The owner reviews what readers will see, not just what will be built.

**Negative / accepted trade-offs**

- Wireframes are approximate; visual design is decided in its own ADR(s).

## Content invariants

Supports §6.5 (every page readable as Markdown) by putting each page type's Markdown entry
points up for review with the screens.

## Security considerations

Wireframes use invented values only — never a private project's name or details.

## Implementation notes

- [x] `content/docs/documentation/app-flow/index.md` and `content/docs/documentation/_templates/app-flow.md` exist.
- [x] `AGENTS.md` §2 describes the requirement.
- Tests: not applicable (process only).

## Docs to update on implementation

- [ ] `content/docs/documentation/adr/index.md` — status.
