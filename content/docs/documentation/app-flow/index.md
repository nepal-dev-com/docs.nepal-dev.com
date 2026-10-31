---
title: "App flows"
---

What a person sees and how they move through it — one file per feature, written with every ADR
that changes the UI ([ADR-0008](../adr/ADR-0008-a-ui-change-ships-an-app-flow.md)).

> **Living snapshots.** Edit in place so each file describes the system as it is right now. No
> revision tables, no "previously X, now Y" — delete what is no longer true
> ([ADR-0002](../adr/ADR-0002-living-design-documentation.md)).

## Conventions

- File name: `<feature-slug>.md`, matching the feature's PRD slug.
- Flow as a Mermaid `flowchart`; one Mermaid `block-beta` wireframe per screen, **phone width first**.
- Every screen lists its states: empty, loading, not found, refused, error, degraded, success.
  *Degraded* is what the person sees when an external service (search, for one) is
  unavailable: a clear notice, never a hang or a raw error.
- Sample values are invented: an example package name, never a private project's.
- Each page type names its Markdown entry point (`/docs/<slug>.md`), so readers and tools can
  take the content without the site.

**Template:** [`../_templates/app-flow.md`](../_templates/app-flow.md)

## Documents

| Document | Status | ADR |
|---|---|---|
| [Project root folders](./project-root-folders.md) | Draft | [ADR-0010](../adr/ADR-0010-projects-document-themselves-through-a-submodule.md) |
