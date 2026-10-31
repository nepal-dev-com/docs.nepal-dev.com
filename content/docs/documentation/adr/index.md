---
title: "Architecture Decision Records"
---

Every feature and functional change starts here
([ADR-0001](./ADR-0001-adr-driven-development-workflow.md)). Template:
[`../_templates/adr.md`](../_templates/adr.md).

**Next free number: 0012**

## Conventions

- File name: `ADR-NNNN-kebab-title.md`, numbered from the *next free number* above. Add the
  index row and bump the number **in the same change** that creates the file, so ADRs in flight
  cannot collide.
- Title: a short imperative statement of the decision ("Keep private project docs out of the
  public build").
- Status: `Proposed` → `Approved` (by the owner, with name and date) → optionally
  `Superseded by ADR-NNNN`. A rejected proposal is marked `Rejected` and kept.
- An approved ADR's **Decision** is never edited. Supersede it with a new ADR and cross-link
  both.
- The **Security considerations** section is mandatory
  ([ADR-0005](./ADR-0005-security-as-a-standing-practice.md)).

## Index

| ADR | Title | Status | Date |
|---|---|---|---|
| [0001](./ADR-0001-adr-driven-development-workflow.md) | Every change starts with an approved ADR | Proposed | 2026-10-31 |
| [0002](./ADR-0002-living-design-documentation.md) | Design documents are living snapshots, published as the Documentation project | Proposed | 2026-10-31 |
| [0003](./ADR-0003-code-comment-policy.md) | Comments explain why; every branch takes a block | Proposed | 2026-10-31 |
| [0004](./ADR-0004-ask-never-guess.md) | Resolve ambiguity by asking, never by guessing | Proposed | 2026-10-31 |
| [0005](./ADR-0005-security-as-a-standing-practice.md) | Security and privacy are a standing practice | Proposed | 2026-10-31 |
| [0006](./ADR-0006-agent-skills-are-advisory.md) | Agent skills are advisory; this repository's documentation is binding | Proposed | 2026-10-31 |
| [0007](./ADR-0007-tests-are-part-of-every-change.md) | Tests are part of every change | Proposed | 2026-10-31 |
| [0008](./ADR-0008-a-ui-change-ships-an-app-flow.md) | A UI change ships an app flow, drawn in Mermaid | Proposed | 2026-10-31 |
| [0009](./ADR-0009-trusted-agent-skills-are-vendored.md) | Trusted agent skills are vendored in `.claude/agent-skills/`, routed by an index | Proposed | 2026-10-31 |
| [0010](./ADR-0010-projects-document-themselves-through-a-submodule.md) | Projects document themselves here through a git submodule, one root folder each | Proposed | 2026-10-31 |
| [0011](./ADR-0011-archify-diagrams-are-published-as-standalone-pages.md) | Archify diagrams are published as standalone pages, linked from the page that keeps the Mermaid version | Proposed | 2026-10-31 |
