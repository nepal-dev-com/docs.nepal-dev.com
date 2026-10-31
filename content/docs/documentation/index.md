---
title: "Documentation"
---

How this site is built and decided: its decisions, design documents and security documents.
Each directory's `index.md` holds its own conventions. The rules behind this layout are
[ADR-0002](./adr/ADR-0002-living-design-documentation.md).

This project is about the site itself. Packages, libraries and other projects each have their
own pages in the rest of `content/docs/`.

## Three kinds of document

| Kind | Directory | Changes how |
|---|---|---|
| **Package and project documentation** | `content/docs/` outside `documentation/` | **The product.** Written and updated within the approved content conventions and the invariants in `AGENTS.md` §6. |
| **Decisions** | [`adr/`](./adr/index.md) | **Immutable once approved.** A change of mind is a new ADR that supersedes the old one. |
| **Design documents** | everything else here | **Living snapshots.** Describe the site as it stands right now, edited in place. What is no longer true is deleted, not annotated. |

How they relate:

```mermaid
flowchart LR
  N["Need<br/>a feature or a decision"] --> A["adr/<br/>Proposed ADR"]
  A -->|owner approves| I[Implementation]
  A -. written with .-> D["design documents<br/>app-flow · prd · dfd · …"]
  I -->|kept in sync| D
  I -->|content conventions| C["content/docs/<br/>published pages"]
```

## Directories

| Directory | Holds | Required when |
|---|---|---|
| [`adr/`](./adr/index.md) | Architecture Decision Records and their index | Every feature and functional change ([ADR-0001](./adr/ADR-0001-adr-driven-development-workflow.md)) |
| [`app-flow/`](./app-flow/index.md) | Mermaid flow + screen wireframes, one file per feature | Any ADR that changes something a person sees ([ADR-0008](./adr/ADR-0008-a-ui-change-ships-an-app-flow.md)) |
| [`prd/`](./prd/index.md) | Requirements and user stories | Any reader-facing feature |
| [`architecture/`](./architecture/index.md) | High-level design | A new module, content source, build step or external integration |
| [`erd/`](./erd/index.md) | Persisted data | The first ADR that stores data creates `erd/system.md` |
| [`dfd/`](./dfd/index.md) | Data flow diagrams with trust boundaries | Data crosses a trust boundary or reaches an external system |
| [`state/`](./state/index.md) | State machines | An entity with more than two states, or guarded / timed transitions |
| [`sequence/`](./sequence/index.md) | Sequence diagrams | Multi-actor, async, or retrying flows |
| [`api/`](./api/index.md) | Route handler and endpoint contracts | Anything another client or system calls |
| [`rbac/`](./rbac/index.md) | Access matrices | Visibility depends on who the reader is |
| [`security/`](./security/index.md) | Threat model, data classification, secrets, audit checklist | Always kept accurate; per-feature analyses when warranted |
| [`_templates/`](./_templates/index.md) | A starting point for each document type | — |

Agent skills are not part of this project. They are tooling for contributors, vendored in
`.claude/agent-skills/` outside `content/docs/`, so they are never published: `INDEX.md` routes
tasks to skills and `SOURCES.md` records provenance
([ADR-0009](./adr/ADR-0009-trusted-agent-skills-are-vendored.md)).

## Conventions for every design document

- **Frontmatter `title`**, no `#` heading; then the header: `Status`, `Last updated`, `Related ADRs`.
- **Snapshot, not changelog**: no revision tables, no "previously", no strikethrough.
- **Diagrams are Mermaid** in fenced blocks: flowcharts, sequences, state machines, ERDs and
  screen wireframes (`block-beta`). No binary or externally hosted images.
- **Sample values are invented**, never a real person's name, a client's name, a real token or
  a private project's details.
- **Links between documents are relative and start with `./` or `../`** (`./adr/index.md`), so the site resolves them to page URLs and they still work on GitHub.
- **Start from [`_templates/`](./_templates/index.md)**. If unsure whether a document is required, write it.
